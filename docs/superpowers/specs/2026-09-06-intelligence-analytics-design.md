# Design Specification: INTELLIGENCE Module - Clinical Analytics, Patient Visit Timeline & Reporting Hub

**Date**: 2026-09-06  
**Status**: Approved  
**Module**: INTELLIGENCE (Sprint 4: Executive Analytics, Patient Records, Data Export)

---

## 1. Overview & Goals

The INTELLIGENCE module synthesizes operational data accumulated across GROW, CONNECT, and OPERATE into high-leverage decision support for clinic owners and longitudinal records for care providers:
1. **Executive Analytics Dashboard (`/operate/analytics`)**: Real-time KPI aggregation (revenue, completion rates, no-show trends, doctor utilization, and branch comparisons) rendered via pure React/Tailwind SVG charts with zero external charting overhead.
2. **Longitudinal Patient Visit Timeline (`/patients/[id]`)**: Deep patient profile featuring historical visit timelines (practitioner, clinic branch, service rendered, clinical notes, and billing records).
3. **Reporting & Secure CSV Export Hub (`/operate/reports`)**: Filterable, Excel-compatible CSV exports for Appointments, Revenue & Visits (for accounting software like Jurnal.id), and Inventory Stock Logs.
4. **Strict RBAC & Privacy**: Scoped strictly by `organizationId`, with branch-locking for Managers and organization-wide views for Directors and Super Admins.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   └── (portal)/
│       ├── operate/
│       │   ├── analytics/
│       │   │   ├── page.tsx                    # Server Component: Executive KPI dashboard with period filters
│       │   │   ├── trend-chart.tsx             # Interactive SVG daily volume & revenue area chart
│       │   │   ├── doctor-ranking-table.tsx    # Doctor utilization and revenue breakdown table
│       │   │   └── service-breakdown.tsx       # Visual distribution bar of revenue per dental procedure
│       │   │
│       │   └── reports/
│       │       ├── page.tsx                    # Server Component: Reporting hub with date range selectors
│       │       └── report-card.tsx             # Client Component: Parameter selector with instant CSV download trigger
│       │
│       └── patients/
│           ├── page.tsx                        # Updated: Links table rows directly to /patients/[id]
│           └── [id]/
│               ├── page.tsx                    # Server Component: Patient profile & longitudinal visit timeline
│               └── patient-notes-form.tsx      # Client Component: Inline editable patient notes / medical alerts
│
├── lib/
│   ├── intelligence/
│   │   ├── analytics.ts                        # Pure aggregation engine: KPI math, period comparisons, daily time-series
│   │   └── csv.ts                              # Pure helper: Encodes typed records into sanitized, Excel-compatible CSV strings
│   │
│   └── actions/
│       ├── intelligence.ts                     # Server actions: updatePatientNotes
│       └── reports.ts                          # Server actions: exportAppointmentsCsv, exportVisitsCsv, exportInventoryCsv
│
├── components/
│   └── portal/
│       └── sidebar.tsx                         # Updated: Added "Analitik & KPI" and "Laporan & Ekspor" under moduleIntelligence
│
└── prisma/
    └── seed.ts                                 # Seeded historical visits with revenue, services, and diverse payment methods
```

---

## 3. Detailed Technical Specifications

### 3.1 Data Model Alignment (`prisma/schema.prisma`)

Existing `Visit` and `Patient` models are utilized directly:
```prisma
model Patient {
  id             String        @id @default(cuid())
  organizationId String
  name           String
  phone          String
  email          String?
  dob            DateTime?
  notes          String?
  consentedAt    DateTime?
  consentIp      String?
  deletedAt      DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  appointments   Appointment[]
  visits         Visit[]
  Organization   Organization  @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, phone])
  @@index([organizationId, deletedAt])
}

model Visit {
  id             String       @id @default(cuid())
  organizationId String
  patientId      String
  patient        Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointmentId  String?      @unique
  appointment    Appointment? @relation(fields: [appointmentId], references: [id])
  branchId       String
  branch         Branch       @relation(fields: [branchId], references: [id])
  doctorId       String?
  serviceId      String?
  service        Service?     @relation(fields: [serviceId], references: [id])
  paymentAmount  Decimal?     @db.Decimal(12, 2)
  paymentMethod  String?      // "CASH", "QRIS", "DEBIT", "CREDIT", "INSURANCE"
  notes          String?
  deletedAt      DateTime?
  createdAt      DateTime     @default(now())

  @@index([patientId])
  @@index([organizationId, createdAt])
  @@index([branchId, createdAt])
}
```

---

### 3.2 Analytics & Aggregation Engine (`src/lib/intelligence/analytics.ts`)

#### 1. Time-Series Period Math
Supports presets: `7d` (Last 7 days), `30d` (Last 30 days), `this_month` (Month to date), `last_month` (Previous calendar month).
- All date boundaries are calculated in `Asia/Jakarta` (WIB = UTC+7).
- Automatically calculates the corresponding comparison window (e.g., current 30 days vs previous 30 days) to compute precise growth percentages (`+15%`, `-4%`).

#### 2. KPI Metrics
- **Total Revenue**: Sum of `paymentAmount` on non-deleted `Visit` records in window.
- **Completed Appointments**: Count of appointments where `status === COMPLETED`.
- **No-Show Rate**: `noShowCount / (completedCount + noShowCount) * 100`.
- **Average Revenue per Visit**: `totalRevenue / visitCount`.

#### 3. Pure SVG Chart Renderers
- Generates SVG path coordinates (`M x y L x y...`) dynamically from daily time-series values.
- Zero dependencies, 100% responsive, utilizing Tailwind primary colors (`#f38218`) with interactive point inspection.

---

### 3.3 CSV Export Engine (`src/lib/intelligence/csv.ts` & `src/lib/actions/reports.ts`)

#### Sanitization & Formatting
- Escapes double-quotes (`""`) and wraps fields in double-quotes.
- Prepends UTF-8 Byte Order Mark (`\uFEFF`) to ensure seamless opening in Microsoft Excel without character corruption in Indonesian accents.
- Prevents CSV formula injection (prefixes characters `=`, `+`, `-`, `@` with a leading apostrophe `'`).

#### Server Actions (`src/lib/actions/reports.ts`)
1. **`exportAppointmentsCsv(params: { branchId?: string; startDate: string; endDate: string })`**:
   - Columns: `ID Janji`, `Waktu Jadwal (WIB)`, `Cabang`, `Nama Pasien`, `No. Telepon`, `Dokter`, `Layanan`, `Status`, `Tipe (Web/Walk-in)`, `Catatan`.
2. **`exportVisitsCsv(params: { branchId?: string; startDate: string; endDate: string })`**:
   - Columns: `ID Kunjungan`, `Waktu Tindakan (WIB)`, `Cabang`, `Nama Pasien`, `No. Telepon`, `Dokter`, `Layanan`, `Nominal Pembayaran (Rp)`, `Metode Pembayaran`, `Catatan Tindakan`.
3. **`exportInventoryCsv(params: { branchId?: string; startDate: string; endDate: string })`**:
   - Columns: `ID Log`, `Waktu Mutasi (WIB)`, `Cabang`, `Nama Barang`, `SKU`, `Kategori`, `Tipe Mutasi`, `Perubahan Qty`, `Stok Awal`, `Stok Akhir`, `Petugas`, `Catatan`.

---

### 3.4 Longitudinal Patient Visit Record (`/patients/[id]`)

#### Route: `src/app/(portal)/patients/[id]/page.tsx`
- Protected Server Component scoped to `session.user.organizationId`.
- Fetches patient profile, future appointments (`status === CONFIRMED`), and historical visits ordered by `createdAt: "desc"`.
- Features:
  - **Demographics Card**: Full name, phone, email, date of birth, age, registration date.
  - **Quick Stats**: Total visits, total spending, upcoming bookings.
  - **Interactive Notes Form (`patient-notes-form.tsx`)**: Editable medical notes / allergy alerts with optimistic updates via `updatePatientNotes`.
  - **Vertical Visit Timeline**: Chronological card sequence showing procedure date, doctor, branch, service, notes, payment amount, and payment method badge.

---

### 3.5 Executive Analytics Dashboard (`/operate/analytics`)

#### Route: `src/app/(portal)/operate/analytics/page.tsx`
- Server Component receiving `searchParams: Promise<{ branch?: string; period?: string }>`.
- Multi-branch scoping: `DIRECTOR` and `SUPER_ADMIN` can toggle branches or view all; `MANAGER` locked to assigned branch.
- Displays:
  1. **KPI Bar**: Revenue, Completed Visits, No-Show Rate, Average Spend per Patient.
  2. **Trend Chart**: Pure SVG daily volume and revenue graph.
  3. **Doctor Ranking Table**: Specialists sorted by patients treated and revenue contributed.
  4. **Service Contribution Breakdown**: Percentage distribution of revenue by dental procedure.
  5. **Branch Comparison Bar**: Side-by-side volume and revenue comparison between clinic branches.

---

### 3.6 Navigation Integration

- In `src/components/portal/sidebar.tsx`, add under `userModules.intelligence`:
  - **"Analitik & KPI"** (`/operate/analytics`, icon: `BarChart3`).
  - **"Laporan & Ekspor"** (`/operate/reports`, icon: `FileSpreadsheet`).
- Update `/patients/page.tsx` so clicking on a patient name or table row routes to `/patients/${patient.id}`.

---

## 4. Constraint & Brand Token Compliance

- **Typography & Copy**: Strictly zero em-dashes (U+2014). Use `-` or `·`. Terminology in Indonesian (*Analitik & KPI*, *Laporan & Ekspor*, *Kunjungan Selesai*, *Tingkat Kehadiran*, *Metode Pembayaran*).
- **Styling**: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All dates and time bounds formatted in `Asia/Jakarta` (WIB = UTC+7).
- **Type Safety**: TypeScript strict mode, clean typed payloads, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Unit Tests (`tests/analytics.test.ts`, `tests/csv.test.ts`)**:
   - Verify date range math and comparison percentages.
   - Verify CSV escaping and injection prevention.
2. **Production Build & Linter**:
   - `npx vitest run` -> 100% pass.
   - `npx eslint "src/**/*.{ts,tsx}"` -> 0 errors.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run build` -> clean build with dynamic routes registered.
