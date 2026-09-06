# OPERATE Staff Shifts & Attendance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the Staff Shifts & Attendance management subsystem (Sub-Project 3B of OPERATE), providing dental clinics with weekly shift roster scheduling, preset shift templates, staff self-service Clock In / Clock Out, punctuality detection, and a live attendance monitoring board for branch managers.

**Architecture:** Extended Prisma schema with shift types, notes, and an `AttendanceRecord` model; pure punctuality evaluation utilities tested via Vitest; robust server actions enforcing multi-tenant and branch scoping; interactive weekly roster grid and clock in/out widgets; and portal navigation integration.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Prisma 6.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All day boundaries, shift hours, and clock-in timestamps must use `Asia/Jakarta` (WIB = UTC+7).
- Multi-tenant security: All queries and mutations must verify `session.user.organizationId` and respect branch scoping for non-directors.
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Prisma Schema & Seed Update for Shifts & Attendance

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces:
  - `Shift.shiftType: String`
  - `Shift.notes: String?`
  - `Shift.attendance: AttendanceRecord?`
  - `model AttendanceRecord` with relations to `Branch`, `User`, and `Shift`
  - `enum AttendanceStatus { ON_TIME, LATE, EARLY_LEAVE, PRESENT }`
  - Updated seed data with weekly staff shifts and realistic attendance records

- [ ] **Step 1: Update `prisma/schema.prisma`**

Update `model Shift`, `model AttendanceRecord`, and relations in `model Branch` and `model User`:
```prisma
model Shift {
  id        String   @id @default(cuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime
  startTime String   // "08:00"
  endTime   String   // "15:00"
  shiftType String   @default("PAGI") // "PAGI", "SIANG", "FULLDAY", "CUSTOM"
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  attendance AttendanceRecord?

  @@index([branchId, date])
  @@index([userId, date])
}

model AttendanceRecord {
  id         String           @id @default(cuid())
  branchId   String
  branch     Branch           @relation(fields: [branchId], references: [id], onDelete: Cascade)
  userId     String
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  shiftId    String?          @unique
  shift      Shift?           @relation(fields: [shiftId], references: [id], onDelete: SetNull)
  date       DateTime         // Date of attendance (anchored at 00:00:00 WIB)
  clockInAt  DateTime
  clockOutAt DateTime?
  status     AttendanceStatus @default(ON_TIME)
  notes      String?
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt

  @@index([branchId, date])
  @@index([userId, date])
}

enum AttendanceStatus {
  ON_TIME
  LATE
  EARLY_LEAVE
  PRESENT
}
```
In `model Branch`, add:
```prisma
attendances AttendanceRecord[]
```
In `model User`, add:
```prisma
attendances AttendanceRecord[]
```

- [ ] **Step 2: Generate Prisma Client**

Run: `npx prisma generate`
Expected: Prisma Client generated successfully.

- [ ] **Step 3: Update `prisma/seed.ts` with Shifts and Attendance records**

In `prisma/seed.ts`:
1. Find manager and staff users.
2. Seed shifts for the current week (Monday through Sunday):
   - Manager: Shift Pagi (`08:00 - 15:00`, `shiftType: "PAGI"`) at Kelapa Gading.
   - Staff: Shift Siang (`14:00 - 21:00`, `shiftType: "SIANG"`) at Kelapa Gading.
3. Seed sample `AttendanceRecord` for today:
   - Manager clocked in on time (`clockInAt: 07:55 WIB`, status `ON_TIME`).
4. Re-run or verify seed script types.

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add prisma/schema.prisma prisma/seed.ts src/generated/prisma/
GIT_MASTER=1 git commit -m "feat(operate): add shiftType, AttendanceRecord model, and seed shifts"
```

---

### Task 2: Punctuality Engine, Unit Tests, and Server Actions

**Files:**
- Create: `src/lib/attendance/punctuality.ts`
- Create: `tests/punctuality.test.ts`
- Create: `src/lib/actions/shifts.ts`
- Create: `src/lib/actions/attendance.ts`

**Interfaces:**
- Produces:
  - `evaluatePunctuality(clockInTime: Date, shiftStartTimeStr?: string | null, graceMinutes?: number): { status: "ON_TIME" | "LATE" | "PRESENT"; minutesLate: number }`
  - `SHIFT_PRESETS`: `Record<string, { label: string; startTime: string; endTime: string }>`
  - `assignShift(data: { userId: string; branchId: string; date: string; startTime: string; endTime: string; shiftType: string; notes?: string }): Promise<{ ok: boolean; error?: string; shiftId?: string }>`
  - `deleteShift(id: string): Promise<{ ok: boolean; error?: string }>`
  - `clockIn(data: { branchId: string; notes?: string }): Promise<{ ok: boolean; error?: string; attendanceId?: string; status?: string }>`
  - `clockOut(data: { attendanceId?: string; notes?: string }): Promise<{ ok: boolean; error?: string }>`

- [ ] **Step 1: Implement `src/lib/attendance/punctuality.ts`**

Create pure functions:
```ts
export const SHIFT_PRESETS = {
  PAGI: { label: "Shift Pagi", startTime: "08:00", endTime: "15:00", color: "bg-blue-50 text-blue-700 border-blue-200" },
  SIANG: { label: "Shift Siang", startTime: "14:00", endTime: "21:00", color: "bg-purple-50 text-purple-700 border-purple-200" },
  FULLDAY: { label: "Full Day", startTime: "08:00", endTime: "20:00", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
} as const;

export function evaluatePunctuality(
  clockInTime: Date,
  shiftStartTimeStr?: string | null,
  graceMinutes: number = 15,
): { status: "ON_TIME" | "LATE" | "PRESENT"; minutesLate: number } {
  if (!shiftStartTimeStr) {
    return { status: "PRESENT", minutesLate: 0 };
  }

  const [shiftHours, shiftMins] = shiftStartTimeStr.split(":").map(Number);
  if (shiftHours === undefined || shiftMins === undefined) {
    return { status: "PRESENT", minutesLate: 0 };
  }

  // Extract WIB hours & minutes from clockInTime
  const wibTime = new Date(clockInTime.getTime() + 7 * 60 * 60 * 1000);
  const clockInMinutes = wibTime.getUTCHours() * 60 + wibTime.getUTCMinutes();
  const shiftMinutes = shiftHours * 60 + shiftMins;

  const diff = clockInMinutes - shiftMinutes;
  if (diff <= graceMinutes) {
    return { status: "ON_TIME", minutesLate: Math.max(0, diff) };
  }

  return { status: "LATE", minutesLate: diff };
}

export function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}j ${m}m`;
}
```

- [ ] **Step 2: Write unit tests in `tests/punctuality.test.ts`**

Create `tests/punctuality.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { evaluatePunctuality, formatDurationMinutes } from "../src/lib/attendance/punctuality";

describe("Punctuality evaluation", () => {
  it("evaluates clock-in before or at shift start as ON_TIME", () => {
    // 08:00 WIB is 01:00 UTC
    const clockIn = new Date("2026-09-07T00:55:00.000Z"); // 07:55 WIB
    const res = evaluatePunctuality(clockIn, "08:00");
    expect(res.status).toBe("ON_TIME");
    expect(res.minutesLate).toBe(0);
  });

  it("evaluates clock-in within 15-minute grace period as ON_TIME", () => {
    const clockIn = new Date("2026-09-07T01:10:00.000Z"); // 08:10 WIB (10 mins late, within 15m grace)
    const res = evaluatePunctuality(clockIn, "08:00", 15);
    expect(res.status).toBe("ON_TIME");
    expect(res.minutesLate).toBe(10);
  });

  it("evaluates clock-in past grace period as LATE", () => {
    const clockIn = new Date("2026-09-07T01:25:00.000Z"); // 08:25 WIB (25 mins late)
    const res = evaluatePunctuality(clockIn, "08:00", 15);
    expect(res.status).toBe("LATE");
    expect(res.minutesLate).toBe(25);
  });

  it("evaluates unscheduled clock-in as PRESENT", () => {
    const clockIn = new Date("2026-09-07T01:00:00.000Z");
    const res = evaluatePunctuality(clockIn, null);
    expect(res.status).toBe("PRESENT");
  });

  it("formats duration properly", () => {
    expect(formatDurationMinutes(45)).toBe("45m");
    expect(formatDurationMinutes(125)).toBe("2j 5m");
  });
});
```

- [ ] **Step 3: Run Vitest tests**

Run: `npx vitest run tests/punctuality.test.ts`
Expected: 5/5 tests PASS.

- [ ] **Step 4: Implement `src/lib/actions/shifts.ts`**

Implement `assignShift` and `deleteShift`:
- Validates user and branch belong to `session.user.organizationId`.
- Non-directors are locked to their own `session.user.branchId`.
- Parse date string to UTC date representation.
- Upserts / creates shift.
- Revalidates `/operate/shifts`.

- [ ] **Step 5: Implement `src/lib/actions/attendance.ts`**

Implement `clockIn` and `clockOut`:
- `clockIn`:
  - Enforces `session.user.id`.
  - Checks if there is already an open attendance record today for this user (`clockOutAt === null`). If yes, return `{ ok: false, error: "Anda sudah melakukan clock in sebelumnya." }`.
  - Finds scheduled `Shift` for `userId` on today's WIB date.
  - Calls `evaluatePunctuality`.
  - Creates `AttendanceRecord`.
  - Revalidates `/operate/attendance` and `/dashboard`.
- `clockOut`:
  - Finds open `AttendanceRecord` for `session.user.id`.
  - If not found, return `{ ok: false, error: "Tidak ada sesi presensi aktif untuk clock out." }`.
  - Sets `clockOutAt: new Date()`.
  - Revalidates `/operate/attendance` and `/dashboard`.

- [ ] **Step 6: Verify typecheck & test suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 0 errors, all tests pass.

- [ ] **Step 7: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/attendance/ src/lib/actions/shifts.ts src/lib/actions/attendance.ts tests/punctuality.test.ts
GIT_MASTER=1 git commit -m "feat(operate): add punctuality engine, shift actions, and attendance server actions"
```

---

### Task 3: Client Components for Shifts & Attendance

**Files:**
- Create: `src/app/(portal)/operate/shifts/shift-assign-modal.tsx`
- Create: `src/app/(portal)/operate/shifts/weekly-roster-grid.tsx`
- Create: `src/app/(portal)/operate/attendance/clock-widget.tsx`
- Create: `src/app/(portal)/operate/attendance/attendance-board.tsx`

**Interfaces:**
- Produces:
  - `ShiftAssignModal`: Modal to assign presets or custom hours to a staff member on a date.
  - `WeeklyRosterGrid`: Interactive 7-day grid displaying staff rows and shift cards with deletion and editing.
  - `ClockWidget`: Real-time WIB digital clock, today's shift preview, and dynamic Clock In / Clock Out button.
  - `AttendanceBoard`: Manager live table with status pills (`Tepat Waktu`, `Terlambat`, `Hadir`), duration timer, and KPI summary.

- [ ] **Step 1: Implement `shift-assign-modal.tsx`**

Create `src/app/(portal)/operate/shifts/shift-assign-modal.tsx`:
Modal dialog displaying user name, target date, preset buttons (*Shift Pagi*, *Shift Siang*, *Full Day*), start/end time inputs, notes textarea, and submitting to `assignShift`.

- [ ] **Step 2: Implement `weekly-roster-grid.tsx`**

Create `src/app/(portal)/operate/shifts/weekly-roster-grid.tsx`:
Interactive table:
- Horizontal headers: Monday to Sunday of the current week with formatted dates.
- Vertical rows: Staff list with role badges.
- Cells: Shows assigned shift pill (`Pagi: 08:00 - 15:00`, `Siang: 14:00 - 21:00`) with edit/delete actions, or empty cell with hover "+ Tambah".
- Handles modal opening and state updates.

- [ ] **Step 3: Implement `clock-widget.tsx`**

Create `src/app/(portal)/operate/attendance/clock-widget.tsx`:
Client component:
- Live digital clock updated every second (WIB).
- Displays today's scheduled shift card.
- If not clocked in: Green **"Clock In Sekarang"** button with optional notes input.
- If clocked in: Running duration counter and Amber **"Clock Out"** button.
- If clocked out: Summary card showing jam masuk, jam pulang, and durasi kerja.

- [ ] **Step 4: Implement `attendance-board.tsx`**

Create `src/app/(portal)/operate/attendance/attendance-board.tsx`:
Manager live board:
- Metric cards: *Sedang Bertugas*, *Hadir Tepat Waktu*, *Terlambat*, *Total Presensi Hari Ini*.
- Table displaying attendee name, role, shift schedule, clock in time, clock out time, status badge (`Tepat Waktu` [emerald], `Terlambat` [amber], `Hadir` [blue]), and notes.

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/shifts/ src/app/\(portal\)/operate/attendance/
GIT_MASTER=1 git commit -m "feat(operate): add weekly roster grid, shift modal, clock widget, and attendance board"
```

---

### Task 4: Main Pages & Portal Navigation Integration

**Files:**
- Create: `src/app/(portal)/operate/shifts/page.tsx`
- Create: `src/app/(portal)/operate/attendance/page.tsx`
- Modify: `src/components/portal/sidebar.tsx`

**Interfaces:**
- Produces:
  - Route `/operate/shifts` (Server Component)
  - Route `/operate/attendance` (Server Component)
  - Sidebar links "Jadwal Shift" and "Presensi Staf"

- [ ] **Step 1: Implement `src/app/(portal)/operate/shifts/page.tsx`**

Server Component:
1. Authenticates session, checks `session.user.organizationId` and `moduleOperate`.
2. Awaits `searchParams: Promise<{ branch?: string; week?: string }>`.
3. Resolves 7 days of the selected week (anchored in WIB).
4. Queries staff users (`STAFF`, `MANAGER`, `DOCTOR`) for the selected branch.
5. Queries `Shift` records for those users in the selected week.
6. Renders branch/week selector and `<WeeklyRosterGrid />`.

- [ ] **Step 2: Implement `src/app/(portal)/operate/attendance/page.tsx`**

Server Component:
1. Authenticates session, checks `session.user.organizationId` and `moduleOperate`.
2. Awaits `searchParams: Promise<{ branch?: string }>`.
3. Queries today's scheduled shift for `session.user.id`.
4. Queries today's active/completed `AttendanceRecord` for `session.user.id`.
5. For Managers/Directors: Queries all `AttendanceRecord` records for today across the branch with user details.
6. Renders `<ClockWidget />` for the logged-in user and `<AttendanceBoard />` for branch-wide monitoring.

- [ ] **Step 3: Update `src/components/portal/sidebar.tsx`**

In `src/components/portal/sidebar.tsx`:
Add navigation items:
```ts
{ 
  name: "Jadwal Shift", 
  href: "/operate/shifts", 
  icon: CalendarDays, 
  show: userModules.operate 
},
{ 
  name: "Presensi Staf", 
  href: "/operate/attendance", 
  icon: UserCheck, 
  show: userModules.operate 
},
```
Import `UserCheck` from `lucide-react`.

- [ ] **Step 4: Verify typecheck & production build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors, `/operate/shifts` and `/operate/attendance` appear as dynamic routes.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/shifts/page.tsx src/app/\(portal\)/operate/attendance/page.tsx src/components/portal/sidebar.tsx
GIT_MASTER=1 git commit -m "feat(operate): connect shift roster page, attendance page, and sidebar navigation"
```

---

### Task 5: End-to-End Verification & Quality Polish

- [ ] **Step 1: Zero em-dash scan**

Run: `git grep "\u2014" src/`
Expected: 0 matches.

- [ ] **Step 2: Run all Vitest unit tests**

Run: `npx vitest run`
Expected: All tests pass across punctuality, inventory, schedule, and whatsapp suites.

- [ ] **Step 3: Run ESLint and TypeScript checks**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: 100% successful build.

- [ ] **Step 5: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(operate): complete and verify Sub-Project 3B staff shifts and attendance"
```
