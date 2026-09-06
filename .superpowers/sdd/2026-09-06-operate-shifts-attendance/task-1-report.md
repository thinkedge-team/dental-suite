# Task 1 Execution Report: Prisma Schema & Seed Update for Shifts & Attendance

## Status
DONE

## Summary of Changes
1. `prisma/schema.prisma`:
   - Added `attendances AttendanceRecord[]` relation to `Branch` model.
   - Added `attendances AttendanceRecord[]` relation to `User` model.
   - Updated `Shift` model with `shiftType String @default("PAGI")`, `notes String?`, `attendance AttendanceRecord?`, and index `@@index([userId, date])`.
   - Added `AttendanceRecord` model with relations to `Branch`, `User`, and optional 1:1 relation to `Shift`.
   - Added `AttendanceStatus` enum (`ON_TIME`, `LATE`, `EARLY_LEAVE`, `PRESENT`).
   - Ran `npx prisma generate` to rebuild Prisma client in `src/generated/prisma`.

2. `prisma/seed.ts`:
   - Updated to import `AttendanceStatus`.
   - Seeded weekly shifts (Monday to Sunday) for current week:
     - Manager (`manager@demo.com`): Shift Pagi (`08:00 - 15:00`, `shiftType: "PAGI"`) at Kelapa Gading branch.
     - Staff (`staff@demo.com`): Shift Siang (`14:00 - 21:00`, `shiftType: "SIANG"`) at Kelapa Gading branch.
   - Seeded sample `AttendanceRecord` for today (anchored in WIB):
     - Manager clocked in on time (`status: AttendanceStatus.ON_TIME`, `clockInAt: 07:55 WIB`).

## Verification
- `npx prisma generate`: Succeeded (v6.19.3 to `./src/generated/prisma`).
- `npx tsc --noEmit`: Clean, 0 errors.
- `npx vitest run`: 3 test files passed, 17 tests passed.
- Em-dash verification: Confirmed 0 em-dash characters (U+2014) in `prisma/schema.prisma` and `prisma/seed.ts`.

## Commit
- feat(operate): add shiftType, AttendanceRecord model, and seed shifts
