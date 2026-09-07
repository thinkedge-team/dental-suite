# Design Specification: Core Production Hardening (Multi-Branch, CMS Admin, User Profile & Security, Organization Entitlements)

**Date**: 2026-09-07  
**Status**: Approved  
**Scope**: Production Readiness & Architectural Gap Closure

---

## 1. Overview & Objectives

This specification addresses the four architectural and operational gaps identified during system audit:
1. **Full Multi-Branch Lifecycle (`/branches`)**: Transform static/disabled branch cards into an active management suite with branch creation, metadata editing, opening hours configuration, and real-time branch status toggles.
2. **Clinical CMS Suite (`/services` & `/doctors`)**: Provide clinic managers and directors with interfaces to manage dental services (pricing, clinical categories, procedure descriptions) and specialists (degrees, credentials SIP/STR, branch schedules) without manual database manipulation.
3. **User Profile & Account Security (`/settings/profile` & `/settings/security`)**: Dedicated staff profile management and secure bcrypt-hashed password change flows, eliminating dead `#keamanan` links in the top header.
4. **Real Organization Profile & Module Entitlements (`/settings/organization`)**: Replace hardcoded switches with a real organization metadata updater and an informative, database-driven subscription entitlement board (*GROW, CONNECT, OPERATE, INTELLIGENCE*).

---

## 2. Architecture & File Structure

```
src/
├── app/
│   └── (portal)/
│       ├── branches/
│       │   ├── page.tsx                    # Updated: Server Component loading branches with active modals
│       │   └── branch-modal.tsx            # Client Component: Create/Edit branch dialog
│       │
│       ├── doctors/
│       │   ├── page.tsx                    # Updated: Active "+ Tambah Dokter" and doctor edit dialog
│       │   └── doctor-modal.tsx            # Client Component: Doctor credential & branch assignment modal
│       │
│       ├── services/
│       │   ├── page.tsx                    # New Server Component: Staff service catalog management
│       │   └── service-modal.tsx           # Client Component: Dental service creation & pricing modal
│       │
│       └── settings/
│           ├── organization/
│           │   ├── page.tsx                # Updated: Live organization metadata form + subscription status
│           │   └── org-profile-form.tsx    # Client Component: Editable clinic profile form
│           │
│           ├── profile/
│           │   ├── page.tsx                # New Server Component: Staff user profile page
│           │   └── profile-form.tsx        # Client Component: Name & phone updater
│           │
│           └── security/
│               ├── page.tsx                # New Server Component: Security settings page
│               └── password-form.tsx       # Client Component: Secure bcrypt password changer
│
├── lib/
│   └── actions/
│       ├── branches.ts                     # Server actions: createBranch, updateBranch
│       ├── doctors.ts                      # Server actions: createDoctor, updateDoctor
│       ├── services.ts                     # Server actions: createService, updateService
│       ├── settings.ts                     # Server actions: updateOrganizationProfile
│       └── account.ts                      # Server actions: updateUserProfile, changeUserPassword
│
└── components/
    └── portal/
        ├── header.tsx                      # Updated: Direct links to /settings/profile and /settings/security
        └── sidebar.tsx                     # Updated: Added "Layanan Gigi" link under GROW module
```

---

## 3. Detailed Specifications by Area

### 3.1 Area 1: Full Multi-Branch Lifecycle (`/branches`)

#### Server Actions (`src/lib/actions/branches.ts`)
- `createBranch(data: { name: string; address: string; city: string; province?: string; whatsapp: string; openingHours?: Record<string, string>; googleMapsUrl?: string })`:
  - RBAC: Strictly restricted to `DIRECTOR` and `SUPER_ADMIN`.
  - Scoped to `session.user.organizationId`.
  - Generates slug automatically from name (with random suffix if collided).
  - Inserts record into `prisma.branch`.
  - Revalidates `/branches`, `/lokasi`, and `/book`.
- `updateBranch(id: string, data: { name: string; address: string; city: string; province?: string; whatsapp: string; openingHours?: Record<string, string>; googleMapsUrl?: string; isActive: boolean })`:
  - Scoped to `session.user.organizationId`.
  - Updates branch and revalidates relevant paths.

#### UI Components
- `branch-modal.tsx`: Accessible dialog with tabs/sections for General Info (Name, City, Address, WhatsApp), Opening Hours editor (Mon-Sun inputs), and Google Maps URL.
- `/branches/page.tsx`: Activates "+ Tambah Cabang" button and "Edit" button on each branch card.

---

### 3.2 Area 2: Clinical CMS Suite (Services & Doctors)

#### 1. Dental Services (`/services` & `src/lib/actions/services.ts`)
- Server Actions:
  - `createService(data: { name: string; category?: string; price: number; durationMin: number; description?: string })`
  - `updateService(id: string, data: { name: string; price: number; durationMin: number; description?: string; isActive: boolean })`
- Page `/services`:
  - List of clinical services with category pill, duration (minutes), official price in Rupiah, active status, and edit button.
  - "+ Tambah Layanan" modal dialog (`service-modal.tsx`).
- Navigation:
  - Added "Layanan Gigi" to sidebar navigation when `userModules.grow` is active.

#### 2. Doctor Directory & Assignment (`/doctors` & `src/lib/actions/doctors.ts`)
- Server Actions:
  - `createDoctor(data: { name: string; title: string; specialty: string; sipNumber?: string; strNumber?: string; yearsExperience?: number; bio?: string; branchIds: string[] })`
  - `updateDoctor(id: string, data: { name: string; title: string; specialty: string; sipNumber?: string; strNumber?: string; yearsExperience?: number; bio?: string; branchIds: string[]; isActive: boolean })`
- `/doctors/page.tsx`:
  - Activates "+ Tambah Dokter" button.
  - Adds "Edit" action on doctor profile cards.
  - Dialog `doctor-modal.tsx`: Inputs for credentials, biography, and branch checkboxes (`BranchDoctor` relation).

---

### 3.3 Area 3: User Profile & Account Security

#### 1. User Profile (`/settings/profile` & `src/lib/actions/account.ts`)
- Server Component displaying:
  - User details: Full Name, Email (read-only), Role badge (`DIRECTOR`, `MANAGER`, `STAFF`, `DOCTOR`), and Branch assignment badge.
  - Form `profile-form.tsx` to update name and phone number.
  - Server Action `updateUserProfile(data: { name: string })`.

#### 2. Account Security (`/settings/security` & `src/lib/actions/account.ts`)
- Form `password-form.tsx`:
  - Fields: Password Saat Ini, Password Baru (min 8 karakter), Konfirmasi Password Baru.
  - Server Action `changeUserPassword(data: { currentPassword: string; newPassword: string })`:
    - Queries user's `passwordHash`.
    - Verifies `bcryptjs.compare(currentPassword, passwordHash)`. Returns error "Password saat ini tidak cocok" if invalid.
    - Hashes new password with `bcryptjs.hash(newPassword, 12)`.
    - Updates database.
- Header Dropdown (`src/components/portal/header.tsx`):
  - "Profil Pengguna" points directly to `/settings/profile`.
  - "Keamanan Akun" points directly to `/settings/security` (replaces `#keamanan`).

---

### 3.4 Area 4: Organization Entitlements & Clinic Profile (`/settings/organization`)

#### Route `/settings/organization`
1. **Clinic Profile Card (`org-profile-form.tsx`)**:
   - Displays Name, Slug (read-only), and primary contact info.
   - Saves updates via `updateOrganizationProfile(data: { name: string })`.
2. **Subscription Entitlement Board**:
   - Replaces interactive toggles with an informative, database-driven status card:
     - **GROW**: Status badge `Aktif` · Website Publik & CMS Layanan
     - **CONNECT**: Status badge `Aktif` · Booking Online, Self-Cancel, WhatsApp Engine
     - **OPERATE**: Status badge `Aktif` · Inventaris Medis, Shift, Presensi, Approvals
     - **INTELLIGENCE**: Status badge `Aktif` · Executive Analytics, Patient Timeline, CSV Exports
   - Shows badge `Aktif / Berlisensi` (green) if `true`, or `Belum Termasuk Paket` (slate) if `false`.
   - Contact Think Edge Enterprise button for plan expansion.

---

## 4. Constraint & Brand Compliance

- **Typography & Copy**: Strictly ZERO em-dashes (U+2014) across all new files, forms, labels, and error messages. Use `-` or `·`.
- **Styling**: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All date/time displays formatted in `Asia/Jakarta` (WIB = UTC+7).
- **Type Safety**: Full TypeScript strict mode, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Unit & Logic Tests (`tests/hardening.test.ts`)**:
   - Verify branch slug generation and uniqueness.
   - Verify password change verification logic (reject wrong current password, accept valid password).
2. **Multi-Tenant Audit**:
   - Verify that staff cannot create or update branches for foreign organizations.
   - Verify that password change only affects the calling user's record.
3. **End-to-End Build & Quality Check**:
   - `npx vitest run` -> 100% pass.
   - `npx eslint "src/**/*.{ts,tsx}"` -> 0 errors.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run build` -> clean build with all routes recognized.
