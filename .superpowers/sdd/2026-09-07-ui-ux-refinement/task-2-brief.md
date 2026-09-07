# Task 2 Brief: Interactive Date Carousel & Session Slot Chips in Booking Wizard

## Context
UI/UX Refinement in `dental-suite`.
Working directory: `/home/imyourdream/Work/thinkedge/dental-suite`

## Files to touch
- Modify: `src/app/(marketing)/book/booking-types.ts`
- Modify: `src/app/(marketing)/book/booking-wizard.tsx`
- Modify: `src/app/(marketing)/book/page.tsx`
- Modify: `src/app/(marketing)/book/step-schedule.tsx`

## Requirements
1. `src/app/(marketing)/book/booking-types.ts`:
   - Update `Doctor` interface to include optional `schedules`:
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

2. `src/app/(marketing)/book/page.tsx`:
   - In `prisma.doctor.findMany`, include `schedules: { select: { dayOfWeek: true, isActive: true } }` so schedule availability reaches the booking wizard.

3. `src/app/(marketing)/book/step-schedule.tsx`:
   - Overhaul the component completely, replacing native `<input type="date">` and `<input type="time">`:
   - **Top summary card**: Clean pill badges for Cabang, Dokter, and Layanan.
   - **Date Carousel (14 Hari ke Depan)**:
     - Header: "Pilih Tanggal Kunjungan" with Calendar icon.
     - Horizontal touch-scrollable strip (`overflow-x-auto flex gap-2.5 pb-2 no-scrollbar`).
     - Cards generated via `generateNextDays(14)`.
     - Displays `dayName`, `dayNum`, `monthName`, and "Hari Ini" / "Besok" pill.
     - Doctor schedule check: If doctor is selected, calls `isDoctorAvailableOnDay(selectedDoctor.schedules, day.dayOfWeek)`. If false, dims card with `opacity-50 cursor-not-allowed` and label "Libur".
     - Clicking an available date updates `form.date`.
   - **Session-Based Time Slot Chips**:
     - When a date is selected, shows time slots grouped into 3 clinical sessions:
       - **Sesi Pagi** (09:00 - 11:30) with `SunMedium` icon
       - **Sesi Siang** (13:00 - 15:00) with `Sun` icon
       - **Sesi Sore / Malam** (16:00 - 18:00) with `Moon` icon
     - Renders grid of interactive buttons for each 30-minute slot.
     - Selected slot: Primary Orange background (`bg-primary text-primary-foreground font-bold shadow-sm`), checkmark icon.
     - Unselected slot: Card background (`bg-card border border-border/80 hover:border-primary/50 text-foreground`).
     - Single click updates `form.time`.
   - Bottom navigation buttons: "Kembali" and "Lanjutkan" (disabled until both date and time are selected).

4. Global Constraints:
   - Strictly ZERO em-dashes (U+2014) in code and copy. Use `-` or `·`.
   - TypeScript strict mode, clean types. No `as any`, no `@ts-ignore`.
   - Commit with:
     `GIT_MASTER=1 git commit -m "feat(book): overhaul schedule step with 14-day date carousel and session slot chips"`
