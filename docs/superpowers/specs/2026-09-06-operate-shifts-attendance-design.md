# Design Specification: OPERATE Module - Staff Shifts & Attendance

**Date**: 2026-09-06  
**Status**: Approved  
**Module**: OPERATE (Sub-Project 3B: Staff Shifts & Attendance)

---

## 1. Overview & Goals

In multi-branch dental clinic networks, clinical specialists have appointment schedules while operational staff (receptionists, dental assistants, nurses, cashiers) work in shifts. Managing shifts via spreadsheets leads to unstaffed clinic hours, delayed patient check-ins, and disputed attendance records.

This specification covers Sub-Project 3B of the OPERATE module:
1. **Weekly Shift Roster (`/operate/shifts`)**: Interactive multi-branch weekly schedule grid with one-click shift presets (*Pagi*, *Siang*, *Fullday*, *Libur/Off*) and staff assignment.
2. **Staff Attendance Tracking (`/operate/attendance`)**: Self-service Clock In / Clock Out card for clinic staff with real-time WIB clock and shift linkage.
3. **Punctuality & Late Detection**: Automated comparison against scheduled shift start times (with a 15-minute grace threshold) classifying records into `ON_TIME`, `LATE`, or `PRESENT`.
4. **Live Attendance Board for Managers**: Real-time monitoring board displaying active on-duty staff, late arrivals, and daily attendance summaries per branch.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   └── (portal)/
│       └── operate/
│           ├── shifts/
│           │   ├── page.tsx                # Server Component: Weekly roster view by branch & week
│           │   ├── weekly-roster-grid.tsx  # Interactive client weekly grid with cell popovers
│           │   └── shift-assign-modal.tsx  # Modal to assign/update shift preset or custom hours
│           │
│           └── attendance/
│               ├── page.tsx                # Server Component: Dual view (Staff clock widget + Manager board)
│               ├── clock-widget.tsx        # Client Component: Real-time clock in / clock out interface
│               └── attendance-board.tsx    # Client Component: Live branch attendance status board
│
├── lib/
│   ├── actions/
│   │   ├── shifts.ts                       # Server actions: assignShift, bulkAssignShifts, deleteShift
│   │   └── attendance.ts                   # Server actions: clockIn, clockOut
│   └── attendance/
│       └── punctuality.ts                  # Pure utility calculating lateness, shift matching, and durations
│
├── components/
│   └── portal/
│       └── sidebar.tsx                     # Updated with "Jadwal Shift" and "Presensi Staf" menu items
│
└── prisma/
    ├── schema.prisma                       # Updated Shift model + AttendanceRecord model & AttendanceStatus enum
    └── seed.ts                             # Seeded shifts for the current week and sample attendance logs
```

---

## 3. Detailed Technical Specifications

### 3.1 Data Model (`prisma/schema.prisma`)

```prisma
model Shift {
  id        String   @id @default(cuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime // Date of the shift (anchored at 00:00:00 WIB)
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

---

### 3.2 Shift Presets & Punctuality Engine (`src/lib/attendance/punctuality.ts`)

#### Shift Presets
- `PAGI`: `08:00` - `15:00` (7 hours)
- `SIANG`: `14:00` - `21:00` (7 hours)
- `FULLDAY`: `08:00` - `20:00` (12 hours)

#### Punctuality Evaluation
```ts
export function evaluatePunctuality(
  clockInTime: Date,
  shiftStartTimeStr?: string | null,
  graceMinutes: number = 15,
): { status: "ON_TIME" | "LATE" | "PRESENT"; minutesLate: number }
```
- Converts `clockInTime` to WIB (`Asia/Jakarta`) hours and minutes.
- If no `shiftStartTimeStr`: Returns status `PRESENT` (unscheduled / extra shift).
- Compares clock-in minutes against `shiftStartTime + graceMinutes`:
  - If `clockInMinutes <= shiftMinutes + graceMinutes` -> `ON_TIME`.
  - If `clockInMinutes > shiftMinutes + graceMinutes` -> `LATE` (captures `minutesLate`).

---

### 3.3 Server Actions

#### 1. Shift Server Actions (`src/lib/actions/shifts.ts`)
- `assignShift(data: { userId: string; branchId: string; date: string; startTime: string; endTime: string; shiftType: string; notes?: string })`:
  - Enforces `session.user.organizationId`.
  - Enforces branch scoping: Non-directors are locked to their own `branchId`.
  - Upserts or updates the `Shift` record for that user on that date.
  - Revalidates `/operate/shifts`.
- `deleteShift(id: string)`:
  - Deletes shift if user has permission for the shift's branch.

#### 2. Attendance Server Actions (`src/lib/actions/attendance.ts`)
- `clockIn(data: { branchId: string; notes?: string })`:
  - Enforces authenticated session.
  - Enforces single active clock-in: Rejects if user already clocked in today without clocking out.
  - Finds scheduled `Shift` for `userId` on today's WIB date.
  - Evaluates punctuality using `evaluatePunctuality`.
  - Creates `AttendanceRecord` linking `shiftId` if found.
  - Revalidates `/operate/attendance` and `/dashboard`.
- `clockOut(data: { notes?: string })`:
  - Finds the active open `AttendanceRecord` (where `clockOutAt === null`).
  - Sets `clockOutAt: new Date()`.
  - Revalidates `/operate/attendance` and `/dashboard`.

---

### 3.4 User Interface Specifications

#### 1. Weekly Shift Roster (`/operate/shifts`)
- **Controls**: Week selector (Prev Week, Current Week, Next Week), Branch dropdown (for Directors; locked badge for Staff).
- **Roster Grid**:
  - Horizontal headers: 7 days of selected week (Monday to Sunday) with Indonesian date labels.
  - Vertical rows: Staff members assigned to the branch (name, role badge).
  - Cells: Clickable cards showing assigned shift type, hours badge, and notes. Empty cells display a subtle plus icon on hover to assign.
- **Assignment Modal**:
  - Quick buttons for presets: *Pagi*, *Siang*, *Fullday*, *Libur/Off*.
  - Custom start & end time inputs.

#### 2. Staff Attendance & Manager Live Board (`/operate/attendance`)
- **Staff Clock Widget**:
  - Live clock display (WIB, updated every second).
  - Shift card: Shows scheduled shift today (e.g. *Shift Pagi: 08:00 - 15:00 · Cabang Kelapa Gading*).
  - Dynamic button:
    - *Before clock-in*: Big emerald **"Clock In Sekarang"** button.
    - *While on duty*: Timer badge showing active working duration and amber **"Clock Out"** button.
    - *After clock-out*: Completed summary card (jam masuk, jam pulang, total jam kerja).
- **Manager Live Board**:
  - KPI Cards: *Sedang Bertugas*, *Hadir Tepat Waktu*, *Terlambat*, *Total Presensi Hari Ini*.
  - Live Status Table: List of staff who clocked in today with photo/avatar, branch, shift schedule, clock in time, clock out time, status pill (`Tepat Waktu`, `Terlambat`, `Hadir`), and duration.

---

## 4. Constraint & Brand Token Compliance

- **Typography & Copy**: Strictly zero em-dashes (U+2014). Use `-` or `·`. All labels in Indonesian (*Jadwal Shift*, *Presensi Staf*, *Sedang Bertugas*, *Tepat Waktu*, *Terlambat*).
- **Styling**: Think Edge brand tokens: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All date comparisons and display formatters use `Asia/Jakarta` (WIB = UTC+7).
- **Type Safety**: Full TypeScript strict mode, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Unit Tests (`tests/punctuality.test.ts`)**:
   - Test shift evaluation: On-time arrivals, within 15-minute grace period, late arrivals, and unscheduled shifts.
2. **Server Actions Logic**:
   - Verify double clock-in prevention.
   - Verify branch scoping (staff cannot assign shifts or clock into unauthorized branches).
3. **End-to-End Build & Lint**:
   - `npx vitest run` -> 100% pass.
   - `npx eslint "src/**/*.{ts,tsx}"` -> 0 errors.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run build` -> clean build without errors.
