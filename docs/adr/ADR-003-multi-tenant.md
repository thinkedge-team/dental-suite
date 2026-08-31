# ADR-003: Multi-Tenant Architecture

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — Multi-tenancy strategy for 100+ dental clinic organizations

---

## Context

Think Edge Dental Suite serves multiple dental clinic organizations. Each organization:
- Has 3-10 branches
- Has 5-20 users (receptionists, doctors, managers, director)
- Owns their patient data, appointments, services

**Multi-tenancy requirement:** Organization A's data must be completely isolated from Organization B's data.

**Scale:** 
- Year 1: 50 organizations
- Year 3: 500-1000 organizations
- Total users: 50K
- Total appointments: 5M/year

**Two architectural approaches:**
1. **Per-org database** (one Postgres DB per client)
2. **Shared database with org-level partitioning** (all orgs in one DB, filtered by `organizationId`)

---

## Decision

**Shared database with per-org query filtering (default), with per-client deployment option for enterprise.**

**Default (SMB tier):**
- All organizations in one PostgreSQL database
- Every table has `organizationId` foreign key
- All queries filter by `organizationId` (enforced via Prisma middleware)
- Row-Level Security (RLS) as optional second layer of defense

**Enterprise option (10+ branches, isolated deployment):**
- Dedicated deployment (separate Vercel project + Railway DB)
- Same codebase, isolated data
- Custom domain (`klinik-abc.thinkedge.id` instead of `app.thinkedge.id/org/abc`)

---

## Alternatives Considered

### Option A: One Database Per Organization (Rejected)

**Architecture:**
- Each organization gets own PostgreSQL database
- Connection pooling routes to correct DB based on subdomain/org slug
- Example: `klinik-abc.thinkedge.id` → `dental_suite_abc` database

**Pros:**
- **True isolation:** Org A's data physically separate from Org B (no leak risk)
- **Per-client backup/restore:** Can restore Org A without touching Org B
- **Easier compliance:** Data residency requirements easier (Org A in Jakarta, Org B in Surabaya)
- **Performance isolation:** Slow query from Org A doesn't affect Org B

**Cons:**

1. **Operational nightmare:**
   - 1000 organizations = 1000 databases
   - Schema migration: must run on 1000 DBs sequentially (30 min+ deploy time)
   - Failed migration on DB #453? Manual rollback hell.
   - Monitoring: 1000 DB connections to track

2. **Cost:**
   - Railway charges per database: 1000 DBs × $5/month = $5000/month (vs $50 for shared DB)
   - Connection pooler required (Pgbouncer) — adds complexity

3. **Feature rollout:**
   - New feature: must verify works on all 1000 DBs
   - Data migration (e.g., add `Appointment.insuranceId`): 1000× slower

4. **Cross-org analytics:**
   - Think Edge wants aggregate metrics (average bookings per clinic, no-show rate by region)
   - Must query 1000 DBs and aggregate manually

5. **Testing complexity:**
   - Integration tests: must spin up new DB per test org (slow)
   - Seed data: 1000× duplication

**Verdict:** Doesn't scale operationally. Only makes sense for on-prem enterprise clients who demand physical isolation.

---

### Option B: Shared Database with organizationId Filtering (Chosen)

**Architecture:**
- One PostgreSQL database for all organizations
- Every table has `organizationId String @db.Uuid` foreign key to `Organization`
- Every query filters by `organizationId`:
  ```ts
  prisma.appointment.findMany({
    where: { organizationId: user.organizationId }
  })
  ```
- Prisma middleware enforces filter globally (catches missing filters)

**Pros:**

1. **Operational simplicity:**
   - One database to manage
   - Schema migration: run once, affects all orgs
   - Monitoring: one connection pool, one slow query log

2. **Cost-effective:**
   - Railway Postgres: $5-50/month for 1000 orgs (vs $5000 for per-org DBs)
   - Shared connection pool, shared cache

3. **Fast feature deployment:**
   - Add `Appointment.insuranceId`? One migration, 10 seconds.
   - New index? Applied once.

4. **Easy cross-org analytics:**
   - Aggregate query: `SELECT COUNT(*) FROM appointments GROUP BY organizationId`
   - Think Edge dashboards work out-of-box

5. **Simple testing:**
   - One test database, multiple test orgs
   - Seed data once, reuse across tests

6. **Backup/restore:**
   - One backup file covers all orgs
   - Point-in-time recovery works globally

**Cons:**

1. **Data leak risk:**
   - If developer forgets `organizationId` filter → Org A sees Org B's data
   - Mitigation: Prisma middleware throws error if filter missing

2. **Performance coupling:**
   - Slow query from Org A (1M appointments) slows Org B's queries
   - Mitigation: Query timeout (10s max), connection pooling, per-org query logging

3. **No physical isolation:**
   - All data in one DB — if DB compromised, all orgs affected
   - Mitigation: DB-level encryption, restrictive firewall rules, audit logs

4. **Compliance complexity:**
   - UU PDP requires data localization (Indonesian patient data in Indonesia)
   - Shared DB must be in Indonesian region (Jakarta) — not mix-and-match
   - Mitigation: Host in Railway Jakarta region or per-client deploy for non-ID clients

**Verdict:** Best fit for 95% of clients (SMB dental clinics). Offers per-client deploy override for enterprise.

---

### Option C: Postgres Schemas (One Schema Per Org) — Rejected

**Architecture:**
- One Postgres database, multiple schemas (namespaces)
- `klinik_abc.appointments`, `klinik_xyz.appointments`
- Connection pool switches schema: `SET search_path = klinik_abc;`

**Pros:**
- Logical isolation within one DB
- Easier cross-org queries than separate DBs (can JOIN across schemas)

**Cons:**
- Prisma doesn't natively support multi-schema (requires custom client per schema)
- Schema migrations still 1000× slower (must create table in each schema)
- Connection pool complexity (must track which connection is in which schema)
- No significant advantage over shared table + `organizationId` filter

**Verdict:** Complexity without benefit. Shared table is simpler.

---

## Decision Matrix

| Criteria | Shared DB + orgId | Per-Org DB | Postgres Schemas | Weight | Winner |
|---|---|---|---|---|---|
| **Operational simplicity** | ✅ One DB | ❌ 1000 DBs | ⚠️ 1000 schemas | 30% | Shared |
| **Cost** | ✅ $50/month | ❌ $5000/month | ⚠️ $50/month | 25% | Shared |
| **Data isolation** | ⚠️ Logical only | ✅ Physical | ⚠️ Logical | 20% | Per-Org |
| **Migration speed** | ✅ 10 seconds | ❌ 30+ minutes | ❌ 15+ minutes | 10% | Shared |
| **Cross-org analytics** | ✅ Single query | ❌ 1000 queries | ⚠️ Complex JOINs | 5% | Shared |
| **Compliance (data residency)** | ⚠️ All in one region | ✅ Per-region | ⚠️ All in one region | 5% | Per-Org |
| **Testing ease** | ✅ One test DB | ❌ 1000 test DBs | ⚠️ 1000 test schemas | 5% | Shared |

**Weighted score:**
- Shared DB + organizationId: 95/100
- Per-Org DB: 50/100
- Postgres Schemas: 55/100

---

## Implementation Details

### Prisma Schema Pattern

Every multi-tenant table includes:

```prisma
model Appointment {
  id             String       @id @default(cuid())
  organizationId String       @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  branchId       String       @db.Uuid
  branch         Branch       @relation(fields: [branchId], references: [id])
  
  // ... other fields
  
  @@index([organizationId, scheduledAt])
  @@index([branchId, scheduledAt])
  @@unique([doctorId, scheduledAt]) // prevent double-booking
}
```

**Key points:**
- `organizationId` is always indexed (hot query path)
- Composite indexes include `organizationId` first (query planner efficiency)
- `onDelete: Cascade` — deleting Organization deletes all related data (GDPR right-to-erasure)

---

### Query Filtering (Enforced)

**Prisma Middleware enforces organizationId:**

```ts
// lib/prisma.ts
export function getPrismaClient(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          // Inject organizationId filter if not present
          args.where = { ...args.where, organizationId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId };
          return query(args);
        },
        async findUnique({ args, query }) {
          // For findUnique by id, verify org ownership after query
          const result = await query(args);
          if (result && result.organizationId !== organizationId) {
            throw new Error('Access denied: resource belongs to different organization');
          }
          return result;
        },
        // Same for update, delete, etc.
      }
    }
  });
}
```

**Usage in Server Actions:**

```ts
// actions/appointments.ts
export async function getAppointments() {
  const session = await auth();
  const db = getPrismaClient(session.user.organizationId);
  
  // No need to manually add organizationId filter — middleware handles it
  return db.appointment.findMany({
    where: { branchId: session.user.branchId } // only need branch filter
  });
}
```

---

### Optional: Row-Level Security (Second Layer)

**Postgres RLS policies as defense-in-depth:**

```sql
-- Enable RLS on all multi-tenant tables
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see appointments from their org
CREATE POLICY org_isolation ON appointments
FOR ALL
USING (organization_id = current_setting('app.current_organization_id')::uuid);

-- Set org context at connection start
-- (Application sets this via: SET app.current_organization_id = '...')
```

**When to use RLS:**
- High-security clients (medical data, financial data)
- Compliance requirement for physical isolation proof
- Defense against SQL injection (even if query is compromised, RLS blocks cross-org access)

**When NOT to use RLS:**
- Adds query overhead (~5-10% slower)
- Complicates debugging (RLS policy errors are cryptic)
- Not needed if Prisma middleware is reliable (our case — we trust our code more than RLS policies)

**Decision:** RLS optional, off by default. Enable per-org via feature flag if client requests it.

---

### Enterprise Override: Per-Client Deployment

**For clients requiring physical isolation:**

**Setup:**
1. Spin up dedicated Vercel project: `klinik-abc-suite`
2. Dedicated Railway Postgres: `dental-suite-abc`
3. Custom domain: `app.klinik-abc.com`
4. Same codebase, different environment variables:
   ```
   DATABASE_URL=<dedicated-db>
   SINGLE_TENANT_MODE=true
   ORGANIZATION_ID=<locked-org-id>
   ```

**Benefits:**
- Physical data isolation (separate DB, separate infra)
- Custom domain (white-label)
- Independent scaling (large clinic with 50+ branches)
- Data residency (DB in client's preferred region)

**Cost:**
- Vercel Pro: $20/month
- Railway Postgres: $20/month
- Custom domain: $15/year
- **Total: ~$50/month per client** (acceptable for enterprise tier, 10+ branches)

**When to offer:**
- Client has 10+ branches (generates enough revenue to justify)
- Client requires data residency in specific region (e.g., Jakarta only)
- Client demands contractual guarantee of physical isolation (hospital, government clinic)

---

## Data Isolation Guarantees

### What We Guarantee (Shared DB):

1. **Logical isolation:** Org A's queries cannot return Org B's data (enforced by Prisma middleware + unit tests)
2. **Access control:** Only users with valid JWT for Org A can query Org A's data
3. **Audit trail:** Every data access logged (userId + organizationId + timestamp)
4. **Encryption at rest:** PostgreSQL data files encrypted (Railway default)
5. **Encryption in transit:** SSL/TLS for all DB connections

### What We DO NOT Guarantee (Shared DB):

1. **Physical isolation:** Org A and Org B data live in same DB file (acceptable for most clients, not hospitals)
2. **Independent backup/restore:** Cannot restore Org A without restoring Org B (all-or-nothing)
3. **Performance isolation:** Slow query from Org A may slow Org B's queries (mitigated: query timeout, connection limits)

### What We Guarantee (Per-Client Deploy):

1. **Physical isolation:** Org A's data in separate DB, separate server
2. **Independent backup/restore:** Restore Org A without touching Org B
3. **Performance isolation:** Org A's queries never affect Org B

---

## Testing Strategy

### Unit Tests (Verify Isolation):

```ts
test('Manager from Org A cannot see Org B appointments', async () => {
  const orgA = await createTestOrg();
  const orgB = await createTestOrg();
  
  const managerA = await createUser({ organizationId: orgA.id, role: 'MANAGER' });
  
  await createAppointment({ organizationId: orgB.id });
  
  const db = getPrismaClient(orgA.id);
  const appointments = await db.appointment.findMany();
  
  expect(appointments).toHaveLength(0); // Should not see Org B's appointment
});
```

### Integration Tests:

```ts
test('Prisma middleware blocks cross-org access', async () => {
  const orgA = await createTestOrg();
  const orgB = await createTestOrg();
  
  const appointmentB = await createAppointment({ organizationId: orgB.id });
  
  const dbA = getPrismaClient(orgA.id);
  
  await expect(
    dbA.appointment.findUnique({ where: { id: appointmentB.id } })
  ).rejects.toThrow('Access denied');
});
```

---

## Migration Path (If Needed)

**Scenario:** Client grows to 100+ branches, needs dedicated deployment.

**Migration steps:**
1. Create dedicated Vercel project + Railway DB
2. Export client's data: `pg_dump --schema-only --data-only -t appointments -t patients ... > client.sql`
3. Filter export by `organizationId = '<client-id>'`
4. Import to new DB: `psql <new-db> < client.sql`
5. Update DNS: point `app.klinik-abc.com` to new Vercel project
6. Delete client's data from shared DB (after verification period)

**Downtime:** <5 minutes (DNS propagation)

**Risk:** Low — same codebase, just different DB connection string.

---

## Consequences

### Positive

1. **Fast MVP:** Shared DB = one migration, one deploy, one database to manage
2. **Cost-effective:** $50/month supports 1000 orgs (vs $5000 for per-org DBs)
3. **Flexible:** Can offer per-client deploy for enterprise without architecture change
4. **Simple ops:** One DB to backup, monitor, optimize

### Negative

1. **Data leak risk:** Requires careful code review + middleware enforcement
2. **Compliance complexity:** Must host in Indonesian region (can't mix regions)
3. **Noisy neighbor:** Slow query from one org affects others (mitigated: timeouts, monitoring)

### Mitigation Strategies

**Prevent data leaks:**
- Prisma middleware enforces `organizationId` filter on every query
- Unit test every query for cross-org isolation
- PR review checklist: "Does this query filter by organizationId?"
- E2E test: create 2 orgs, verify Manager A cannot see Org B data

**Performance isolation:**
- Query timeout: 10 seconds max per query
- Connection pool limit: 20 connections per org (enforced via Pgbouncer)
- Slow query alerts: Sentry alert if query >2 seconds
- Per-org query logging: track which org generates slow queries

**Compliance (UU PDP):**
- Host DB in Railway Jakarta region (Indonesian data stays in Indonesia)
- Document data residency in Terms of Service
- Offer per-client deploy for clients with specific residency requirements

---

## References

- [AWS multi-tenancy best practices](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/multi-tenancy.html)
- [Prisma multi-tenancy guide](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [Slack's multi-tenant architecture](https://slack.engineering/how-slack-built-shared-channels/) — shared DB, billions of messages

---

## Review Schedule

**Review trigger:** 500+ organizations OR enterprise client requests dedicated deploy

**If triggered:**
- Audit per-org query performance (identify noisy neighbors)
- Consider sharding (split orgs across 2-3 DBs by region: Jakarta, Surabaya, Bali)
- Offer per-client deploy as premium tier ($50/month add-on)

**Expected:** Shared DB works for 2+ years, per-client deploy option available from Day 1.
