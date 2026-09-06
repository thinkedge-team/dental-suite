# INTELLIGENCE Module Implementation Plan: Analytics, Patient Records & Reporting Hub

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the INTELLIGENCE module (Sprint 4), providing executive analytics with pure SVG charts, longitudinal patient visit timelines, and an Excel-compatible CSV export hub for clinic operations and accounting.

**Architecture:** Pure aggregation and time-series computation helpers in `src/lib/intelligence/analytics.ts`; Excel-safe CSV encoding in `src/lib/intelligence/csv.ts`; server actions for exports and patient notes; patient detail page at `/patients/[id]` with chronological visit cards; and executive dashboard at `/operate/analytics` and reports hub at `/operate/reports`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Prisma 6.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, placeholders, and CSV headers. Use `-` or `·`.
- Timezone: All day boundaries and display dates must use `Asia/Jakarta` (WIB = UTC+7).
- Multi-tenant security: All queries and exports must verify `session.user.organizationId` and enforce branch scoping for non-directors.
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Historical Seed Data, Pure Analytics Engine, and CSV Utilities

**Files:**
- Modify: `prisma/seed.ts`
- Create: `src/lib/intelligence/analytics.ts`
- Create: `src/lib/intelligence/csv.ts`
- Create: `tests/analytics.test.ts`
- Create: `tests/csv.test.ts`

**Interfaces:**
- Produces:
  - `calculateKpiGrowth(current: number, previous: number): { value: number; label: string; positive: boolean }`
  - `resolveDateRange(preset: "7d" | "30d" | "this_month" | "last_month", now?: Date): { current: { start: Date; end: Date }; previous: { start: Date; end: Date } }`
  - `generateSvgPath(points: { x: number; y: number }[]): { pathD: string; areaD: string }`
  - `formatRupiah(amount: number): string`
  - `encodeCsv(headers: string[], rows: (string | number | null | undefined)[][]): string`
  - Seeded realistic past `Visit` records with payments and notes in `prisma/seed.ts`

- [ ] **Step 1: Write unit tests for CSV encoding and formula injection defense**

Create `tests/csv.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { encodeCsv } from "../src/lib/intelligence/csv";

describe("CSV encoding utility", () => {
  it("encodes headers and rows with quotes and commas", () => {
    const headers = ["ID", "Nama Pasien", "Layanan"];
    const rows = [
      ["APT-01", "Budi Santoso", "Pembersihan Gigi"],
      ["APT-02", "Siti Rahma", "Penambalan Gigi"],
    ];
    const csv = encodeCsv(headers, rows);
    expect(csv.startsWith("\uFEFF")).toBe(true); // UTF-8 BOM
    expect(csv).toContain('"ID","Nama Pasien","Layanan"');
    expect(csv).toContain('"APT-01","Budi Santoso","Pembersihan Gigi"');
  });

  it("escapes existing double quotes inside fields", () => {
    const headers = ["Catatan"];
    const rows = [['Gigi berlubang "kavitas kelas 1"']];
    const csv = encodeCsv(headers, rows);
    expect(csv).toContain('"Gigi berlubang ""kavitas kelas 1"""');
  });

  it("neutralizes CSV formula injection characters (=, +, -, @)", () => {
    const headers = ["Formula"];
    const rows = [["=cmd|' /C calc'!A0"], ["+12345"], ["@SUM(1,2)"]];
    const csv = encodeCsv(headers, rows);
    expect(csv).toContain("'\t=cmd|' /C calc'!A0");
    expect(csv).toContain("'\t+12345");
    expect(csv).toContain("'\t@SUM(1,2)");
  });
});
```

- [ ] **Step 2: Write unit tests for analytics date range & KPI calculations**

Create `tests/analytics.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  calculateKpiGrowth,
  resolveDateRange,
  formatRupiah,
  generateSvgPath,
} from "../src/lib/intelligence/analytics";

describe("Analytics helpers", () => {
  it("calculates percentage growth correctly", () => {
    const up = calculateKpiGrowth(120, 100);
    expect(up.value).toBe(20);
    expect(up.positive).toBe(true);
    expect(up.label).toBe("+20%");

    const down = calculateKpiGrowth(80, 100);
    expect(down.value).toBe(-20);
    expect(down.positive).toBe(false);
    expect(down.label).toBe("-20%");

    const zeroPrev = calculateKpiGrowth(50, 0);
    expect(zeroPrev.value).toBe(100);
    expect(zeroPrev.label).toBe("+100%");
  });

  it("resolves date range presets correctly in WIB", () => {
    const fixedNow = new Date("2026-09-07T05:00:00.000Z"); // 12:00 WIB
    const range7d = resolveDateRange("7d", fixedNow);
    expect(range7d.current.start < range7d.current.end).toBe(true);
    expect(range7d.previous.start < range7d.previous.end).toBe(true);
    expect(range7d.previous.end <= range7d.current.start).toBe(true);
  });

  it("formats Indonesian Rupiah properly", () => {
    expect(formatRupiah(500000)).toBe("Rp500.000");
    expect(formatRupiah(12500000)).toBe("Rp12.500.000");
    expect(formatRupiah(0)).toBe("Rp0");
  });

  it("generates valid SVG path definitions", () => {
    const points = [
      { x: 0, y: 100 },
      { x: 50, y: 20 },
      { x: 100, y: 80 },
    ];
    const { pathD, areaD } = generateSvgPath(points);
    expect(pathD.startsWith("M 0 100")).toBe(true);
    expect(areaD).toContain("Z");
  });
});
```

- [ ] **Step 3: Implement `src/lib/intelligence/csv.ts`**

```ts
export function encodeCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const sanitizeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    let str = String(val);

    // Prevent CSV formula injection in spreadsheet viewers
    if (/^[=+\-@]/.test(str)) {
      str = "'\t" + str;
    }

    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerLine = headers.map((h) => sanitizeCell(h)).join(",");
  const rowLines = rows.map((row) => row.map((c) => sanitizeCell(c)).join(","));

  // Prepend UTF-8 BOM for Microsoft Excel compatibility
  return "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
}
```

- [ ] **Step 4: Implement `src/lib/intelligence/analytics.ts`**

```ts
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export function formatRupiah(amount: number): string {
  return "Rp" + Math.round(amount).toLocaleString("id-ID");
}

export function calculateKpiGrowth(
  current: number,
  previous: number,
): { value: number; label: string; positive: boolean } {
  if (previous === 0) {
    if (current === 0) return { value: 0, label: "0%", positive: true };
    return { value: 100, label: "+100%", positive: true };
  }

  const growth = ((current - previous) / previous) * 100;
  const rounded = Math.round(growth * 10) / 10;
  const positive = rounded >= 0;
  const label = (positive ? "+" : "") + rounded + "%";

  return { value: rounded, label, positive };
}

export function resolveDateRange(
  preset: "7d" | "30d" | "this_month" | "last_month",
  now: Date = new Date(),
): {
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
} {
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  const y = wibNow.getUTCFullYear();
  const m = wibNow.getUTCMonth();
  const d = wibNow.getUTCDate();

  const todayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - WIB_OFFSET_MS);

  if (preset === "7d") {
    const currentStart = new Date(Date.UTC(y, m, d - 6, 0, 0, 0, 0) - WIB_OFFSET_MS);
    const prevEnd = new Date(currentStart.getTime() - 1);
    const prevStart = new Date(Date.UTC(y, m, d - 13, 0, 0, 0, 0) - WIB_OFFSET_MS);
    return { current: { start: currentStart, end: todayEnd }, previous: { start: prevStart, end: prevEnd } };
  }

  if (preset === "30d") {
    const currentStart = new Date(Date.UTC(y, m, d - 29, 0, 0, 0, 0) - WIB_OFFSET_MS);
    const prevEnd = new Date(currentStart.getTime() - 1);
    const prevStart = new Date(Date.UTC(y, m, d - 59, 0, 0, 0, 0) - WIB_OFFSET_MS);
    return { current: { start: currentStart, end: todayEnd }, previous: { start: prevStart, end: prevEnd } };
  }

  if (preset === "this_month") {
    const currentStart = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0) - WIB_OFFSET_MS);
    const prevStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0) - WIB_OFFSET_MS);
    const prevDaysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const prevEnd = new Date(Date.UTC(y, m - 1, Math.min(d, prevDaysInMonth), 23, 59, 59, 999) - WIB_OFFSET_MS);
    return { current: { start: currentStart, end: todayEnd }, previous: { start: prevStart, end: prevEnd } };
  }

  // last_month
  const prevMonthStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0) - WIB_OFFSET_MS);
  const prevMonthEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999) - WIB_OFFSET_MS);
  const twoMonthsAgoStart = new Date(Date.UTC(y, m - 2, 1, 0, 0, 0, 0) - WIB_OFFSET_MS);
  const twoMonthsAgoEnd = new Date(Date.UTC(y, m - 1, 0, 23, 59, 59, 999) - WIB_OFFSET_MS);
  return { current: { start: prevMonthStart, end: prevMonthEnd }, previous: { start: twoMonthsAgoStart, end: twoMonthsAgoEnd } };
}

export function generateSvgPath(points: { x: number; y: number }[]): { pathD: string; areaD: string } {
  if (points.length === 0) return { pathD: "", areaD: "" };
  if (points.length === 1) {
    const pt = points[0]!;
    return { pathD: `M ${pt.x} ${pt.y}`, areaD: `M ${pt.x} 100 L ${pt.x} ${pt.y} L ${pt.x} 100 Z` };
  }

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const areaD = `${pathD} L ${last.x} 100 L ${first.x} 100 Z`;

  return { pathD, areaD };
}
```

- [ ] **Step 5: Enhance `prisma/seed.ts` with `moduleIntelligence: true` and realistic historical Visits**

In `prisma/seed.ts`:
1. Update organization create/upsert: `moduleIntelligence: true`.
2. Seed 10+ historical `Visit` records over the past 30 days:
   - Varied payment amounts (Rp 250.000, Rp 450.000, Rp 800.000, Rp 1.500.000, Rp 2.500.000).
   - Varied payment methods (`QRIS`, `CASH`, `DEBIT`, `INSURANCE`).
   - Meaningful clinical notes (e.g., "Pembersihan karang gigi regio anterior & posterior", "Tambal komposit gigi 36", "Scaling dan polishing tuntas").

- [ ] **Step 6: Run tests and verify**

Run: `npx vitest run tests/analytics.test.ts tests/csv.test.ts`
Expected: All tests pass.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/intelligence/ tests/analytics.test.ts tests/csv.test.ts prisma/seed.ts
GIT_MASTER=1 git commit -m "feat(intelligence): add analytics engine, CSV encoder, tests, and seed historical visits"
```

---

### Task 2: Server Actions, Patient Detail Timeline, and Row Links

**Files:**
- Create: `src/lib/actions/intelligence.ts`
- Create: `src/lib/actions/reports.ts`
- Create: `src/app/(portal)/patients/[id]/patient-notes-form.tsx`
- Create: `src/app/(portal)/patients/[id]/page.tsx`
- Modify: `src/app/(portal)/patients/page.tsx`

**Interfaces:**
- Produces:
  - `updatePatientNotes(patientId: string, notes: string): Promise<{ ok: boolean; error?: string }>`
  - `exportAppointmentsCsv(params: { branchId?: string; startDate: string; endDate: string }): Promise<{ ok: boolean; csv?: string; filename?: string; error?: string }>`
  - `exportVisitsCsv(params: { branchId?: string; startDate: string; endDate: string }): Promise<{ ok: boolean; csv?: string; filename?: string; error?: string }>`
  - `exportInventoryCsv(params: { branchId?: string; startDate: string; endDate: string }): Promise<{ ok: boolean; csv?: string; filename?: string; error?: string }>`
  - Route `/patients/[id]` (Server Component with patient demographic profile & visit timeline)
  - Interactive clickable links on `/patients` table

- [ ] **Step 1: Implement `src/lib/actions/intelligence.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updatePatientNotes(
  patientId: string,
  notes: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const patient = await prisma.patient.findFirst({
    where: { id: patientId, organizationId: session.user.organizationId },
    select: { id: true },
  });

  if (!patient) return { ok: false, error: "Data pasien tidak ditemukan." };

  await prisma.patient.update({
    where: { id: patientId },
    data: { notes: notes.trim() || null },
  });

  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/patients");
  return { ok: true };
}
```

- [ ] **Step 2: Implement `src/lib/actions/reports.ts`**

Implement CSV streaming server actions:
1. `exportAppointmentsCsv`:
   - Checks `session.user.organizationId` and user role (`DIRECTOR`, `MANAGER`, `SUPER_ADMIN`).
   - Fetches appointments filtered by branch (or all branches for directors) within `[startDate, endDate]`.
   - Formats columns using `encodeCsv`.
2. `exportVisitsCsv`:
   - Fetches completed visits within range.
   - Formats columns: ID Kunjungan, Tanggal, Cabang, Pasien, No Telp, Dokter, Layanan, Pembayaran (Rp), Metode Bayar, Catatan.
3. `exportInventoryCsv`:
   - Fetches `InventoryLog` records within range.
   - Formats columns: ID Log, Tanggal, Cabang, Barang, SKU, Kategori, Tipe, Qty, Stok Sebelum, Stok Sesudah, Petugas, Catatan.

- [ ] **Step 3: Implement `src/app/(portal)/patients/[id]/patient-notes-form.tsx`**

Client component with inline textarea for editing patient notes (allergies, medical alerts, special requests) submitting via `startTransition` to `updatePatientNotes`.

- [ ] **Step 4: Implement `src/app/(portal)/patients/[id]/page.tsx`**

Server component:
- Awaits `params: Promise<{ id: string }>`.
- Queries patient by `id` and `organizationId`, including:
  - `appointments` (ordered by `scheduledAt: desc`, taking 5)
  - `visits` (include `doctor`, `branch`, `service`, ordered by `createdAt: desc`)
- Displays:
  - Header with patient name, phone, email, date of birth, age calculation.
  - KPI summary: Total Visits, Total Payment, Upcoming Bookings.
  - Medical Notes card embedding `<PatientNotesForm />`.
  - Chronological Visit Timeline cards with procedure date in WIB, doctor name, branch name, service, visit notes, and payment method badge.

- [ ] **Step 5: Wire row links in `src/app/(portal)/patients/page.tsx`**

Update `src/app/(portal)/patients/page.tsx`:
Make patient name and action link clickable to `/patients/${patient.id}`.

- [ ] **Step 6: Verify typecheck & build**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/intelligence.ts src/lib/actions/reports.ts src/app/\(portal\)/patients/
GIT_MASTER=1 git commit -m "feat(intelligence): add patient detail timeline, notes editor, and CSV report export actions"
```

---

### Task 3: Executive Analytics Dashboard, Reports Hub & Sidebar Integration

**Files:**
- Create: `src/app/(portal)/operate/analytics/trend-chart.tsx`
- Create: `src/app/(portal)/operate/analytics/doctor-ranking-table.tsx`
- Create: `src/app/(portal)/operate/analytics/service-breakdown.tsx`
- Create: `src/app/(portal)/operate/analytics/page.tsx`
- Create: `src/app/(portal)/operate/reports/report-card.tsx`
- Create: `src/app/(portal)/operate/reports/page.tsx`
- Modify: `src/components/portal/sidebar.tsx`

**Interfaces:**
- Produces:
  - Route `/operate/analytics` with executive KPIs, period filters, and pure SVG charts
  - Route `/operate/reports` with interactive report cards and direct CSV downloads
  - Sidebar links "Analitik & KPI" and "Laporan & Ekspor" under `userModules.intelligence`

- [ ] **Step 1: Implement `trend-chart.tsx`**

Client/Server SVG component rendering a daily area/bar graph:
- Computes normalized SVG points `(x: 0..100, y: 0..100)`.
- Renders smooth gradient fill under area path.
- Displays X-axis date labels and hover tooltips for volume and revenue.

- [ ] **Step 2: Implement `doctor-ranking-table.tsx` and `service-breakdown.tsx`**

- `doctor-ranking-table.tsx`: Displays ranking table of doctors sorted by visits handled, total revenue generated, and active clinic branches.
- `service-breakdown.tsx`: Displays percentage contribution bar of each dental service to total clinic revenue.

- [ ] **Step 3: Implement `src/app/(portal)/operate/analytics/page.tsx`**

Server component:
- Protected by `auth()`, checks `session.user.organizationId` and `moduleIntelligence`.
- Awaits `searchParams: Promise<{ branch?: string; period?: string }>`.
- Resolves date range via `resolveDateRange(period)`.
- Queries visits and appointments within the window.
- Calculates KPIs (Total Revenue, Total Completed, No-Show Rate, Average Spend per Patient) and comparison growth percentages.
- Renders:
  - Period selector (*7 Hari Terakhir*, *30 Hari Terakhir*, *Bulan Ini*, *Bulan Lalu*).
  - Branch switcher (for Directors).
  - 4 KPI metric cards.
  - `<TrendChart />`.
  - Grid containing `<DoctorRankingTable />` and `<ServiceBreakdown />`.

- [ ] **Step 4: Implement `report-card.tsx` and `src/app/(portal)/operate/reports/page.tsx`**

- `report-card.tsx`: Client component with start/end date inputs, branch selector, and "Unduh CSV" button invoking the server action, creating a client-side Blob URL download.
- `page.tsx`: Server component rendering cards for Appointments, Visits & Revenue, and Inventory Stock Logs.

- [ ] **Step 5: Update `src/components/portal/sidebar.tsx`**

In `src/components/portal/sidebar.tsx`:
Add navigation items:
```ts
{ 
  name: "Analitik & KPI", 
  href: "/operate/analytics", 
  icon: BarChart3, 
  show: userModules.intelligence 
},
{ 
  name: "Laporan & Ekspor", 
  href: "/operate/reports", 
  icon: FileSpreadsheet, 
  show: userModules.intelligence 
},
```
Import `BarChart3` and `FileSpreadsheet` from `lucide-react`.

- [ ] **Step 6: Verify typecheck & production build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors, routes `/operate/analytics`, `/operate/reports`, `/patients/[id]` compile cleanly.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/analytics/ src/app/\(portal\)/operate/reports/ src/components/portal/sidebar.tsx
GIT_MASTER=1 git commit -m "feat(intelligence): add executive analytics dashboard, SVG trend chart, reports hub, and sidebar links"
```

---

### Task 4: End-to-End Verification & Quality Polish

- [ ] **Step 1: Zero em-dash scan**

Run: `git grep "\u2014" src/`
Expected: 0 matches.

- [ ] **Step 2: Run full Vitest suite**

Run: `npx vitest run`
Expected: All test files pass.

- [ ] **Step 3: Run ESLint and TypeScript checks**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: 100% successful build.

- [ ] **Step 5: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(intelligence): complete and verify Sprint 4 INTELLIGENCE module"
```
