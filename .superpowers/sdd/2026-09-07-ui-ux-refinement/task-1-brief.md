# Task 1 Brief: Date & Time Slot Utilities for Booking

## Context
UI/UX Refinement in `dental-suite`.
Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`

## Files to touch
- Create: `src/app/(marketing)/book/date-slot-utils.ts`
- Create: `tests/date-slot-utils.test.ts`

## Requirements
1. `src/app/(marketing)/book/date-slot-utils.ts`:
   - Pure helpers with zero server directives or DB imports:
     - `generateNextDays(count = 14, now = new Date()): CalendarDayOption[]`:
       - Calculates dates anchored in `Asia/Jakarta` (WIB = UTC+7).
       - Generates `count` consecutive calendar days.
       - Returns objects with: `iso` ("YYYY-MM-DD"), `dayName` ("Sen", "Sel", "Rab", etc.), `dayNum` (number), `monthName` ("Sep", "Okt", etc.), `isToday` (boolean), `isTomorrow` (boolean), `dayOfWeek` (0=Min, 1=Sen, ... 6=Sab).
     - `isDoctorAvailableOnDay(schedules?: { readonly dayOfWeek: number; readonly isActive: boolean }[] | null, dayOfWeek?: number): boolean`:
       - Returns `true` if `schedules` is null/empty or undefined.
       - Otherwise checks if there is any active schedule for that `dayOfWeek`.
     - `SESSION_TIME_SLOTS`:
       - Record of clinical sessions:
         - `morning`: label "Sesi Pagi", period "09:00 - 11:30", slots `["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]`.
         - `afternoon`: label "Sesi Siang", period "13:00 - 15:00", slots `["13:00", "13:30", "14:00", "14:30", "15:00"]`.
         - `evening`: label "Sesi Sore / Malam", period "16:00 - 18:00", slots `["16:00", "16:30", "17:00", "17:30", "18:00"]`.

2. `tests/date-slot-utils.test.ts`:
   - Unit tests covering:
     - 14-day generator with fixed date.
     - Doctor practice day evaluator (active vs inactive vs missing schedule).
     - Clinical session time slots integrity.
   - Verify `npx vitest run tests/date-slot-utils.test.ts`.

3. Global Constraints:
   - Strictly ZERO em-dashes (U+2014) in code and copy. Use `-` or `·`.
   - TypeScript strict mode, clean types. No `as any`, no `@ts-ignore`.
   - Commit with:
     `GIT_MASTER=1 git commit -m "feat(book): add date carousel and session slot utilities with tests"`
