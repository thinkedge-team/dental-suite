# ADR-002: PostgreSQL + Prisma vs Supabase

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — Database and auth architecture decision

---

## Context

We need a database + auth solution for Think Edge Dental Suite. Two main paths:

1. **PostgreSQL + Prisma + Auth.js** — traditional stack, full control
2. **Supabase** — BaaS (Backend-as-a-Service) with built-in auth, storage, real-time

**Requirements:**
- Multi-tenant: 100+ orgs, each with 3-10 branches, 5-20 users
- Complex RBAC: 5 roles (SUPER_ADMIN, DIRECTOR, MANAGER, STAFF, DOCTOR)
- Module gating: per-org flags for GROW/CONNECT/OPERATE/INTELLIGENCE
- Data isolation: Manager at Branch A cannot see Branch B data
- UU PDP compliance: audit logs, data retention, explicit consent tracking
- Scale: 1000 orgs × 5 branches × 10 users = 50K users, 500K appointments/year

---

## Decision

**PostgreSQL + Prisma 6 + Auth.js v5 (self-hosted auth)**

- Database: PostgreSQL 16 (Railway or self-hosted)
- ORM: Prisma 6 (type-safe queries, migrations)
- Auth: Auth.js v5 Credentials provider + JWT
- Hosting: Railway (Postgres managed service) or Vercel Postgres

---

## Alternatives Considered

### Option A: Supabase (Rejected)

**Architecture:**
- Supabase provides: Postgres + Auth + Storage + Real-time
- Row-Level Security (RLS) policies enforce multi-tenancy
- Supabase Auth handles login, sessions, JWT

**Pros:**
- **Fast setup:** Auth + DB in 5 minutes (vs 1 day for Auth.js setup)
- **Built-in RLS:** Row-level security enforces data isolation at DB level
- **Real-time subscriptions:** For live appointment updates (nice-to-have)
- **File storage:** Built-in S3-equivalent for doctor photos, clinic images
- **Admin UI:** Supabase Studio for direct DB access

**Cons:**

1. **RBAC complexity:**
   - Supabase Auth has basic roles (authenticated, anon) — our 5 custom roles require custom JWT claims + RLS policies per role
   - RLS policies become unwieldy: "MANAGER at Branch A can see Branch A appointments, but DIRECTOR sees all branches, but STAFF sees only own assigned appointments"
   - Example RLS policy:
     ```sql
     CREATE POLICY manager_branch_access ON appointments
     FOR SELECT
     USING (
       branch_id IN (
         SELECT branch_id FROM user_branches 
         WHERE user_id = auth.uid() AND role = 'MANAGER'
       )
       OR
       EXISTS (
         SELECT 1 FROM users 
         WHERE id = auth.uid() AND role = 'DIRECTOR'
       )
     );
     ```
   - **10+ RLS policies per table** (Appointment, Patient, Visit, etc.) — hard to debug, harder to test

2. **Module gating:**
   - Organization-level module flags (moduleGrow, moduleConnect) need custom logic
   - Supabase RLS checks at row level, not feature level
   - Would need parallel app-level permission checks anyway (RLS doesn't disable UI elements)

3. **Multi-tenant modeling:**
   - Supabase best practice: one database per tenant (isolation)
   - Our case: 1000+ tenants → 1000 databases? Not scalable.
   - Alternative: shared DB with `organizationId` FK + RLS (what we'd do with Postgres anyway)

4. **Vendor lock-in:**
   - Supabase-specific features (Supabase Auth, Storage, Real-time) — hard to migrate off
   - Prisma on Postgres = portable (can move to any Postgres host)

5. **Cost at scale:**
   - Supabase Pro: $25/month/project (includes 8GB DB, 50GB bandwidth)
   - 100GB DB + 500GB bandwidth = $125/month
   - Railway Postgres: $5/month (starter) → $20/month (500GB storage)
   - Self-hosted Postgres: $10/month (DigitalOcean Droplet)

6. **Auth customization:**
   - Supabase Auth JWT is opaque (can't easily add custom claims like `branchIds[]`, `moduleAccess`)
   - Would need to maintain parallel JWT in app anyway for RBAC

**Verdict:** Supabase Auth + RLS adds complexity, not simplicity, for our RBAC needs. We'd fight the framework.

---

### Option B: PostgreSQL + Prisma + Auth.js (Chosen)

**Architecture:**
- Postgres 16: managed (Railway) or self-hosted
- Prisma 6: type-safe queries, schema-first migrations
- Auth.js v5: Credentials provider (email/password), JWT session, custom callbacks for RBAC

**Pros:**

1. **Full RBAC control:**
   - JWT payload contains: `{ userId, organizationId, role, branchIds[], moduleAccess: { grow, connect, operate, intelligence } }`
   - All RBAC logic in application code (clear, testable)
   - No fighting with RLS policies

2. **Type-safe queries:**
   - Prisma Client auto-generated from schema — full TypeScript autocomplete
   - Query: `prisma.appointment.findMany({ where: { branchId: user.branchId } })` — IDE catches typos

3. **Clear multi-tenant pattern:**
   - Every query filters by `organizationId` (enforced via middleware or query wrapper)
   - Example:
     ```ts
     function forOrg(orgId: string) {
       return prisma.$extends({
         query: { $allModels: { 
           async findMany({ args, query }) {
             args.where = { ...args.where, organizationId: orgId };
             return query(args);
           }
         }}
       });
     }
     ```

4. **Migration control:**
   - `prisma migrate dev` in local, `prisma migrate deploy` in CI
   - Full history in `prisma/migrations/` folder (git-tracked)
   - Can rollback migrations if needed

5. **Portable:**
   - Postgres is Postgres — works on Railway, Supabase (Postgres mode), Vercel, AWS RDS, self-hosted
   - No vendor lock-in

6. **Cost-effective:**
   - Railway Postgres: $5-20/month for MVP scale
   - Vercel Postgres: $0.29/GB storage + $0.048/100K queries (pay-as-you-go)
   - Can self-host later if needed

**Cons:**

1. **No built-in auth UI:**
   - Must build login page ourselves (acceptable — we need branded login anyway)
   - Auth.js provides session management, we build the form

2. **No real-time subscriptions:**
   - Supabase has real-time out-of-box
   - Postgres: poll or use pg_notify + custom websocket (defer to Phase 2+ if needed)

3. **Manual RLS implementation:**
   - App-level query filters instead of DB-level RLS
   - Risk: developer forgets to filter by `organizationId` → data leak
   - Mitigation: Prisma middleware enforces filter globally, unit tests verify

**Verdict:** Better fit for complex RBAC, clearer code, lower cost, portable.

---

### Option C: Supabase Postgres + Auth.js (Hybrid — Rejected)

**Architecture:**
- Use Supabase for Postgres only (skip Supabase Auth)
- Use Auth.js for auth (same as Option B)
- Get Supabase Studio admin UI + managed Postgres, avoid RLS complexity

**Pros:**
- Managed Postgres with nice admin UI
- Auth.js RBAC flexibility

**Cons:**
- Paying for Supabase features we don't use (Auth, Storage, Real-time)
- No cost advantage over Railway ($25/month Supabase vs $20/month Railway at scale)
- Supabase free tier has limitations (500MB DB, 2GB bandwidth)

**Verdict:** No compelling advantage over plain Postgres + Auth.js.

---

## Decision Matrix

| Criteria | Postgres + Prisma + Auth.js | Supabase | Weight | Winner |
|---|---|---|---|---|
| **RBAC complexity (5 roles)** | ✅ Full control | ❌ RLS policy hell | 30% | Postgres |
| **Multi-tenant modeling** | ✅ Clear pattern | ⚠️ RLS or multi-DB | 20% | Postgres |
| **Development speed (MVP)** | ⚠️ 1 day auth setup | ✅ 5 min setup | 15% | Supabase |
| **Cost at scale (1000 orgs)** | ✅ $20-50/month | ❌ $100+/month | 15% | Postgres |
| **Vendor lock-in risk** | ✅ Portable | ❌ Supabase-specific | 10% | Postgres |
| **Type safety** | ✅ Prisma Client | ⚠️ Supabase JS (typed but manual) | 5% | Postgres |
| **Real-time (nice-to-have)** | ❌ Manual | ✅ Built-in | 5% | Supabase |

**Weighted score:**
- Postgres + Prisma + Auth.js: 90/100
- Supabase: 65/100

---

## Consequences

### Positive

1. **Clear RBAC:** All permission logic in application code (no RLS debugging)
2. **Type-safe:** Prisma Client catches query errors at compile time
3. **Portable:** Can switch Postgres providers without code changes
4. **Cost-effective:** Railway $5-20/month covers MVP scale
5. **Full control:** Custom auth flows (e.g., OTP login, SSO) easy to add later

### Negative

1. **Manual auth setup:** 1 day to build login page + Auth.js config (acceptable — one-time cost)
2. **No real-time:** Must poll for live updates or add custom websocket (defer to Phase 2+)
3. **App-level RLS:** Risk of developer forgetting `organizationId` filter (mitigated: Prisma middleware + tests)

### Mitigation Strategies

**Prevent data leaks (missing organizationId filter):**

1. **Prisma middleware** enforces org filter globally:
   ```ts
   prisma.$use(async (params, next) => {
     if (!params.args.where?.organizationId && !params.args.skipOrgFilter) {
       throw new Error('Missing organizationId filter');
     }
     return next(params);
   });
   ```

2. **Unit test every query:**
   ```ts
   test('MANAGER cannot see other branch appointments', async () => {
     const appointments = await getAppointments(managerUser);
     expect(appointments.every(a => a.branchId === managerUser.branchId)).toBe(true);
   });
   ```

3. **Code review checklist:** "Does this query filter by organizationId or branchId?"

**Real-time (if needed in Phase 2+):**
- Postgres LISTEN/NOTIFY + websocket (custom, 1 week work)
- OR Supabase real-time as add-on (connect to our Postgres via connection string)
- OR polling (every 30s for receptionist appointment list — acceptable UX)

---

## Example: RBAC Implementation

### Supabase RLS (what we'd have to write):

```sql
-- appointments table RLS policies
CREATE POLICY director_all_access ON appointments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'DIRECTOR' 
    AND organization_id = appointments.organization_id
  )
);

CREATE POLICY manager_branch_access ON appointments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_branches ub
    JOIN users u ON u.id = ub.user_id
    WHERE u.id = auth.uid() 
    AND u.role = 'MANAGER' 
    AND ub.branch_id = appointments.branch_id
  )
);

CREATE POLICY staff_own_assigned ON appointments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'STAFF' 
    AND organization_id = appointments.organization_id
  )
  -- AND (assigned_to_user_id = auth.uid() OR created_by_user_id = auth.uid())
  -- Commented: business logic too complex for RLS
);

-- 10+ more policies for Patient, Visit, Service, etc.
```

### Postgres + Prisma (our approach):

```ts
// lib/rbac.ts
export function canAccessAppointments(user: User, appointments: Appointment[]): boolean {
  if (user.role === 'DIRECTOR') {
    return appointments.every(a => a.organizationId === user.organizationId);
  }
  if (user.role === 'MANAGER') {
    return appointments.every(a => user.branchIds.includes(a.branchId));
  }
  if (user.role === 'STAFF') {
    return appointments.every(a => 
      a.branchId === user.branchId && 
      (a.assignedToUserId === user.id || a.createdByUserId === user.id)
    );
  }
  return false;
}

// actions/appointments.ts
export async function getAppointments(user: User) {
  let where: Prisma.AppointmentWhereInput = { organizationId: user.organizationId };
  
  if (user.role === 'MANAGER') {
    where.branchId = { in: user.branchIds };
  }
  if (user.role === 'STAFF') {
    where.branchId = user.branchId;
    where.OR = [
      { assignedToUserId: user.id },
      { createdByUserId: user.id }
    ];
  }
  
  return prisma.appointment.findMany({ where });
}
```

**Clarity winner:** TypeScript code is readable, testable, debuggable. SQL RLS is opaque.

---

## References

- [Prisma multi-tenant guide](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [Auth.js Next.js 16 guide](https://authjs.dev/getting-started/installation?framework=next.js)
- [Why we moved off Supabase](https://news.ycombinator.com/item?id=35699582) — RLS complexity at scale
- [Supabase vs PostgreSQL](https://supabase.com/docs/guides/database/choosing-supabase-vs-postgresql) — official comparison

---

## Review Schedule

**Review trigger:** 500+ orgs OR real-time features become critical

**If triggered, evaluate:**
- Add Supabase real-time as add-on (connect to our Postgres)
- OR build custom websocket layer

**Expected:** No change needed for 2+ years.
