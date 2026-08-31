# ADR-001: Single Next.js Monolith vs Micro-Frontends

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — Architecture decision for Think Edge Dental Suite MVP

---

## Context

We're building a 4-module SaaS platform (GROW, CONNECT, OPERATE, INTELLIGENCE) for Indonesian dental clinic networks. We need to decide the frontend architecture: single Next.js monolith or micro-frontends.

**Scale expectations:**
- MVP: 5-10 pilot clinics
- Year 1: 50-100 clinics
- Year 3: 500-1000 clinics
- Each clinic: 3-10 branches, 5-20 users

**Team size:**
- Current: 1-2 developers (Think Edge)
- Year 1: 3-5 developers

**Module characteristics:**
- All modules share: authentication, user management, org/branch context
- High UI overlap: same design system, nav structure, RBAC
- Data dependencies: INTELLIGENCE reads CONNECT/OPERATE data
- Low deployment independence: modules sold as package, rarely à la carte

---

## Decision

**Single Next.js monolith with modular code structure.**

All 4 modules live in one Next.js 16 (App Router) application, organized by domain but deployed as one artifact.

```
src/
├── app/
│   ├── (marketing)/          # GROW: public patient website
│   ├── (portal)/              # CONNECT + OPERATE + INTELLIGENCE: staff portal
│   └── (auth)/                # Login, shared across all modules
├── components/
│   ├── grow/                  # GROW-specific components
│   ├── connect/               # CONNECT-specific components
│   ├── operate/               # OPERATE-specific components
│   ├── intelligence/          # INTELLIGENCE-specific components
│   └── ui/                    # Shared design system (shadcn/ui)
├── lib/
│   ├── grow/                  # GROW business logic
│   ├── connect/               # CONNECT business logic
│   ├── operate/               # OPERATE business logic
│   └── intelligence/          # INTELLIGENCE business logic
└── actions/                   # Server Actions per module
```

**Module gating:** Organization model has `moduleGrow`, `moduleConnect`, `moduleOperate`, `moduleIntelligence` boolean flags. Middleware + UI conditionally render features based on flags.

---

## Alternatives Considered

### Option A: Micro-Frontends (Rejected)

**Architecture:**
- 4 separate Next.js apps (one per module)
- Shared auth + design system via npm packages
- Shell app orchestrates module loading
- Module federation or iframe-based composition

**Pros:**
- True module independence (deploy GROW without touching CONNECT)
- Team autonomy (different teams own different modules)
- Technology flexibility (could use Vue for one module if needed)

**Cons:**
- **2x operational complexity:** 4 repos, 4 CI/CD pipelines, 4 deployments
- **Shared state hell:** Cross-module navigation (GROW → CONNECT booking) requires coordination
- **Duplicated auth logic:** Every module re-implements session check, RBAC
- **Build overhead:** Shared design system updates = 4 PRs across 4 repos
- **Debugging nightmare:** User reports bug, which module? Which version deployed?
- **Team size mismatch:** Micro-frontends designed for 10+ developers per module, we have 1-2 total
- **Overkill for scale:** Even at 1000 clinics, we're serving <20K active users — single Next.js handles this easily

**Cost analysis:**
- 4 Vercel deployments: 4x $20/month = $80/month (vs $20 monolith)
- 4x build time in CI (wasted GitHub Actions minutes)
- Developer time: 30% overhead managing cross-module changes

**Verdict:** Not justified for team size, scale, or module coupling.

---

### Option B: Modular Monolith (Chosen)

**Architecture:**
- Single Next.js app
- Code organized by module (`src/lib/grow/`, `src/lib/connect/`, etc.)
- Shared auth, DB, design system (no duplication)
- Module flags control feature visibility per org

**Pros:**
- **Simple:** 1 repo, 1 deploy, 1 CI pipeline
- **Fast dev velocity:** Change design system → affects all modules instantly
- **Shared context:** User, org, branch context flows seamlessly across modules
- **Easy cross-module features:** GROW "Buat Janji" button → CONNECT booking widget (just a route)
- **Lower cost:** 1 Vercel deployment ($20-50/month), 1 database, 1 monitoring setup
- **Team-appropriate:** 1-2 developers can work across all modules without context switching hell
- **Easy to split later:** If we hit scale issues (unlikely), can extract modules to separate apps (but keep monolith for pilot/SMB tier)

**Cons:**
- **Deploy all or nothing:** Hotfix in CONNECT requires full deploy (mitigated: Next.js build is fast, <2 min)
- **Potential for spaghetti:** Developers might create tight coupling across modules (mitigated: enforce folder structure via linting)
- **Shared failure domain:** Bug in OPERATE crashes entire portal (mitigated: error boundaries per module route)

**Verdict:** Best fit for current team size, scale, and module interdependence.

---

### Option C: Plugin Architecture (Rejected)

**Architecture:**
- Core platform + modules as plugins (dynamic import)
- Plugins declare hooks (e.g., `registerNavItem()`, `registerRoute()`)
- Modules installed/uninstalled at runtime

**Pros:**
- True modularity (install only needed modules)
- Extensibility (third-party could build modules)

**Cons:**
- **Massive engineering investment:** Plugin system itself = 4-6 weeks work
- **TypeScript complexity:** Dynamic imports lose type safety
- **No demand:** Clients want all 4 modules packaged, not à la carte assembly
- **Premature abstraction:** We don't know plugin boundaries yet (only have 4 modules)

**Verdict:** Overkill. YAGNI.

---

## Consequences

### Positive

1. **Fast MVP delivery:** No cross-repo coordination overhead, ship in 8 weeks
2. **Low operational burden:** 1 deployment, 1 DB, 1 monitoring dashboard
3. **Seamless UX:** Patient books on GROW website → lands in CONNECT booking flow (same session, no handoff)
4. **Code reuse:** Shared utilities (date formatting, phone validation, RBAC checks) live once
5. **Easy refactors:** Rename a Prisma model → update all modules in one commit
6. **Lower hosting cost:** $20-50/month Vercel vs $80+ for 4 separate apps

### Negative

1. **All-or-nothing deploy:** Can't deploy CONNECT hotfix without deploying GROW (acceptable — Next.js builds are fast, <2 min)
2. **Coupling risk:** Developers might create dependencies between modules (mitigation: code review + folder structure linting)
3. **Single failure domain:** Bug in one module could crash entire app (mitigation: error boundaries per route, separate monitoring per module)

### Mitigation Strategies

**Prevent coupling:**
- ESLint rule: `no-restricted-imports` — GROW cannot import from CONNECT (only shared UI/utilities)
- Folder structure: `src/lib/grow/` is self-contained, no cross-references
- PR review checklist: "Does this change affect other modules? Why?"

**Error isolation:**
- React error boundary per module route (`/portal/grow/*`, `/portal/connect/*`)
- If OPERATE crashes, CONNECT still works
- Sentry tags errors by module for triage

**Future split path (if needed):**
- Monolith serves 90% of clients (SMB tier)
- Extract INTELLIGENCE to separate app for enterprise clients (50+ branches, heavy analytics)
- Keep shared auth/DB, modules communicate via API

---

## Decision Matrix

| Criteria | Monolith | Micro-Frontends | Plugin Arch | Weight | Winner |
|---|---|---|---|---|---|
| **Team size (1-2 devs)** | ✅ Simple | ❌ Too complex | ❌ Too complex | 30% | Monolith |
| **Time to MVP** | ✅ 8 weeks | ❌ 12+ weeks | ❌ 14+ weeks | 25% | Monolith |
| **Operational cost** | ✅ $20/month | ❌ $80/month | ⚠️ $50/month | 15% | Monolith |
| **Module independence** | ⚠️ Deploy all | ✅ Deploy per module | ✅ Dynamic load | 10% | Micro |
| **Cross-module UX** | ✅ Seamless | ❌ Complex handoff | ⚠️ Plugin hooks | 10% | Monolith |
| **Scalability (1000 clinics)** | ✅ 20K users OK | ✅ Over-engineered | ⚠️ Untested | 5% | Monolith |
| **Future extensibility** | ⚠️ Can split later | ✅ Already split | ✅ Plugin system | 5% | Micro |

**Weighted score:**
- Monolith: 95/100
- Micro-Frontends: 60/100
- Plugin Architecture: 55/100

---

## References

- [Shopify monolith case study](https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity) — 500+ engineers, still monolith core
- [Next.js at scale](https://vercel.com/blog/how-to-scale-nextjs) — handles millions of users in single deployment
- [Modular monolith pattern](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer) — code organization without micro-frontend overhead

---

## Review Schedule

**Review trigger:** 100+ clinic clients OR 10+ developers on team

**If triggered, evaluate:**
- Split INTELLIGENCE to separate app (heaviest analytics load)
- Keep GROW + CONNECT + OPERATE monolith (core workflows)

**Expected:** No split needed for 3+ years.
