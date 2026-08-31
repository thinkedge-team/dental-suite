# Implementation Plan: Core Platform & Auth (Sprint 0)

> **Phase 3.3 Deliverable**
> Detailed file map, Server Actions, data flows, and test criteria for Sprint 0 Foundation.

---

## 1. Goal & Scope

Deliver the multi-tenant core platform foundation:
1. Complete database schema migration with finalized models & indexes.
2. Robust Auth.js v5 authentication with JWT sessions + RBAC enforcement.
3. Organization & Branch management (CRUD + module flag toggles).
4. Staff & User management (invite, role assignment, branch assignment).
5. Comprehensive seed script for demo & test environments.
6. CI/CD test automation baseline.

---

## 2. File Map

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Clean login screen (Email + Password)
│   │   └── layout.tsx                # Centered, minimal auth layout
│   ├── (portal)/
│   │   ├── layout.tsx                # App shell: Sidebar, Header, Org/Branch context
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Role-aware landing overview
│   │   ├── settings/
│   │   │   ├── organization/
│   │   │   │   └── page.tsx          # Org metadata & module toggle flags (DIRECTOR/SUPER_ADMIN)
│   │   │   ├── branches/
│   │   │   │   ├── page.tsx          # Branch listing & status overview
│   │   │   │   └── [branchId]/
│   │   │   │       └── page.tsx      # Branch edit form (hours, address, contact)
│   │   │   └── users/
│   │   │       ├── page.tsx          # User management table & role assignment
│   │   │       └── new/
│   │   │           └── page.tsx      # Add/invite staff member form
│   │   └── setup/
│   │       └── page.tsx              # First-run onboarding wizard for new clinic orgs
├── actions/
│   ├── auth.ts                       # Login, Logout, Session refresh actions
│   ├── organization.ts               # Org profile & module toggle Server Actions
│   ├── branch.ts                     # Branch CRUD Server Actions
│   └── user.ts                       # User CRUD & role assignment Server Actions
├── lib/
│   ├── prisma.ts                     # Singleton Prisma client instance
│   ├── rbac.ts                       # Role-Based Access Control permission matrix
│   └── validations/
│       ├── auth.ts                   # Login Zod schema
│       ├── organization.ts           # Org Zod schema
│       ├── branch.ts                 # Branch Zod schema
│       └── user.ts                   # User Zod schema
├── components/
│   ├── portal/
│   │   ├── sidebar.tsx               # Dynamic navigation filtered by module flags & user role
│   │   ├── header.tsx                # User badge, branch selector, logout button
│   │   └── module-guard.tsx          # Wrapper preventing access to disabled modules
│   └── ui/                           # Reusable UI components (Button, Input, Card, Modal, Table, Toast)
├── auth.ts                           # NextAuth configuration with credentials provider & JWT callbacks
├── auth.config.ts                    # Edge-compatible middleware authorization rules
└── middleware.ts                     # Global middleware routing protection
```

---

## 3. Data Flow & Security

### 3.1 Authentication & Session Life Cycle
1. **Login Submission:** User submits credentials at `(auth)/login`.
2. **Password Verification:** Auth.js invokes `authorize()` in `src/auth.ts`, validates input with Zod, and verifies bcrypt hash.
3. **JWT Generation:** JWT callback packs `{ userId, organizationId, role, branchId, moduleAccess }` into signed httpOnly cookie.
4. **Middleware Protection:** `src/middleware.ts` intercepts `/portal/*` requests:
   - Verifies JWT presence and validity.
   - Blocks unauthorized roles (e.g., non-admin visiting `/portal/settings/organization`).
   - Checks if the requested module route is enabled on `moduleAccess`.
5. **RSC Context:** React Server Components call `await auth()` to query data scoped strictly to `session.user.organizationId`.

### 3.2 RBAC Permission Matrix

| Resource / Action | SUPER_ADMIN | DIRECTOR | MANAGER | STAFF | DOCTOR |
|---|---|---|---|---|---|
| Manage Org & Module Flags | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create / Edit Branches | ✅ | ✅ | ⚠️ Own Branch | ❌ | ❌ |
| Manage Staff & Assign Roles | ✅ | ✅ | ⚠️ Own Branch (Staff only) | ❌ | ❌ |
| Access Settings | ✅ | ✅ | ⚠️ Limited | ❌ | ❌ |
| Access Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 4. Step-by-Step Implementation Tasks

### Task 1: Finalize & Run Schema Migration
- Update `prisma/schema.prisma` with all Phase 3 models (`InsurancePartner`, `ScheduleBlock`, `Patient` consent/soft-delete, `Appointment` updates).
- Execute `npx prisma migrate dev --name "init_phase3_core_schema"`.
- Verify TypeScript client generation at `src/generated/prisma`.

### Task 2: Complete Auth.js v5 RBAC Setup
- Implement `src/lib/validations/auth.ts` with strict Zod types.
- Ensure `src/auth.ts` and `src/auth.config.ts` propagate `role`, `organizationId`, `branchId`, and `moduleAccess`.
- Add unit tests validating:
  - Successful login with correct password.
  - Rejection with invalid password or inactive user.
  - Correct JWT structure and claims.

### Task 3: Build Portal Shell & Dynamic Navigation
- Implement `src/components/portal/sidebar.tsx`:
  - Renders GROW, CONNECT, OPERATE, INTELLIGENCE links only if org module flags are true.
  - Hides administrative sections from STAFF and DOCTOR roles.
- Implement `src/components/portal/header.tsx` with user role indicator and branch context.

### Task 4: Organization & Branch Management Actions
- Implement Server Actions in `src/actions/organization.ts` and `src/actions/branch.ts`.
- Every mutation validates:
  - User session is valid and has `DIRECTOR` or `SUPER_ADMIN` role.
  - Target resource matches `session.user.organizationId`.
- Build UI pages in `src/app/(portal)/settings/organization` and `src/app/(portal)/settings/branches`.

### Task 5: User & Staff Administration
- Implement Server Actions in `src/actions/user.ts` (create staff, toggle active status, change role/branch).
- Build staff management table with search and role filters.

### Task 6: Seed Script & Demo Readiness
- Create `prisma/seed.ts` providing realistic multi-branch clinic data:
  - 1 Organization ("Klinik Gigi Senyum Sehat") with 2 branches ("Kelapa Gading", "Pluit").
  - 1 Director, 2 Managers, 2 Receptionists, 2 Doctors.
  - Core services, insurance partners, and recurring weekly doctor schedules.
- Test seed execution: `npx prisma db seed`.

---

## 5. Verification & Acceptance Criteria

- [ ] `npm run lint` & `npx tsc --noEmit` exit 0 with zero errors.
- [ ] Automated tests pass:
  - Login unit test verifies password hashing and token construction.
  - Multi-tenant isolation test verifies Manager from Org A cannot read or mutate Org B data.
  - Middleware test verifies unauthorized role redirection.
- [ ] Manual test verification:
  - Log in as Director: see all branches, settings, and module toggles.
  - Log in as Staff: see only permitted appointment views; settings routes return 403 / redirect.
  - Disabling `moduleOperate` on Org hides OPERATE nav item immediately.
