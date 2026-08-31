# Implementation Plan: Module CONNECT (Sprint 2)

> **Phase 3.3 Deliverable**
> Detailed file map, concurrency design, WA helper implementation, and test criteria for Sprint 2 (CONNECT Module).

---

## 1. Goal & Scope

Deliver the core operational bridge between patients and clinic staff:
1. **Public Booking Widget (`/buat-janji`):** Multi-step, real-time appointment booking with cross-branch availability and smart defaults.
2. **Receptionist Portal (`/portal/appointments`):** Daily dashboard for managing check-ins, walk-ins, cancellations, and sending WA reminders.
3. **Doctor Self-Scheduling (`/portal/schedule`):** Interface for doctors to view their schedule and block out unavailable time slots using `ScheduleBlock`.
4. **WA Link Helpers & Cancellations:** Mechanism to generate pre-filled `wa.me` reminder messages and secure, token-based cancellation links.

---

## 2. File Map

```
src/
├── app/
│   ├── (marketing)/
│   │   └── buat-janji/               # Public booking entry point
│   │       ├── page.tsx              # Wrapper / landing for booking widget
│   │       └── success/page.tsx      # Confirmation page with WA chat link & cancel info
│   │
│   ├── (portal)/connect/             # Protected Staff Interfaces
│   │   ├── appointments/             
│   │   │   ├── today/page.tsx        # Receptionist view: Today's filtered appointment list
│   │   │   ├── all/page.tsx          # Manager/Director view: Searchable history
│   │   │   └── new/page.tsx          # Walk-in booking creation form
│   │   ├── reminders/                
│   │   │   └── page.tsx              # Action list for pending 1-day and 2-hour WA reminders
│   │   └── schedule/                 
│   │       └── my-schedule/page.tsx  # Doctor view: Personal calendar and slot blocking
│   │
│   ├── api/
│   │   ├── appointments/
│   │   │   └── route.ts              # POST: Public booking endpoint (Rate-limited, Zod validated)
│   │   ├── slots/
│   │   │   └── route.ts              # GET: Real-time availability query (Short TTL cache)
│   │   └── cancel/
│   │       └── route.ts              # POST: Unauthenticated token-based cancellation
│   │
├── actions/
│   └── connect/
│       ├── appointment.ts            # Server Actions: check-in, manual cancel, reschedule, mark no-show
│       ├── schedule-block.ts         # Server Actions: create/remove doctor availability blocks
│       └── reminder.ts               # Server Actions: mark WA reminder as sent
│
├── lib/
│   ├── validations/
│   │   └── connect.ts                # Zod schemas (Booking, Cancel, BlockTime)
│   ├── whatsapp.ts                   # Helper: Generates wa.me links with formatted messages
│   └── rate-limit.ts                 # LRU-cache based rate limiting utility
│
└── components/
    ├── connect/
    │   ├── booking-widget/           # Multi-step interactive client component (React Hook Form + Zustand)
    │   │   ├── branch-step.tsx
    │   │   ├── doctor-step.tsx
    │   │   ├── time-step.tsx         # Fetches from /api/slots
    │   │   └── details-step.tsx      # Collects patient info & UU PDP consent
    │   ├── appointment-card.tsx      # Receptionist view item with status badges
    │   ├── check-in-button.tsx       # Quick-action mutation component
    │   └── calendar-blocker.tsx      # Interactive calendar for doctors to select and block times
```

---

## 3. Concurrency & Booking Logic

### 3.1 Double-Booking Prevention (Optimistic Locking)
- **Constraint:** Prisma schema defines `@@unique([doctorId, scheduledAt])`.
- **Flow:**
  1. Patient selects a slot fetched from `/api/slots`.
  2. Patient submits the form to `POST /api/appointments`.
  3. The API attempts to `prisma.appointment.create(...)`.
  4. If another user claimed the slot milliseconds prior, Postgres throws a unique constraint violation (`P2002`).
  5. The API catches `P2002` and returns HTTP 409: "Slot sudah penuh. Silakan pilih waktu lain."
  6. The booking widget gracefully handles the 409, refreshes availability, and prompts the user to select a new time.

### 3.2 Slot Generation Algorithm (`/api/slots`)
- Fetches active `Schedule` (weekly recurring templates) for the given doctor/branch/day.
- Fetches existing `Appointment` records (status `CONFIRMED` or `CHECKED_IN`) for that date.
- Fetches active `ScheduleBlock` records covering that date.
- Generates 30-min intervals based on `Schedule.startTime` and `Schedule.endTime`.
- Filters out any interval that falls in the past, exists in the `Appointment` list, or overlaps with a `ScheduleBlock`.

---

## 4. WA Integration & Cancellation Workflow

### 4.1 WA Reminder Links (MVP)
- Utility `generateReminderWaLink(appointment, type)` constructs a deep link `https://wa.me/{phone}?text={encodedMsg}`.
- Receptionists view the `/portal/reminders` dashboard showing upcoming appointments lacking a `reminderSentAt` or `reminder2hSentAt` timestamp.
- Clicking the link opens WhatsApp Web; upon return, the receptionist clicks "Mark Sent" triggering the `markReminderSent` Server Action.

### 4.2 Secure Patient Cancellation
- **Token Generation:** At booking, a 32-character crypto-random string is saved to `Appointment.cancelToken`.
- **Notification:** The generated cancellation URL (`https://app.thinkedge.id/cancel?token=...`) is injected into the WA confirmation message.
- **Enforcement:** `POST /api/cancel` looks up the token. If the appointment is within 2 hours of `scheduledAt`, it returns 409 `CANCELLATION_WINDOW_PASSED`. Otherwise, it updates status to `CANCELLED`, records `cancelledAt`, and nullifies `cancelToken` to prevent reuse.

---

## 5. Verification & Acceptance Criteria

- [ ] **Booking Race Condition:** Concurrent E2E tests simulating two users booking the exact same `doctorId` and `scheduledAt` result in exactly one successful booking and one 409 conflict error.
- [ ] **Rate Limiting:** Firing 15 requests to `POST /api/appointments` from the same IP within 1 minute results in HTTP 429 Too Many Requests.
- [ ] **Doctor Scheduling:** A doctor adding a `ScheduleBlock` for Tuesday 14:00 immediately removes that 14:00 slot from `/api/slots` results for that day.
- [ ] **Check-In Flow:** A receptionist clicking "Check-In" correctly transitions the appointment status from `CONFIRMED` to `CHECKED_IN` and records the `checkInAt` timestamp.
- [ ] **Cancellation Enforcement:** Attempting to use a cancellation token for an appointment scheduled 1 hour from now is rejected with the 2-hour window policy error.
