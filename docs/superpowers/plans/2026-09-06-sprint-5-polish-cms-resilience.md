# Sprint 5: Polish, Dynamic CMS Integration & UX Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the final production polish for the Think Edge Dental Suite: connect all public marketing pages directly to the Prisma PostgreSQL database (single source of truth), implement zero-layout-shift streaming skeletons, provide user-friendly error boundaries with retry mechanisms, and deliver a branded 404 page.

**Architecture:** Server Components in `src/app/(marketing)/` querying Prisma directly for doctors, services, branches, and insurance partners; route-group `loading.tsx` streaming skeletons; `"use client"` route-group `error.tsx` boundaries with `reset()` triggers; and a global `not-found.tsx` styled in Think Edge brand tokens.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Prisma 6.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All dates in Indonesian locale (`id-ID`) and `Asia/Jakarta` (WIB = UTC+7).
- Multi-tenant security: All queries must filter by `organization.slug: "senyum-sehat"` or active organization context.
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Enriched Seed Data & Database-Driven Marketing Pages

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `src/app/(marketing)/page.tsx`
- Modify: `src/app/(marketing)/layanan/page.tsx`
- Modify: `src/app/(marketing)/layanan/[slug]/page.tsx`
- Modify: `src/app/(marketing)/dokter/page.tsx`
- Modify: `src/app/(marketing)/dokter/[slug]/page.tsx`
- Modify: `src/app/(marketing)/lokasi/page.tsx`
- Modify: `src/app/(marketing)/lokasi/[slug]/page.tsx`
- Modify: `src/app/(marketing)/asuransi/page.tsx`

**Interfaces:**
- Produces:
  - Enriched database seed with doctor photos, credentials, procedure descriptions, branch details, and insurance partners
  - Fully database-driven public marketing pages querying Prisma directly
  - Elimination of `mock-grow.ts` dependencies across public routes

- [ ] **Step 1: Enrich `prisma/seed.ts` with complete clinical data**

Update `prisma/seed.ts`:
1. **Doctors**:
   - `dr-andi-pratama`: `name: "Andi Pratama"`, `title: "drg."`, `specialty: "Dokter Gigi Umum"`, `photoUrl: "/images/doctor-sarah.jpg"`, `sipNumber: "503/SIP.012/DPMPTSP/2022"`, `strNumber: "31.1.1.100.2.18.123456"`, `yearsExperience: 7`, `bio: "Berpengalaman dalam perawatan gigi preventif, penambalan estetis, dan edukasi kesehatan gigi keluarga."`.
   - `dr-sarah-amanda`: `name: "Sarah Amanda"`, `title: "drg."`, `specialty: "Sp.KG"`, `photoUrl: "/images/doctor-jessica.jpg"`, `sipNumber: "503/SIP.045/DPMPTSP/2023"`, `strNumber: "31.2.1.200.3.19.654321"`, `yearsExperience: 9`, `bio: "Spesialis Konservasi Gigi fokus pada perawatan saluran akar mikroskopis dan restorasi estetik kompleks."`.
   - `dr-budi-hartono`: `name: "Budi Hartono"`, `title: "drg."`, `specialty: "Sp.BM"`, `photoUrl: "/images/doctor-budi.jpg"`, `sipNumber: "503/SIP.078/DPMPTSP/2021"`, `strNumber: "31.1.1.300.1.17.789012"`, `yearsExperience: 12`, `bio: "Spesialis Bedah Mulut dan Maksilofasial dengan keahlian odontektomi impaksi gigi bungsu dan implan dental."`.
2. **Services**:
   - Seed full clinical descriptions, categories, durations, and local image URLs (`/images/service-scaling.jpg`, `/images/service-bleaching.jpg`, `/images/promo-whitening.jpg`, `/images/promo-implant.jpg`).
3. **Branches**:
   - Seed local branch photos (`/images/branch-kelapa-gading.jpg`, `/images/branch-pluit.jpg`), opening hours JSON, address, and Google Maps URLs.
4. **Insurance Partners**:
   - Seed active partners: AdMedika, Prudential, BCA Life, Mandiri Inhealth, Sinarmas.

- [ ] **Step 2: Update Homepage (`src/app/(marketing)/page.tsx`) to query Prisma**

Replace `mockServices`, `mockDoctors`, and `mockBranches` on homepage with Prisma queries:
```ts
const [services, branches, doctors] = await Promise.all([
  prisma.service.findMany({
    where: { organization: { slug: "senyum-sehat" }, isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  }),
  prisma.branch.findMany({
    where: { organization: { slug: "senyum-sehat" }, isActive: true },
    take: 2,
  }),
  prisma.doctor.findMany({
    where: { organization: { slug: "senyum-sehat" }, isActive: true },
    include: { branches: { include: { branch: true } } },
    take: 3,
  }),
]);
```

- [ ] **Step 3: Update Services pages (`/layanan` & `/layanan/[slug]`) to query Prisma**

- In `src/app/(marketing)/layanan/page.tsx`: Query `prisma.service.findMany` ordered by `sortOrder: 'asc'`.
- In `src/app/(marketing)/layanan/[slug]/page.tsx`: Query `prisma.service.findFirst({ where: { slug, isActive: true } })`. If not found, invoke `notFound()`.

- [ ] **Step 4: Update Doctors pages (`/dokter` & `/dokter/[slug]`) to query Prisma**

- In `src/app/(marketing)/dokter/page.tsx`: Query `prisma.doctor.findMany` including assigned branches and weekly schedule templates.
- In `src/app/(marketing)/dokter/[slug]/page.tsx`: Query doctor by slug including `branches` and `schedules`.

- [ ] **Step 5: Update Locations & Insurance pages (`/lokasi`, `/lokasi/[slug]`, `/asuransi`) to query Prisma**

- In `src/app/(marketing)/lokasi/page.tsx`: Query active branches with photoUrls and opening hours.
- In `src/app/(marketing)/lokasi/[slug]/page.tsx`: Query branch with practicing doctors.
- In `src/app/(marketing)/asuransi/page.tsx`: Query `prisma.insurancePartner.findMany`.

- [ ] **Step 6: Verify typecheck & test suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 0 errors, all tests pass.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add prisma/seed.ts src/app/\(marketing\)/
GIT_MASTER=1 git commit -m "feat(grow): migrate public marketing pages to direct Prisma database queries"
```

---

### Task 2: Streaming Skeletons (`loading.tsx`)

**Files:**
- Create: `src/app/(portal)/loading.tsx`
- Create: `src/app/(portal)/operate/analytics/loading.tsx`
- Create: `src/app/(portal)/operate/inventory/loading.tsx`
- Create: `src/app/(marketing)/loading.tsx`

**Interfaces:**
- Produces:
  - Instant zero-layout-shift (CLS < 0.1) skeleton fallbacks for portal and marketing routes

- [ ] **Step 1: Create `src/app/(portal)/loading.tsx`**

Implement portal loading skeleton:
- Pulsing greeting card header placeholder.
- 4-card metric grid skeleton with pulsing title and number boxes (`bg-muted/60 animate-pulse`).
- Pulsing schedule table placeholder with 5 row bars.

- [ ] **Step 2: Create `src/app/(portal)/operate/analytics/loading.tsx`**

Implement analytics loading skeleton:
- 4 KPI metric cards pulse boxes.
- Large rounded rectangular chart box with pulsing gradient shimmer.
- Dual-column table skeleton for doctor rankings and service share.

- [ ] **Step 3: Create `src/app/(portal)/operate/inventory/loading.tsx`**

Implement inventory loading skeleton:
- 4 KPI bar metric pulse boxes.
- Category tabs shimmer bar.
- Search input pulse box.
- Table skeleton with 6 pulsing row placeholders.

- [ ] **Step 4: Create `src/app/(marketing)/loading.tsx`**

Implement marketing loading skeleton:
- Centered header with tag pulse.
- Responsive 3-column card grid skeleton with image container pulse.

- [ ] **Step 5: Verify build & typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors, all loading routes recognized.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/loading.tsx src/app/\(portal\)/operate/analytics/loading.tsx src/app/\(portal\)/operate/inventory/loading.tsx src/app/\(marketing\)/loading.tsx
GIT_MASTER=1 git commit -m "feat(ui): add zero-layout-shift streaming skeletons for portal and marketing"
```

---

### Task 3: Error Boundaries & Branded 404 Recovery

**Files:**
- Create: `src/app/(portal)/error.tsx`
- Create: `src/app/(marketing)/error.tsx`
- Create: `src/app/not-found.tsx`

**Interfaces:**
- Produces:
  - Client-side error boundaries with React `reset()` retry buttons
  - Global branded 404 page styled in Think Edge brand tokens

- [ ] **Step 1: Create `src/app/(portal)/error.tsx`**

Create `"use client"` portal error boundary:
- Receives `{ error: Error & { digest?: string }; reset: () => void }`.
- Card container with `AlertTriangle` icon.
- Title: "Terjadi Kendala Saat Memuat Data Portal".
- Description: "Sistem mengalami kendala sementara saat mengambil data dari server. Silakan coba muat ulang atau hubungi administrator jika kendala berlanjut."
- Primary button: **"Coba Lagi"** invoking `reset()`.
- Secondary link: "Kembali ke Dashboard" (`/dashboard`).

- [ ] **Step 2: Create `src/app/(marketing)/error.tsx`**

Create `"use client"` marketing error boundary:
- Receives `{ error: Error & { digest?: string }; reset: () => void }`.
- Card container with calming illustration and retry button.
- Secondary link: "Kembali ke Beranda" (`/`).

- [ ] **Step 3: Create `src/app/not-found.tsx`**

Create global 404 page:
- Brand styling: Background Paper (`#f7f5f0`), Ink typography (`#161817`), Primary Orange accents (`#f38218`).
- Clean 404 badge with tooth/compass icon.
- Heading: "Halaman Tidak Ditemukan".
- Message: "Halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau terdapat kesalahan penulisan alamat URL."
- Action buttons: "Kembali ke Beranda" (`/`) and "Masuk ke Portal Staf" (`/login`).

- [ ] **Step 4: Verify typecheck & build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors, `/_not-found` registered.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/error.tsx src/app/\(marketing\)/error.tsx src/app/not-found.tsx
GIT_MASTER=1 git commit -m "feat(ui): add route-group error boundaries and global branded 404 page"
```

---

### Task 4: Mobile Responsiveness Audit & Layout Hardening

**Files:**
- Modify: `src/app/(portal)/operate/inventory/inventory-table.tsx`
- Modify: `src/app/(portal)/operate/shifts/weekly-roster-grid.tsx`
- Modify: `src/app/(portal)/operate/attendance/attendance-board.tsx`
- Modify: `src/app/(portal)/operate/approvals/approval-table.tsx`

**Interfaces:**
- Produces:
  - Mobile-optimized table card transitions on viewports `< 640px`

- [ ] **Step 1: Harden mobile view on Inventory Table**

In `src/app/(portal)/operate/inventory/inventory-table.tsx`:
Add mobile card view container (`block sm:hidden`) alongside desktop table (`hidden sm:block`) so each inventory item renders as a compact card with stock pill, category, and action buttons on mobile screens.

- [ ] **Step 2: Harden mobile view on Shifts Roster Grid**

In `src/app/(portal)/operate/shifts/weekly-roster-grid.tsx`:
Ensure table container has touch-scrolling (`overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0`) with subtle horizontal swipe hint indicator on mobile devices.

- [ ] **Step 3: Harden mobile view on Attendance Board**

In `src/app/(portal)/operate/attendance/attendance-board.tsx`:
Add mobile card view for live attendance records on viewports `< 640px`.

- [ ] **Step 4: Harden mobile view on Approvals Table**

In `src/app/(portal)/operate/approvals/approval-table.tsx`:
Add mobile card view for approval requests on viewports `< 640px`.

- [ ] **Step 5: Verify build & lint**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit && npm run build`
Expected: 0 errors, 0 warnings.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/
GIT_MASTER=1 git commit -m "feat(ui): optimize dense portal tables for mobile viewports"
```

---

### Task 5: End-to-End Verification & Quality Polish

- [ ] **Step 1: Zero em-dash scan**

Run: `git grep "\u2014" src/`
Expected: 0 matches.

- [ ] **Step 2: Run all Vitest test suites**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 3: Run ESLint and TypeScript checks**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: 100% clean build.

- [ ] **Step 5: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(release): complete and verify Sprint 5 production polish"
```
