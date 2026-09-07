# Design Specification: Sprint 5 - Polish, Dynamic CMS Integration & UX Resilience

**Date**: 2026-09-06  
**Status**: Approved  
**Module**: POLISH (Sprint 5: Single Source of Truth, Streaming Skeletons, Error Resilience, Mobile Adaptation)

---

## 1. Overview & Goals

This specification delivers the final production-readiness polish for Think Edge Dental Suite:
1. **Dynamic CMS & Single Source of Truth**: Eliminate static mock datasets (`mock-grow.ts`) by migrating all patient marketing pages (`/`, `/layanan`, `/dokter`, `/lokasi`, `/asuransi`) to direct Prisma queries. Content updated in the staff portal or database automatically reflects on the patient-facing web.
2. **Granular Streaming Skeletons (`loading.tsx`)**: Zero-layout-shift (CLS < 0.1) skeleton loaders for portal dashboards, analytics charts, inventory tables, and patient directories during async server-side data fetching.
3. **Resilient Error Recovery & Branded 404 (`error.tsx` & `not-found.tsx`)**: Route-group error boundaries with one-click React `reset()` retry buttons and a unified branded 404 page.
4. **Mobile Table Stacking**: Responsive adaptations transforming dense desktop tables (Inventory, Shifts, Attendance, Approvals, Reports) into readable vertical cards on screens `< 640px`.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   ├── not-found.tsx                       # Global branded 404 page (Think Edge Paper/Orange)
│   │
│   ├── (marketing)/
│   │   ├── error.tsx                       # Marketing error boundary with retry reset()
│   │   ├── loading.tsx                     # Marketing grid skeleton loader
│   │   ├── page.tsx                        # Updated: Prisma-driven homepage (doctors, branches, services)
│   │   ├── layanan/
│   │   │   ├── page.tsx                    # Updated: Queries prisma.service directly
│   │   │   └── [slug]/page.tsx             # Updated: Queries prisma.service by slug
│   │   ├── dokter/
│   │   │   ├── page.tsx                    # Updated: Queries prisma.doctor directly
│   │   │   └── [slug]/page.tsx             # Updated: Queries prisma.doctor with schedules
│   │   ├── lokasi/
│   │   │   ├── page.tsx                    # Updated: Queries prisma.branch directly
│   │   │   └── [slug]/page.tsx             # Updated: Queries prisma.branch with assigned doctors
│   │   └── asuransi/
│   │       └── page.tsx                    # Updated: Queries prisma.insurancePartner directly
│   │
│   └── (portal)/
│       ├── error.tsx                       # Portal error boundary with retry reset()
│       ├── loading.tsx                     # Portal dashboard & table skeleton loader
│       └── operate/
│           ├── analytics/loading.tsx       # Analytics SVG chart & ranking table skeleton
│           └── inventory/loading.tsx       # Inventory KPI bar & table skeleton
│
└── prisma/
    └── seed.ts                             # Enriched with doctor photos, SIP/STR, branches, services, insurance
```

---

## 3. Detailed Component Specifications

### 3.1 Prisma Seed Enhancement (`prisma/seed.ts`)
- **Doctors**: Enrich with local high-resolution assets (`/images/doctor-sarah.jpg`, `/images/doctor-budi.jpg`, `/images/doctor-jessica.jpg`), valid clinical titles (`drg.`, `Sp.KG`, `Sp.BM`, `Sp.Ort`), experience years, formal SIP and STR registration numbers, and weekly schedule templates.
- **Services**: Enrich with local procedure photos (`/images/service-scaling.jpg`, `/images/service-bleaching.jpg`), clinical categories, official pricing, durations, and detailed procedure descriptions.
- **Branches**: Enrich with local branch photos (`/images/branch-kelapa-gading.jpg`, `/images/branch-pluit.jpg`), opening hours JSON, address, and Google Maps URLs.
- **Insurance Partners**: Seed active partners: AdMedika, Prudential, BCA Life, Mandiri Inhealth, Sinarmas.

---

### 3.2 Dynamic Marketing Pages (Elimination of `mock-grow.ts`)

#### 1. Homepage (`src/app/(marketing)/page.tsx`)
- Server Component querying:
  - Featured active services (`prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 6 })`).
  - Active branches (`prisma.branch.findMany({ where: { isActive: true }, take: 2 })`).
  - Active clinical specialists (`prisma.doctor.findMany({ where: { isActive: true }, take: 3 })`).
- Binds database models directly to existing homepage bento and showcase components.

#### 2. Services Directory (`/layanan` & `/layanan/[slug]`)
- `/layanan`: Server Component fetching all active services, grouped by clinical categories.
- `/layanan/[slug]`: Server Component fetching service by slug with price, duration, procedure steps, and direct booking CTA linking to `/book`.

#### 3. Doctors Directory (`/dokter` & `/dokter/[slug]`)
- `/dokter`: Server Component fetching all active doctors with specialties, photo URLs, and assigned clinic branches.
- `/dokter/[slug]`: Server Component fetching doctor with branch schedules, education, SIP/STR credentials, and booking button preselecting the doctor.

#### 4. Locations Directory (`/lokasi` & `/lokasi/[slug]`)
- `/lokasi`: Server Component fetching all clinic branches with operational hours, WhatsApp contacts, and facilities.
- `/lokasi/[slug]`: Server Component fetching branch details with Google Maps embed and list of practicing specialists.

#### 5. Insurance Directory (`/asuransi`)
- Server Component fetching all active insurance partners with coverage details and cashless/reimbursement claim procedures.

---

### 3.3 Streaming Suspense & Skeletons (`loading.tsx`)

#### 1. Portal Root Skeleton (`src/app/(portal)/loading.tsx`)
- Shimmer pulse boxes for top navigation and breadcrumb.
- 4 metric card pulse rectangles matching the dashboard layout.
- Shimmer table with header bar and 5 pulsing row placeholders using Tailwind's `animate-pulse` with brand slate tones (`bg-muted/60`).

#### 2. Analytics Skeleton (`src/app/(portal)/operate/analytics/loading.tsx`)
- 4 KPI metric cards pulse placeholders.
- Large rounded rectangular chart box with pulsing gradient shimmer.
- Dual-column table skeleton for doctor rankings and service share.

#### 3. Marketing Skeleton (`src/app/(marketing)/loading.tsx`)
- Centered header skeleton with tag pulse.
- 3-column responsive card grid skeleton with image container pulse.

---

### 3.4 Resilient Error Handling & 404 Recovery

#### 1. Error Boundaries (`src/app/(portal)/error.tsx` & `src/app/(marketing)/error.tsx`)
- `"use client"` components accepting `{ error: Error & { digest?: string }; reset: () => void }`.
- Logs error to console without exposing raw internal database stacks to the user.
- Displays calm illustration icon (`AlertTriangle`), user-friendly Indonesian heading (*"Terjadi Kendala Saat Memuat Data"*), and primary button **"Coba Lagi"** executing `reset()`.
- Provides secondary escape link to Home (`/`) or Portal Dashboard (`/dashboard`).

#### 2. Global Branded 404 (`src/app/not-found.tsx`)
- Styled in Think Edge brand tokens: Background Paper (`#f7f5f0`), Ink typography (`#161817`), Primary Orange accents (`#f38218`).
- Explains the requested page was moved, deleted, or the URL contains a typo.
- Action buttons: "Kembali ke Beranda" and "Masuk ke Portal Staf".

---

### 3.5 Mobile Responsiveness Adaptation
- On viewport `< 640px`:
  - Dense desktop table containers (`overflow-x-auto`) remain scrollable if needed.
  - Key information columns receive responsive sizing (`truncate max-w-[120px] sm:max-w-none`).
  - Form actions, dialogs, and drawers adjust to full-width mobile bottom sheets.

---

## 4. Constraint & Brand Token Compliance

- **Typography & Copy**: Strictly ZERO em-dashes (U+2014) across all new files, UI strings, and error messages. Use `-` or `·`.
- **Styling**: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All dates in Indonesian locale (`id-ID`) and `Asia/Jakarta` (WIB).
- **Type Safety**: Full TypeScript strict mode, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Prisma Query Verification**:
   - Verify `/layanan`, `/dokter`, `/lokasi`, and `/asuransi` render active records from the PostgreSQL database.
   - Verify that adding a doctor or service in the database causes it to immediately display on the public web.
2. **Loading & Error Verification**:
   - Trigger loading states and confirm zero Cumulative Layout Shift (CLS).
   - Test error boundary by throwing a test error and confirming `reset()` recovers smoothly.
   - Access invalid route (`/halaman-tidak-ada`) and verify branded 404 page.
3. **Build & Quality Gates**:
   - `npx vitest run` -> 100% pass.
   - `npx eslint "src/**/*.{ts,tsx}"` -> 0 errors, 0 warnings.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run build` -> 100% clean production build.
