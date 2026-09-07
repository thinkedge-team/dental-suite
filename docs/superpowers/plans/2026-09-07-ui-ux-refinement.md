# UI/UX Refinement Implementation Plan: Booking Schedule Flow & Unified Settings Hub

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the public booking schedule UX with an interactive 14-day date carousel and session-based time slot chips, and unify the portal settings into a cohesive, high-end hub with tab sub-navigation.

**Architecture:** Pure date/slot utility helpers in `src/app/(marketing)/book/date-slot-utils.ts` tested with Vitest; interactive `StepSchedule` component replacing raw date/time HTML inputs; Next.js route-group layout in `src/app/(portal)/settings/layout.tsx` with `settings-nav.tsx`; and visual redesigns of Profile, Security, and Organization pages.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All dates and time calculations anchored in `Asia/Jakarta` (WIB = UTC+7).
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Date & Time Slot Utilities for Booking

**Files:**
- Create: `src/app/(marketing)/book/date-slot-utils.ts`
- Create: `tests/date-slot-utils.test.ts`

**Interfaces:**
- Produces:
  - `generateNextDays(count: number, now?: Date): { iso: string; dayName: string; dayNum: number; monthName: string; isToday: boolean; isTomorrow: boolean; dayOfWeek: number }[]`
  - `SESSION_TIME_SLOTS`: Record of morning, afternoon, and evening slot chips
  - `isDoctorAvailableOnDay(schedules: { dayOfWeek: number; isActive: boolean }[], dayOfWeek: number): boolean`

- [ ] **Step 1: Write unit tests in `tests/date-slot-utils.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  generateNextDays,
  isDoctorAvailableOnDay,
  SESSION_TIME_SLOTS,
} from "../src/app/(marketing)/book/date-slot-utils";

describe("Date & Slot Utilities", () => {
  it("generates 14 consecutive calendar dates in WIB", () => {
    const fixedNow = new Date("2026-09-07T05:00:00.000Z"); // 12:00 WIB
    const days = generateNextDays(14, fixedNow);
    expect(days.length).toBe(14);
    expect(days[0]?.isToday).toBe(true);
    expect(days[1]?.isTomorrow).toBe(true);
    expect(days[0]?.dayName).toBeDefined();
    expect(days[0]?.monthName).toBeDefined();
  });

  it("evaluates doctor practice days correctly", () => {
    const doctorSchedules = [
      { dayOfWeek: 1, isActive: true }, // Monday
      { dayOfWeek: 3, isActive: true }, // Wednesday
      { dayOfWeek: 5, isActive: false }, // Friday (inactive)
    ];
    expect(isDoctorAvailableOnDay(doctorSchedules, 1)).toBe(true);
    expect(isDoctorAvailableOnDay(doctorSchedules, 2)).toBe(false); // Tuesday
    expect(isDoctorAvailableOnDay(doctorSchedules, 5)).toBe(false); // Friday inactive
  });

  it("provides clinical session time slots", () => {
    expect(SESSION_TIME_SLOTS.morning.slots.length).toBeGreaterThan(0);
    expect(SESSION_TIME_SLOTS.afternoon.slots.length).toBeGreaterThan(0);
    expect(SESSION_TIME_SLOTS.evening.slots.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Implement `src/app/(marketing)/book/date-slot-utils.ts`**

```ts
const WIB_OFFSET_HOURS = 7;
const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

export interface CalendarDayOption {
  readonly iso: string;
  readonly dayName: string;
  readonly dayNum: number;
  readonly monthName: string;
  readonly isToday: boolean;
  readonly isTomorrow: boolean;
  readonly dayOfWeek: number; // 0=Sunday, 1=Monday, ...
}

export function generateNextDays(count: number = 14, now: Date = new Date()): CalendarDayOption[] {
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS);
  const startYear = wibNow.getUTCFullYear();
  const startMonth = wibNow.getUTCMonth();
  const startDate = wibNow.getUTCDate();

  const days: CalendarDayOption[] = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  for (let i = 0; i < count; i++) {
    const cur = new Date(Date.UTC(startYear, startMonth, startDate + i));
    const y = cur.getUTCFullYear();
    const m = cur.getUTCMonth();
    const d = cur.getUTCDate();
    const dow = cur.getUTCDay();

    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      iso,
      dayName: dayNames[dow] ?? "",
      dayNum: d,
      monthName: monthNames[m] ?? "",
      isToday: i === 0,
      isTomorrow: i === 1,
      dayOfWeek: dow,
    });
  }

  return days;
}

export function isDoctorAvailableOnDay(
  schedules?: { readonly dayOfWeek: number; readonly isActive: boolean }[] | null,
  dayOfWeek?: number,
): boolean {
  if (!schedules || schedules.length === 0 || dayOfWeek === undefined) return true;
  return schedules.some((s) => s.dayOfWeek === dayOfWeek && s.isActive);
}

export const SESSION_TIME_SLOTS = {
  morning: {
    label: "Sesi Pagi",
    period: "09:00 - 11:30",
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  afternoon: {
    label: "Sesi Siang",
    period: "13:00 - 15:00",
    slots: ["13:00", "13:30", "14:00", "14:30", "15:00"],
  },
  evening: {
    label: "Sesi Sore / Malam",
    period: "16:00 - 18:00",
    slots: ["16:00", "16:30", "17:00", "17:30", "18:00"],
  },
} as const;
```

- [ ] **Step 3: Run tests and verify**

Run: `npx vitest run tests/date-slot-utils.test.ts`
Expected: 3/3 tests PASS.

- [ ] **Step 4: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(marketing\)/book/date-slot-utils.ts tests/date-slot-utils.test.ts
GIT_MASTER=1 git commit -m "feat(book): add date carousel and session slot utilities with tests"
```

---

### Task 2: Interactive Date Carousel & Session Slot Chips in Booking Wizard

**Files:**
- Modify: `src/app/(marketing)/book/step-schedule.tsx`
- Modify: `src/app/(marketing)/book/booking-wizard.tsx`
- Modify: `src/app/(marketing)/book/booking-types.ts`

**Interfaces:**
- Replaces raw HTML `<input type="date">` and `<input type="time">` with:
  - 14-day touch-scrollable date carousel
  - Session slot chip buttons with active indicators and doctor availability dimming

- [ ] **Step 1: Update `Doctor` interface in `booking-types.ts`**

Ensure `Doctor` type exposes `schedules?: { dayOfWeek: number; isActive: boolean }[]`:
```ts
export interface Doctor {
  readonly id: string;
  readonly name: string;
  readonly specialty: string | null;
  readonly photoUrl: string | null;
  readonly branches: { readonly branchId: string }[];
  readonly schedules?: { readonly dayOfWeek: number; readonly isActive: boolean }[];
}
```

- [ ] **Step 2: Re-implement `src/app/(marketing)/book/step-schedule.tsx`**

Replace inputs with:
1. **Summary banner**: Selected Branch, Doctor, and Service with clean pill badges.
2. **Date Carousel**:
   - Header with calendar icon: "Pilih Tanggal Kunjungan"
   - Horizontal scroll strip of 14 day cards (`generateNextDays()`).
   - Cards display `dayName`, `dayNum`, `monthName`, and `Hari Ini` badge.
   - Doctor schedule check: If doctor is selected and doesn't practice on that day, card is styled disabled with label "Libur".
   - Clicking an active card updates `form.date`.
3. **Session-based Time Slot Chips**:
   - Only shown once a date is selected.
   - 3 session cards: *Sesi Pagi* (`SunMedium`), *Sesi Siang* (`Sun`), *Sesi Sore / Malam* (`Moon`).
   - Each session renders a grid of interactive chip buttons for its times.
   - Selected chip turns Primary Orange with checkmark.
4. Clean navigation buttons: "Kembali" and "Lanjutkan".

- [ ] **Step 3: Update `booking-wizard.tsx` & `page.tsx`**

Ensure `schedules` are passed through from Prisma into `Doctor` objects so `step-schedule.tsx` can check availability.

- [ ] **Step 4: Verify typecheck & test suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 0 errors, all tests pass.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(marketing\)/book/
GIT_MASTER=1 git commit -m "feat(book): overhaul schedule step with 14-day date carousel and session slot chips"
```

---

### Task 3: Unified Portal Settings Hub Layout & Sub-Navigation

**Files:**
- Create: `src/app/(portal)/settings/layout.tsx`
- Create: `src/app/(portal)/settings/settings-nav.tsx`
- Modify: `src/app/(portal)/settings/profile/page.tsx`
- Modify: `src/app/(portal)/settings/security/page.tsx`
- Modify: `src/app/(portal)/settings/organization/page.tsx`

**Interfaces:**
- Produces:
  - Unified settings layout with header and sub-navigation tabs
  - Interactive client tab navigation bar tracking current pathname
  - Cohesive Think Edge card design across all three settings views

- [ ] **Step 1: Implement `src/app/(portal)/settings/settings-nav.tsx`**

Client component rendering tab bar:
- Tab items:
  - *Profil Saya* (`/settings/profile`, icon: `User`)
  - *Keamanan Akun* (`/settings/security`, icon: `ShieldCheck`)
  - *Klinik & Lisensi* (`/settings/organization`, icon: `Building2`, conditionally shown if `isDirector`)
- Active tab styling with Primary Orange bottom border indicator and font-semibold.

- [ ] **Step 2: Implement `src/app/(portal)/settings/layout.tsx`**

Server Component layout:
- Authenticates session with `auth()`.
- Renders:
  - Clean header section: Eyebrow "Pusat Kontrol", Title "Pengaturan & Preferensi", subtitle text.
  - Sub-navigation tab strip `<SettingsNav isDirector={isDirector} />`.
  - `{children}` container.

- [ ] **Step 3: Refine Visual Layouts of Settings Pages**

- In `profile/page.tsx`: Remove redundant top header (now handled by layout), enhance visual styling of avatar card and form card.
- In `security/page.tsx`: Remove redundant top header, align card styling with profile.
- In `organization/page.tsx`: Remove redundant top header, present clinic profile form on left and 2-column entitlement cards on right with refined spacing and badges.

- [ ] **Step 4: Verify typecheck & production build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors, all settings routes compile cleanly.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/settings/
GIT_MASTER=1 git commit -m "feat(settings): add unified settings hub layout, tab navigation, and visual refinement"
```

---

### Task 4: End-to-End Verification & Quality Polish

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
GIT_MASTER=1 git commit -m "chore(ui): complete and verify UI/UX refinement for booking and settings"
```
