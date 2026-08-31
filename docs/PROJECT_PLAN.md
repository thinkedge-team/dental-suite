# Think Edge Dental Suite — Master Project Plan

> **This is the source of truth for the entire project lifecycle.**
> Every phase must complete its deliverables before the next phase begins.
> No implementation without research. No launch without testing and security check.

**Product:** Think Edge Dental Suite
**Positioning:** One platform, four sellable modules (GROW / CONNECT / OPERATE / INTELLIGENCE) for multi-branch dental clinic networks in Indonesia.
**Target clients:** Dental clinic chains with 3+ branches, operational complexity, manual booking & fragmented data.
**Stack locked:** Next.js 16 (App Router, TS, Tailwind v4) + PostgreSQL + Prisma 6 + Auth.js v5

---

## Lifecycle Overview

```
Phase 1: RESEARCH       → understand the real problem & the market
Phase 2: BRAINSTORMING  → define what to build and how
Phase 3: PLANNING       → spec every module, file-level architecture
Phase 4: IMPLEMENTATION → build module by module (phased)
Phase 5: TESTING        → unit, integration, E2E, load, accessibility
Phase 6: SECURITY CHECK → OWASP audit, pen-test surfaces, hardening
```

Each phase produces a concrete artifact (document, spec, test report, audit).
**No phase starts until the previous phase's artifacts are approved.**

---

## Phase 1 — RESEARCH

> **Goal:** Ground every product decision in real user behavior and real market data — not assumptions.

### 1.1 User Research

**Who to talk to (minimum 5 interviews per persona):**

| Persona | Role | What we need to learn |
|---|---|---|
| **Clinic Director / Owner** | buys the suite | Pain points with multi-branch visibility, reporting cadence, what they use today, what they'd pay |
| **Branch Manager** | daily OPERATE user | How they manage shifts, inventory orders, staff schedules manually today |
| **Receptionist / Front Desk** | daily CONNECT user | Booking flow today (WhatsApp, phone), common errors, patient no-shows, check-in friction |
| **Doctor** | schedule owner | How they communicate availability, what they hate about current booking |
| **Patient** | end user of GROW/CONNECT | How they find a clinic, book, get reminders, why they no-show |

**Interview question banks to draft:**
- [ ] Director interview guide (15 Q, ~45 min)
- [ ] Receptionist workflow shadowing checklist (observe, not just ask)
- [ ] Patient journey walkthrough (from Google search → appointment → post-visit)

**Deliverable:** `/docs/research/user-interviews.md` — anonymized findings per persona, top 5 pain points ranked by frequency.

---

### 1.2 Competitive Analysis

**What to map:**

| Competitor | Type | Modules | Pricing model | Weaknesses |
|---|---|---|---|---|
| Klinik+ / SimRS | Indonesian HIS/EMR | Ops + EMR | Per-seat or on-prem | No patient-facing booking, UI dated |
| Halodoc / Alodokter | Consumer booking app | Booking only | Commission-based | Not multi-branch CMS, no ops |
| Qontak | CRM + WA automation | CRM | Per-seat SaaS | No dental-specific, no booking |
| Doctolib (EU) | Full dental suite | All | Per-clinic SaaS | Not Indonesia, no Bahasa |
| Dental Intel (US) | Analytics only | Intelligence | Subscription | No Southeast Asia presence |
| Custom Excel/WA/Google Sheets | Status quo | None | Free | This is the real competitor |

**Deliverable:** `/docs/research/competitive-analysis.md`
- Feature matrix (which pillars each competitor covers)
- Pricing benchmark (per-seat, per-clinic, revenue-share)
- Positioning gap: where Think Edge wins

---

### 1.3 Regulatory & Compliance Research

Indonesia-specific dental clinic regulation affects what the platform must or must not do:

- [ ] **Rekam Medis (Medical Records)** — Permenkes No. 269/2008: what must be stored, retention period, who can access
- [ ] **Data Kesehatan & Privasi** — UU PDP (Personal Data Protection, 2022): consent requirements, data localization obligation
- [ ] **SIP/STR Dokter** — whether the platform needs to validate doctor licensing numbers
- [ ] **BPJS/Asuransi integration** — claim submission format, what data must accompany a claim
- [ ] **E-Resep** (if EMR scope expands) — Kemenkes e-prescription regulation

**Deliverable:** `/docs/research/regulatory.md` — checklist of requirements per module with "must have / nice to have / out of scope" classification.

---

### 1.4 Technical Discovery

Before designing, understand the existing technical landscape at target clients:

- [ ] What systems do clinics currently run? (Simpus, custom Excel, spreadsheets, Jurnal.id for accounting, fingerprint attendance)
- [ ] Network reliability at clinic branches (2G/3G/WiFi? — affects offline-first requirements)
- [ ] Device landscape (Android tablets at reception? iOS? Windows PC?)
- [ ] WhatsApp Business API access (most clinics use unofficial gateways — what's the compliant path?)
- [ ] Existing insurance partner portal integration patterns (EDI? API? manual submission?)

**Deliverable:** `/docs/research/technical-discovery.md`

---

### Phase 1 Exit Criteria

- [ ] Minimum 5 user interviews per persona completed
- [ ] Competitive analysis matrix complete
- [ ] Regulatory checklist approved by a legal/compliance reviewer
- [ ] Technical discovery summary written
- [ ] **Go/No-Go decision:** does the market need each of the 4 modules in the proposed form?

---

## Phase 2 — BRAINSTORMING

> **Goal:** Translate research findings into product decisions. Define WHAT we build (not HOW yet).

### 2.1 Module Scoping Sessions

One session per module (~2 hours each). Format: problem statement → user stories → must-have vs. defer list.

#### GROW — Patient Acquisition

Core questions:
- Is a website builder in scope, or do we only serve the CMS for their existing site?
- Which SEO features are must-have for Indonesian dental SEO (Google Maps optimization, schema markup, Bahasa language targeting)?
- Does GROW include managing Google Business Profile programmatically?
- What conversion events matter: WhatsApp click? Booking? Form fill?

User stories to validate:
- "As a clinic director, I want my branches to appear at the top of 'dokter gigi [kota]' Google searches."
- "As a receptionist, I want to update the doctor schedule on the website without calling IT."
- "As a patient, I want to see which insurance partners a clinic accepts before I go."

#### CONNECT — Appointment & Booking

Core questions:
- Real-time slot availability? Or best-effort (WA confirmation after)?
- Single-clinic booking or multi-branch search ("find me the nearest available doctor this week")?
- Patient identity: anonymous booking, or account-based (email/phone)?
- WA Business API or WA click-to-chat (wa.me) for reminders? (API costs IDR + requires Meta approval)
- Check-in flow: QR code? Name lookup? Walk-in support?
- Cancellation & rescheduling policy: who can reschedule? Window cutoff?

User stories to validate:
- "As a patient, I want to book a specific doctor at a specific branch for next Tuesday."
- "As a receptionist, I want to see today's appointment list and check patients in when they arrive."
- "As a doctor, I want to block a slot when I'm unavailable without asking the receptionist."

#### OPERATE — Clinic Operations

Core questions:
- Shift management: weekly recurring schedule, or ad-hoc daily scheduling?
- Inventory: consumption tracking (staff marks usage) or purchase-order workflow?
- Approval flow: branch → director, or branch → manager → director? What needs approval?
- Does OPERATE include payroll / compensation calculation, or only attendance tracking?
- Attendance: manual log-in or integration with biometric devices?

User stories to validate:
- "As a branch manager, I want to see which staff are scheduled this week and who called in sick."
- "As a receptionist, I want to log that we used 3 dental syringes today so inventory stays accurate."
- "As a director, I want to approve procurement requests from all branches in one dashboard."

#### INTELLIGENCE — Data & Analytics

Core questions:
- What are the 5 KPIs a director checks every Monday morning?
- Does INTELLIGENCE include a patient-facing portal (view history, download receipts)?
- Is EMR (electronic medical records, clinical notes) in scope for v1, or Phase 2+?
- Does INTELLIGENCE integrate with accounting software (Jurnal.id, Xero)?
- Who sees what: director sees all branches, manager sees own branch only?

User stories to validate:
- "As a director, I want to see total appointments booked, attended, and no-showed per branch this month."
- "As a doctor, I want to see my patient's previous treatment history before the consultation."
- "As a manager, I want to see which services generate the most revenue at my branch."

---

### 2.2 Patient Journey Mapping

Draw the end-to-end digital patient journey touching GROW → CONNECT → OPERATE → INTELLIGENCE:

```
[Discovery]
Patient searches "dokter gigi Jakarta Selatan"
→ Google Maps listing (GROW: GMB optimization)
→ Patient website (GROW: CMS)
  → Service pages, doctor profiles, insurance partners

[Booking]
→ "Buat Janji" button (CONNECT: booking widget)
→ Select branch → select doctor → select date/time
→ Fill name + phone
→ WA reminder sent 1 day before (CONNECT: notification)

[Visit]
→ Patient arrives, receptionist checks in (CONNECT: check-in)
→ Doctor records visit notes (OPERATE: if EMR in scope)
→ Invoice generated (OPERATE: billing — or deferred)

[Retention]
→ Follow-up reminder (CONNECT: post-visit WA)
→ Patient record updated (INTELLIGENCE: history)
→ Director sees +1 completed appointment in dashboard
```

**Deliverable:** `/docs/brainstorm/patient-journey.md` with annotated flow diagram (use Mermaid).

---

### 2.3 MVP vs. Full Suite Decision

After scoping sessions, vote on what ships in **MVP** vs. **later**:

| Feature | Module | MVP? | Rationale |
|---|---|---|---|
| CMS website with doctor/service/location | GROW | ✅ | Already built (Ocean Dental ref) |
| Google Maps / local SEO tooling | GROW | ⬜ | Research-dependent |
| Multi-branch real-time booking | CONNECT | ✅ | Core demo driver |
| WA click-to-chat reminders | CONNECT | ✅ | Cheap, no API approval needed |
| WA Business API reminders | CONNECT | ⬜ | Requires Meta approval + cost |
| Check-in / queue management | CONNECT | ✅ | High daily value |
| Doctor schedule self-management | CONNECT | ✅ | Removes receptionist bottleneck |
| Shift scheduling | OPERATE | ⬜ | Phase 2 |
| Inventory tracking | OPERATE | ⬜ | Phase 2 |
| Approval workflows | OPERATE | ⬜ | Phase 2 |
| Basic KPI dashboard | INTELLIGENCE | ⬜ | Phase 2 (needs CONNECT data first) |
| Patient records / visit history | INTELLIGENCE | ⬜ | Phase 3 (regulatory-gated) |
| EMR / clinical notes | INTELLIGENCE | ⬜ | Phase 3 |

**Deliverable:** `/docs/brainstorm/mvp-scope.md` — approved MVP feature list with explicit "out of scope for v1" list.

---

### 2.4 UX Direction Workshop

For each surface (patient web, staff portal, management console):
- Sketch the primary navigation structure
- Define the "zero state" (empty org, first-time setup wizard?)
- Define the critical path (the 3 actions a user does every single day)
- Agree on language: Bahasa Indonesia throughout, English admin labels, or mixed?
- Mobile-first? Tablet-first? Desktop-first? Per surface.

**Deliverable:** `/docs/brainstorm/ux-direction.md` — wireframe sketches per surface (low-fi, Figma or pen-scan), navigation maps.

---

### Phase 2 Exit Criteria

- [ ] Scoping sessions completed for all 4 modules
- [ ] Patient journey map reviewed and approved
- [ ] MVP feature list locked and signed off (no creep after this)
- [ ] UX direction agreed per surface
- [ ] **Go/No-Go:** does the MVP as defined deliver enough value to sell the first client?

---

## Phase 3 — PLANNING

> **Goal:** Translate product decisions into engineering specs. Every module gets a file-level implementation plan before a line of module code is written.

### 3.1 Architecture Decision Records (ADRs)

Write an ADR for each decision that is hard to reverse:

| ADR | Decision | Alternatives considered |
|---|---|---|
| ADR-001 | Single Next.js monolith vs. micro-frontends | Micro-frontends (rejected: too early, 2x ops cost) |
| ADR-002 | PostgreSQL + Prisma vs. Supabase | Supabase (rejected: RBAC + multi-tenant modeling is cleaner in-app) |
| ADR-003 | Multi-tenant per-org vs. per-client deployment | Per-client deploy (kept as option for isolated clients; per-org default) |
| ADR-004 | WhatsApp via wa.me vs. WA Business API | wa.me for MVP, API upgrade path documented |
| ADR-005 | Auth.js JWT vs. session-based auth | Session (rejected: JWT easier with RSC boundary) |
| ADR-006 | EMR scope — in vs. out of v1 | Deferred: regulatory complexity + Permenkes requirements |
| ADR-007 | On-prem vs. cloud deployment | Cloud-first (Vercel + Supabase or Railway), on-prem option documented for enterprise |

**Deliverable:** `/docs/adr/` — one file per ADR, standard format (Context / Decision / Consequences).

---

### 3.2 Data Model Finalization

Review the scaffold schema (`prisma/schema.prisma`) against MVP scope:

- [ ] Confirm all MVP models are present and correctly related
- [ ] Add missing fields surfaced by user research (e.g., `Appointment.insuranceId?`, `Doctor.sipNumber?`)
- [ ] Define enum values precisely (e.g., `AppointmentStatus` — does `CONFIRMED` require receptionist action or is it auto?)
- [ ] Add soft-delete (`deletedAt DateTime?`) to Patient and Visit (regulatory retention)
- [ ] Define index strategy for hot query paths:
  - Appointments by `[branchId, scheduledAt]` ✅ (already indexed)
  - Available slots: `[doctorId, branchId, dayOfWeek]` ✅
  - Patient lookup by phone: `[organizationId, phone]` ✅
- [ ] Migration strategy: always `prisma migrate dev` in dev, `prisma migrate deploy` in CI

**Deliverable:** `/docs/plan/data-model.md` — final schema rationale, index justification, migration plan.

---

### 3.3 Module Implementation Plans

One implementation plan per module, each saved to `docs/plan/`:

#### Plan A: `plan-core-auth.md`
- Organization + Branch CRUD (super-admin panel)
- User management + role assignment
- Login page + JWT session + middleware gating
- Module flag toggle per org (enables/disables nav)
- First-run setup wizard (create org → invite director)

#### Plan B: `plan-module-grow.md`
- Public patient website (home, services, doctors, locations, insurance partners)
- CMS admin (content management for website copy, images, promos)
- Doctor profile pages with specialty, schedule visibility
- SEO metadata per page (title, description, Open Graph, JSON-LD)
- Google Maps embed + branch location pages

#### Plan C: `plan-module-connect.md`
- Public booking flow: branch selector → doctor → date → time slot → patient form → confirmation
- Real-time slot availability check (no double-booking)
- Appointment management (receptionist view, status update, check-in)
- Doctor schedule self-management (block unavailable slots)
- WA click-to-chat reminder generation (wa.me link with pre-filled message)
- Cancellation flow (patient can cancel via link in WA message)

#### Plan D: `plan-module-operate.md`
- Shift scheduling (weekly template + daily exceptions)
- Staff attendance log
- Inventory item CRUD + stock adjustment log
- Low-stock alert (email/in-app notification when stock < minStock)
- Approval request workflow (create → manager review → director review)

#### Plan E: `plan-module-intelligence.md`
- Organization-level analytics dashboard (appointments booked, attended, no-show rate)
- Branch comparison view (director-only)
- Patient record list + visit history (requires CONNECT data)
- KPI trend charts (last 30/90 days)
- Data export (CSV) for reporting

**Format of each plan:** follows `writing-plans` skill structure — file map, TDD tasks, exact code stubs, commit checkpoints.

---

### 3.4 API Design

Define the internal API surface (Next.js Server Actions + Route Handlers):

- [ ] Public booking API: `POST /api/appointments` — rate-limited, no auth required
- [ ] Slot availability API: `GET /api/slots?doctorId=&branchId=&date=`
- [ ] Admin CRUD conventions (Server Actions, colocated with forms, no REST endpoints for internal)
- [ ] Webhook design for WA notifications (outbound only for MVP)
- [ ] Error response format: `{ error: string, code: string }` — consistent across all handlers

**Deliverable:** `/docs/plan/api-design.md`

---

### 3.5 DevOps & Deployment Plan

- [ ] Local dev: `docker compose` (Postgres + MailHog for email testing)
- [ ] CI: GitHub Actions — lint (`eslint`) + typecheck (`tsc --noEmit`) + unit tests on PR
- [ ] Staging: Railway (or Vercel + Supabase) — branch deploy from `staging` branch
- [ ] Production: per-client deployment (one Railway project per org) OR shared multi-tenant
- [ ] Database migration in CI: `prisma migrate deploy` pre-deploy step
- [ ] Secrets management: environment variables per environment (never committed)
- [ ] Monitoring: Sentry for errors, Vercel Analytics or Plausible for traffic

**Deliverable:** `/docs/plan/devops.md` + `docker-compose.yml` in repo root.

---

### Phase 3 Exit Criteria

- [ ] All 7 ADRs written and agreed
- [ ] Data model finalized (schema + rationale)
- [ ] 5 implementation plans written (core-auth, GROW, CONNECT, OPERATE, INTELLIGENCE)
- [ ] API design agreed
- [ ] DevOps plan agreed + `docker-compose.yml` ready
- [ ] **Engineering estimate per module** (days, not hours) attached to each plan

---

## Phase 4 — IMPLEMENTATION

> **Goal:** Build module by module, in order of business value. Each module must be tested before the next begins.

### Sequence (non-negotiable order — each module depends on the previous)

```
Sprint 0: FOUNDATION (1–2 weeks)
  → Core auth: login, RBAC, org/branch/user CRUD, module flags
  → CI/CD pipeline live
  → docker-compose.yml for local dev
  → Seed script: demo org + branches + users + services

Sprint 1: GROW (2–3 weeks)
  → Patient website: public pages (home, services, doctors, locations)
  → CMS admin: content management for all public pages
  → SEO: metadata, Open Graph, JSON-LD structured data

Sprint 2: CONNECT (3–4 weeks)
  → Booking flow: public slot availability + booking form
  → Receptionist portal: appointment list, check-in, status update
  → Doctor self-scheduling: block unavailable slots
  → WA click-to-chat reminder
  → Cancellation flow

Sprint 3: OPERATE (3–4 weeks)
  → Shift scheduling: weekly template
  → Inventory: stock log + low-stock alerts
  → Approval workflow: procurement request + review

Sprint 4: INTELLIGENCE (2–3 weeks)
  → Analytics dashboard: KPIs, branch comparison
  → Patient record: visit history
  → CSV export

Sprint 5: POLISH (1–2 weeks)
  → Mobile responsiveness audit (all surfaces)
  → Empty states, loading states, error states
  → Onboarding wizard for new orgs
  → i18n review (Bahasa Indonesia consistency)
```

### Coding Standards (all sprints)

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Every Server Action validated with Zod before DB write
- Every DB write in a try/catch with structured error logging
- Prisma queries: always `select` explicit columns on list queries (no `findMany()` without `select`)
- No secrets in code — all config via `process.env`
- Commit on every passing test (not at end of day)
- PR required for every sprint boundary — no direct push to `main`

---

## Phase 5 — TESTING

> **Goal:** Every module is tested before the next sprint begins and before production deployment.

### 5.1 Unit Tests

**Framework:** Vitest (faster than Jest, same API, native TS)

What to unit-test:
- [ ] Auth: `authorize()` callback — correct password → user object, wrong password → null, inactive user → null
- [ ] Slot availability logic: overlapping appointments, edge of day, timezone handling
- [ ] Module flag gating: org with `moduleConnect=false` → booking endpoint returns 403
- [ ] Zod schemas: valid booking payload passes, missing phone fails, future date passes, past date fails
- [ ] Inventory: stock below minStock → alert flag set correctly
- [ ] RBAC: MANAGER cannot access org-wide analytics route (middleware test)

**Coverage target:** 80% for business logic files (`src/lib/`, `src/actions/`)

---

### 5.2 Integration Tests

**Framework:** Vitest + testcontainers (real Postgres in Docker, not mocks)

What to integration-test:
- [ ] Booking creation → appointment record in DB → no double-booking for same slot
- [ ] Check-in → appointment status updates to `CHECKED_IN` → timestamp recorded
- [ ] Doctor blocks a slot → that slot no longer appears in public availability
- [ ] Inventory stock update → history log entry created
- [ ] Approval request created by STAFF → visible to MANAGER of same branch, not other branches

---

### 5.3 End-to-End Tests

**Framework:** Playwright (already in the ecosystem for Indonesian market apps)

**Critical paths (must pass before every production deploy):**

| E2E Test | Steps | Pass Criteria |
|---|---|---|
| Patient books appointment | Load booking page → select branch → select doctor → pick date → fill form → submit | Confirmation page shown, appointment in DB |
| Receptionist checks in patient | Login as STAFF → open today's appointments → click check-in → confirm | Status = CHECKED_IN in DB |
| Director views dashboard | Login as DIRECTOR → navigate to dashboard → KPI cards load | No console errors, data visible |
| Manager adds inventory item | Login as MANAGER → inventory → add item → set min stock | Item visible in list |
| Doctor blocks unavailable slot | Login as DOCTOR → schedule → block Tuesday 14:00 → public booking hides that slot | Slot not bookable |

**Run:** on every PR to `main` in CI (GitHub Actions, ~5 min budget)

---

### 5.4 Performance Testing

**Tool:** k6 (load test) + Lighthouse (web vitals)

Targets:
- Booking API: 100 concurrent requests → p95 response < 500ms
- Public patient website: Lighthouse Performance score > 90 (mobile)
- Slot availability query: < 100ms for a 30-day window per doctor

---

### 5.5 Accessibility Testing

- WCAG 2.1 AA as minimum for all public-facing pages (patient web)
- Axe-core automated scan in Playwright E2E
- Manual keyboard navigation check on booking flow
- Color contrast ratios: all text > 4.5:1

---

### Phase 5 Exit Criteria

- [ ] Unit tests pass with ≥ 80% coverage on business logic
- [ ] Integration tests pass (real Postgres)
- [ ] All 5 critical-path E2E tests pass in CI
- [ ] Lighthouse mobile score ≥ 90 for patient web
- [ ] No WCAG AA violations in axe-core scan
- [ ] Load test passes (100 RPS on booking API)

---

## Phase 6 — SECURITY CHECK

> **Goal:** The platform handles medical data and patient PII. Ship nothing that can be exploited.

### 6.1 OWASP Top 10 Checklist

| Risk | Check | How |
|---|---|---|
| A01 Broken Access Control | DIRECTOR cannot see other org's data; MANAGER cannot see other branches | Integration test: cross-org query returns 0 rows |
| A02 Cryptographic Failures | Passwords hashed with bcrypt (cost ≥ 12); JWT secret ≥ 32 bytes random; HTTPS enforced | Code review + env audit |
| A03 Injection | All DB queries via Prisma parameterized — no raw SQL with user input | AST scan: no `prisma.$queryRaw` with template literals |
| A04 Insecure Design | Booking endpoint rate-limited (max 10 req/min per IP); no enumerable IDs (cuid not sequential int) | Middleware rate limit + cuid audit |
| A05 Security Misconfiguration | No debug routes in production; `NODE_ENV=production` on deploy; no stack traces in API responses | CI env check |
| A06 Vulnerable Components | `npm audit` on every CI run; Dependabot enabled | GitHub Dependabot alerts |
| A07 Auth Failures | Brute-force protection on `/login`; session invalidation on password change | Rate limit on auth + test |
| A08 Software/Data Integrity | Prisma migrations reviewed before apply; no `eval()` or dynamic code | PR review checklist |
| A09 Logging Failures | Auth events logged (login, failed login, password change); no PII in logs | Sentry integration + log audit |
| A10 SSRF | No user-supplied URLs fetched server-side (GROW SEO links go to client-side only) | Code audit |

---

### 6.2 Patient Data Protection (UU PDP / GDPR-equivalent)

- [ ] Patient consent recorded at booking (checkbox, stored in DB with timestamp)
- [ ] Right to erasure: `DELETE /api/patient/me` removes PII, replaces with anonymized token
- [ ] Data retention policy: medical records retained for minimum 5 years (Permenkes 269/2008) — soft-delete only
- [ ] Data access log: who accessed which patient record and when (audit trail in DB)
- [ ] No patient PII sent to third-party analytics (Plausible is privacy-first — acceptable; GA is not)

---

### 6.3 Infrastructure Security

- [ ] Database: not publicly accessible (only accessible from app server via private network)
- [ ] Secrets: never in git history (check with `git log -S "password"` + `truffleHog` scan)
- [ ] HTTP headers: `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Content-Security-Policy` set in Next.js config
- [ ] File uploads (doctor photos, CMS images): stored in object storage (S3/R2), not local disk; type validation server-side; size limit enforced
- [ ] CORS: API routes accept requests only from the app's own origin (no wildcard `*`)

---

### 6.4 Penetration Test Surface

Before first client deployment, manually test:
- [ ] IDOR: can receptionist A (Branch X) access appointments of Branch Y by changing URL IDs?
- [ ] Auth bypass: what happens if JWT is expired or tampered?
- [ ] Mass assignment: does the booking API accept `organizationId` in the request body and trust it?
- [ ] Booking slot conflict: can two simultaneous requests book the same slot? (race condition)
- [ ] WA link injection: can a patient inject `\n` into their name to forge the WA message content?

---

### Phase 6 Exit Criteria

- [ ] OWASP Top 10 checklist signed off
- [ ] UU PDP data protection requirements implemented
- [ ] Infrastructure security checklist passed
- [ ] All pen-test surfaces verified clean
- [ ] `npm audit` — 0 critical, 0 high vulnerabilities
- [ ] Security review report written: `/docs/security/security-review.md`

---

## Deliverables Map

```
docs/
├── research/
│   ├── user-interviews.md
│   ├── competitive-analysis.md
│   ├── regulatory.md
│   └── technical-discovery.md
├── brainstorm/
│   ├── patient-journey.md       (Mermaid flow)
│   └── mvp-scope.md             (locked feature list)
├── adr/
│   ├── ADR-001-monolith.md
│   ├── ADR-002-postgres.md
│   ├── ADR-003-multi-tenant.md
│   ├── ADR-004-whatsapp.md
│   ├── ADR-005-auth.md
│   ├── ADR-006-emr-scope.md
│   └── ADR-007-deployment.md
├── plan/
│   ├── data-model.md
│   ├── api-design.md
│   ├── devops.md
│   ├── plan-core-auth.md
│   ├── plan-module-grow.md
│   ├── plan-module-connect.md
│   ├── plan-module-operate.md
│   └── plan-module-intelligence.md
└── security/
    └── security-review.md       (written in Phase 6)
```

---

## Timeline Estimate

| Phase | Duration | Blocker |
|---|---|---|
| Phase 1 Research | 2–3 weeks | Access to real clinic contacts for interviews |
| Phase 2 Brainstorming | 1 week | Research findings in hand |
| Phase 3 Planning | 1–2 weeks | MVP scope locked |
| Phase 4 Implementation | 12–14 weeks | Plans approved, local env ready |
| Phase 5 Testing | Parallel with Phase 4 (per sprint) | CI pipeline live from Sprint 0 |
| Phase 6 Security | 1 week | All features complete |
| **Total** | **~20 weeks** | |

**First demoable milestone:** end of Sprint 2 (GROW + CONNECT) — a clinic can book appointments through a real website. ~7–8 weeks from Phase 4 start.

---

## What's Done Already

The scaffold commit delivers:
- ✅ Repo created: `github.com/thinkedge-team/dental-suite`
- ✅ Stack locked: Next.js 16 + Prisma 6 + Auth.js v5 + PostgreSQL
- ✅ Schema drafted: all 4 module models exist (will be finalized in Phase 3)
- ✅ Route groups stubbed: (marketing) / (portal) / (auth)
- ✅ RBAC roles defined: SUPER_ADMIN / DIRECTOR / MANAGER / STAFF / DOCTOR
- ✅ Build passes, TypeScript clean

The scaffold is a technical stake in the ground — **no production code yet**. Phase 1 research may change the schema, the module scope, or the MVP sequence. That's expected and fine.

---

## Next Action

**Phase 1 starts now.** The first concrete action:
1. Draft the Director interview guide (`docs/research/user-interviews.md`)
2. Schedule 5 clinic contacts for discovery calls
3. Run the competitive analysis matrix

No code until Phase 3 plans are approved.
