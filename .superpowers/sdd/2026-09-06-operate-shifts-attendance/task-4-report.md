# Task 4 Execution Report: Main Pages & Portal Navigation Integration

## Summary
Successfully integrated the OPERATE staff shifts and attendance module into the Dental Suite portal:
1. Created `src/app/(portal)/operate/shifts/page.tsx`:
   - Protected Server Component requiring valid session with `organizationId`.
   - Verified `moduleOperate === true` on the Organization; renders locked module card if disabled.
   - Awaits `searchParams: Promise<{ branch?: string; week?: string }>` following Next.js 16 conventions.
   - Resolves target week Monday to Sunday in WIB (UTC+7) from either ISO week format (`YYYY-Www`), ISO date (`YYYY-MM-DD`), or current date default.
   - Resolves active branch dynamically for `DIRECTOR`/`SUPER_ADMIN` with branch switcher, or locks to `session.user.branchId` for other roles.
   - Fetches branch staff (roles `STAFF`, `MANAGER`, `DOCTOR`) and scheduled `Shift` records within the week bounds.
   - Renders page header, branch switcher, week navigation (Minggu Lalu, Minggu Ini, Minggu Depan), and `<WeeklyRosterGrid />`.
2. Created `src/app/(portal)/operate/attendance/page.tsx`:
   - Protected Server Component with `moduleOperate` verification.
   - Awaits `searchParams: Promise<{ branch?: string }>`.
   - Uses `getWibDayBounds` to determine today's WIB start and end timestamps.
   - Fetches today's scheduled `Shift` and `AttendanceRecord` for the logged-in user.
   - For `MANAGER`, `DIRECTOR`, and `SUPER_ADMIN`: queries all today's branch `AttendanceRecord` entries with related user and shift data.
   - Renders page header with branch switcher, top section `<ClockWidget />` for the logged-in user, and lower section `<AttendanceBoard />` for managers and directors.
3. Updated `src/components/portal/sidebar.tsx`:
   - Imported `UserCheck` from `lucide-react`.
   - Added navigation entries for "Jadwal Shift" (`/operate/shifts`, `CalendarDays`) and "Presensi Staf" (`/operate/attendance`, `UserCheck`) under `userModules.operate`.
4. Added test suite in `tests/shifts-week.test.ts`:
   - Verified Monday-anchoring across ISO date strings, Sunday edge-cases, and ISO week strings (`2026-W37`).
   - Verified WIB offset calculations (UTC+7).

## Global Constraints Compliance
- Zero em-dashes (U+2014): Verified across all files using script; only `-` and `·` used.
- TypeScript strict mode: 0 errors with `npx tsc --noEmit`. No `as any`, no `@ts-ignore`.
- Next.js 16 conventions: `searchParams: Promise<...>` awaited in both Server Components.

## Verification Results
- `npx tsc --noEmit`: PASS (0 errors)
- `npx vitest run`: PASS (5 test files, 32 tests passed)
