# Design Specification: CONNECT Module Polish

**Date**: 2026-09-06  
**Status**: Approved  
**Module**: CONNECT (Patient Self-Booking & Clinic Front Desk Operations)

---

## 1. Overview & Goals

This specification defines the completion and hardening of three key features in the CONNECT module:
1. **Patient Self-Service Cancellation (`/cancel?token=...`)**: Token-based cancellation page with a 2-hour cutoff rule and reason capture, eliminating receptionist phone tag.
2. **WhatsApp Notification Engine & Click-to-Chat**: Formatted Indonesian message generators (`wa.me`) with reminder tracking (`reminderSentAt`, `reminder2hSentAt`) integrated directly into the staff portal.
3. **Doctor Schedule Blocking (`/portal/schedule`)**: Staff interface to block doctor availability for surgeries, leave, or clinic maintenance, preventing public booking during blocked windows.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   └── cancel/
│   │       ├── page.tsx                    # Public token-validated cancellation page
│   │       └── cancel-form.tsx             # Interactive confirmation form (Reason selection)
│   │
│   ├── (portal)/
│   │   └── schedule/
│   │       ├── page.tsx                    # Doctor schedule & block management server component
│   │       └── schedule-block-form.tsx     # Modal / Drawer to create a new ScheduleBlock
│   │
│   └── api/
│       └── public/
│           └── book/
│               └── route.ts                # Updated to check ScheduleBlock before appointment insert
│
├── lib/
│   ├── whatsapp.ts                         # Pure helpers to construct wa.me links with templates
│   └── actions/
│       ├── appointments.ts                 # Extended: cancelWithToken, markReminderSent
│       └── schedule.ts                     # Server actions: createScheduleBlock, deleteScheduleBlock
│
└── components/
    └── portal/
        └── appointment-wa-button.tsx       # Interactive button with H-1 / H-2h dropdown and status pill
```

---

## 3. Detailed Component Specifications

### 3.1 WhatsApp Notification Engine (`src/lib/whatsapp.ts`)

#### Helpers
- `formatPhoneForWhatsapp(phone: string): string`: Normalizes Indonesian numbers to international format (e.g., `0812...` -> `62812...`).
- `getConfirmationWaLink(apt: AppointmentDetail, baseUrl: string): string`:
  - Template: Salutation, branch name, doctor name, formatted date and time in WIB, clinic address, and self-service cancellation link (`${baseUrl}/cancel?token=${apt.cancelToken}`).
- `getReminderWaLink(apt: AppointmentDetail, type: "1day" | "2hour", baseUrl: string): string`:
  - **H-1**: Reminds patient of tomorrow's visit, asks to confirm or use the cancel link if schedule changes.
  - **H-2 Jam**: Friendly prompt that appointment starts in 2 hours with address and clinic hotline.

#### Server Action: `markReminderSent`
- Input: `appointmentId: string`, `type: "1day" | "2hour"`
- Security: Must verify `session.user.organizationId` matches appointment organization.
- Updates: `reminderSentAt: new Date()` or `reminder2hSentAt: new Date()`.
- Revalidates: `/appointments` and `/appointments/[id]`.

---

### 3.2 Patient Self-Service Cancellation (`/cancel`)

#### Route: `src/app/(marketing)/cancel/page.tsx`
- Receives `searchParams: { token?: string }`.
- Server Component queries Prisma: `prisma.appointment.findUnique({ where: { cancelToken: token }, include: { branch: true, doctor: true } })`.

#### States
1. **Invalid Token**: Displays clean alert: "Tautan pembatalan tidak valid atau telah kedaluwarsa."
2. **Already Cancelled**: Displays status card showing cancellation time and WhatsApp button to reschedule.
3. **Already Completed**: Displays notice that visit has already taken place.
4. **Cutoff Rule (< 2 Hours before `scheduledAt`)**:
   - Compares `scheduledAt` with `new Date()`.
   - If difference is `< 2 * 60 * 60 * 1000` ms, cancellation via web is locked to prevent empty clinic slots.
   - UI displays: "Pembatalan mandiri ditutup 2 jam sebelum jadwal. Silakan hubungi WhatsApp cabang langsung untuk perubahan jadwal mendesak."
5. **Eligible for Cancellation (> 2 Hours)**:
   - Renders `cancel-form.tsx` with appointment details summary.
   - Reason options:
     - "Perubahan jadwal mendadak"
     - "Kondisi kesehatan sudah membaik"
     - "Kendala transportasi / cuaca"
     - "Biaya / faktor finansial"
     - "Lainnya"
   - Textarea for optional notes.

#### Server Action: `cancelWithToken(token: string, reason: string)`
- Runs without user auth session, but strictly verifies `cancelToken`.
- Validates 2-hour cutoff rule on the server.
- Updates appointment:
  - `status: AppointmentStatus.CANCELLED`
  - `cancelledAt: new Date()`
  - `reasonForVisit: currentReason + " [Batal: " + reason + "]"`
- Revalidates `/appointments` and `/appointments/[id]`.

---

### 3.3 Doctor Schedule Blocking (`/portal/schedule`)

#### Route: `src/app/(portal)/schedule/page.tsx`
- Server Component querying:
  1. Active doctors in the user's organization with their regular weekly `Schedule` templates.
  2. Active and upcoming `ScheduleBlock` records for the organization.
- Filters: Doctor dropdown, Branch dropdown, and Month/Week view.

#### Server Actions (`src/lib/actions/schedule.ts`)
- `createScheduleBlock(data: { doctorId: string; branchId: string; startAt: Date; endAt: Date; reason?: string })`:
  - Validates `startAt < endAt`.
  - Validates doctor and branch belong to `session.user.organizationId`.
  - Inserts into `prisma.scheduleBlock`.
  - Revalidates `/schedule`.
- `deleteScheduleBlock(id: string)`:
  - Validates ownership via `session.user.organizationId`.
  - Deletes record.

#### Public Booking Guard (`src/app/api/public/book/route.ts`)
- During `POST`:
  - If `doctorId` is specified, queries `prisma.scheduleBlock.findFirst`:
    ```ts
    const block = await prisma.scheduleBlock.findFirst({
      where: {
        doctorId: validDoctorId,
        startAt: { lte: scheduledDate },
        endAt: { gte: scheduledDate },
      },
    });
    if (block) {
      return Response.json(
        { error: "Dokter sedang tidak bertugas atau berhalangan pada jam tersebut: " + (block.reason ?? "Jadwal diblokir") },
        { status: 400 }
      );
    }
    ```

---

## 4. Constraint & Style Compliance

- **Typography & Copy**: Zero em-dashes (U+2014) in all user-facing Indonesian text. Use `-` or `·`.
- **Styling**: Think Edge brand tokens: Primary Orange (`#f38218`), Ink (`#161817`), Paper (`#f7f5f0`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All date comparisons and display formatters use `Asia/Jakarta` (WIB).
- **Type Safety**: Full TypeScript strict mode, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Unit & Logic Check**:
   - Test 2-hour cutoff rule with mock dates (1 hour vs 3 hours).
   - Test phone normalization for WhatsApp links (`0812...` vs `+62812...` vs `62812...`).
2. **Public API Test**:
   - Attempt to book an appointment overlapping with a `ScheduleBlock` -> expect `400 Bad Request`.
3. **Cancellation Flow Test**:
   - Create booking -> extract `cancelToken` -> visit `/cancel?token=...` -> submit cancellation -> verify status in database changes to `CANCELLED`.
4. **Staff UI Test**:
   - Click WA Reminder button -> verify `wa.me` URL generated and `reminderSentAt` timestamp updated in database.
