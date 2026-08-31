# Module Scoping: CONNECT — Appointment & Booking

> **Phase 2.1 Deliverable**
> Defining CONNECT module scope based on user research findings.

---

## Core Questions

### Q1: Real-time slot availability, or best-effort (WA confirmation after)?

**Decision: Real-time availability check with optimistic locking.**

**Rationale:**
- **Interview finding (Receptionist):** "Double-booking happens 3+ times per month — two receptionists enter appointments at the same time in different Excel files"
- **Interview finding (Patient):** "I hate waiting 12 hours for WhatsApp reply"
- **Interview finding (Director):** "If patients can book online and I see those bookings in real-time — I'll sign immediately"

**CONNECT delivers:**
- Patient sees only truly available slots (query checks existing appointments in real-time)
- When patient clicks "Book", system checks availability again before confirming (optimistic lock)
- If slot was taken between page load and submit → show error: "Slot sudah penuh, silakan pilih waktu lain"
- No "pending confirmation" state — booking is instant or fails

**NOT best-effort:** No manual receptionist confirmation step. Patient books → done.

**Edge case handled:** Two patients click same slot simultaneously → first `INSERT` wins, second gets error due to unique constraint `[doctorId, scheduledAt]`

---

### Q2: Single-clinic booking or multi-branch search?

**Decision: Multi-branch search with smart defaults.**

**Rationale:**
- **Interview finding (Director):** "Branch A fully booked, Branch B empty 5 km away, patient goes to competitor — we're losing patients"
- **Interview finding (Patient):** "Location must be close to home or office"

**CONNECT delivers:**

**Booking flow:**
1. Patient enters location or allows geolocation
2. System shows branches sorted by distance
3. Patient picks branch → sees available doctors at that branch
4. Patient picks doctor → sees available dates/times

**Multi-branch search (optional path):**
- If patient's preferred branch has no availability in next 7 days → show "Coba cabang lain?" button
- Clicking shows same time slots at other branches within 10 km
- Example: Patient wants Monday 10 AM at Kelapa Gading (full) → system suggests Monday 10 AM at Pluit (5 km away, available)

**Smart defaults:**
- If patient has booked before → default to their last branch
- If new patient → default to nearest branch based on IP geolocation (with manual override)

**NOT in scope:**
- Advanced "find me any doctor across any branch this week" search (too complex for MVP)
- Automatic re-routing (system doesn't auto-assign patient to another branch without their consent)

---

### Q3: Patient identity — anonymous booking or account-based?

**Decision: Hybrid — anonymous booking with optional account.**

**Rationale:**
- **Interview finding (Patient):** "Make it like Halodoc or Alodokter — those apps are so easy"
- **Interview finding (Receptionist):** "I need name and phone number"
- **UU PDP compliance:** Must get explicit consent before storing data

**CONNECT delivers:**

**MVP flow (no account required):**
1. Patient fills booking form:
   - Name (required)
   - Phone (required, used as identifier)
   - Email (optional)
   - Reason for visit (optional dropdown: Cleaning / Toothache / Consultation / Other)
   - Insurance partner (optional dropdown from clinic's list)
   - Consent checkbox (required): "Saya setuju data saya disimpan sesuai [Kebijakan Privasi](/privacy)"
2. System creates or updates `Patient` record (phone is unique key)
3. Booking confirmed → patient receives WA message with booking details + cancellation link

**No login required** for booking. Patient identified by phone number.

**Phase 2+ (optional account):**
- Patient can create account (phone + password) to view booking history
- Faster rebooking (pre-filled info)
- For MVP: out of scope

**Why hybrid wins:**
- Low friction (patient doesn't need to create account just to book once)
- Clinic still gets patient data (name + phone = enough for follow-up)
- Compliant with UU PDP (explicit consent at booking time)

---

### Q4: WA Business API or wa.me click-to-chat?

**Decision: wa.me click-to-chat for MVP. WA Business API = Phase 2.**

**Rationale (from ADR-004 + interview findings):**
- **wa.me advantages:**
  - Free
  - No Meta approval process
  - Works immediately
  - Patient gets clickable link in browser → opens WA with pre-filled message
  
- **WA Business API advantages:**
  - Automated reminders (no manual sending)
  - Template messages
  - Multi-agent support
  - BUT: requires Meta BSP account, 1-2 week approval, ~IDR 500-1000 per conversation

**MVP implementation:**

**1-day before reminder (automated):**
- System generates `wa.me` link with pre-filled message
- Receptionist clicks link in portal → WA Web opens with message ready to send
- Message template:
  ```
  Halo [Patient Name],

  Pengingat: Anda memiliki janji dengan [Doctor Name] besok, [Date] pukul [Time] di [Branch Name].

  Alamat: [Address]
  
  Jika tidak bisa hadir, silakan batalkan via link ini: [Cancel Link]

  Terima kasih!
  [Clinic Name]
  ```

**2-hour before reminder (automated — new from interview findings):**
- Same flow as above
- Interview finding (Patient): "If they sent another reminder 2 hours before, that would have helped"

**Booking confirmation (instant):**
- Patient submits booking → page shows "Booking berhasil! Kami sudah mengirim konfirmasi via WhatsApp."
- Page displays `wa.me` button: "Klik untuk chat dengan kami"
- Clicking opens WA with message: "Halo, saya [Name], sudah booking untuk [Date] [Time] dengan [Doctor]. Terima kasih!"

**Receptionist responsibility (MVP):**
- Receptionist opens portal → sees "Reminders to Send" list
- Clicks "Send Reminder" → opens WA Web with pre-filled message
- Receptionist hits Send in WA (manual last step)

**Phase 2 upgrade path:**
- Clinic signs up for WA Business API (via Qontak, Kanal, or other BSP)
- Think Edge adds API integration
- Reminders send automatically (no receptionist action)

---

### Q5: Check-in flow — QR code? Name lookup? Walk-in support?

**Decision: Simple name lookup + manual check-in button. No QR code in MVP.**

**Rationale:**
- **Interview finding (Receptionist):** "When patient arrives, I ask their name, find them on the printed list, cross off"
- Simplest digital equivalent: receptionist searches by name → clicks "Check In"

**CONNECT delivers:**

**Receptionist portal view:**
```
/portal/appointments/today

[Branch: Kelapa Gading ▼] [Doctor: Semua ▼] [Status: Semua ▼]

┌─────────────────────────────────────────────────────────────┐
│ 09:00 - dr. Andi Pratama                                   │
│ Ibu Dewi Kartika | 0812-3456-7890                          │
│ Reason: Cleaning                                            │
│ Status: CONFIRMED                                           │
│ [Check In] [Cancel] [Reschedule]                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 09:30 - dr. Andi Pratama                                   │
│ Bapak Budi Santoso | 0821-9876-5432                        │
│ Reason: Toothache                                           │
│ Status: CHECKED_IN ✓                                        │
│ Checked in at 09:25                                         │
│ [Start Treatment]                                           │
└─────────────────────────────────────────────────────────────┘
```

**Check-in flow:**
1. Patient arrives, tells receptionist their name
2. Receptionist searches (instant filter by name or phone)
3. Receptionist clicks "Check In" button
4. Status changes from `CONFIRMED` → `CHECKED_IN`
5. Timestamp recorded

**Walk-in support:**
- "New Appointment" button in receptionist portal
- Receptionist selects doctor + time → fills in patient name + phone → creates appointment with status `WALK_IN`
- Same as online booking, but initiated by receptionist

**Phase 2+ (QR code):**
- Patient receives QR code in WA confirmation
- Clinic has tablet at entrance
- Patient scans QR → auto check-in
- Defer to Phase 2 — adds hardware requirement (tablet) + patient confusion ("how do I scan?")

---

### Q6: Cancellation & rescheduling policy — who can reschedule? Window cutoff?

**Decision: Patient can cancel up to 2 hours before appointment. Reschedule = cancel + rebook.**

**Rationale:**
- **Interview finding (Receptionist):** "10-15% cancel or reschedule. They WhatsApp me, I have to manually move the booking."
- **Interview finding (Patient):** "Work conflict, traffic — sometimes I can't make it"

**CONNECT delivers:**

**Patient cancellation:**
- Patient receives booking confirmation WA with cancellation link
- Link format: `https://[domain]/cancel?token=[signed-jwt]`
- Clicking link → page shows appointment details + "Yakin ingin membatalkan?" button
- Patient confirms → status changes to `CANCELLED`, slot becomes available again
- **Cutoff:** 2 hours before appointment — if within 2 hours, cancellation disabled, must call clinic

**Patient rescheduling:**
- MVP: Cancel + rebook (two-step process)
- Patient cancels → redirected to booking page with message: "Silakan buat janji baru"
- Patient selects new date/time → books again (same phone number, so existing Patient record is reused)

**Phase 2+:** One-step reschedule (patient picks new date/time without canceling first)

**Receptionist rescheduling:**
- Receptionist portal has "Reschedule" button on each appointment
- Clicking opens modal: pick new date/time → confirms → appointment updated
- System sends WA to patient: "Janji Anda telah diubah ke [New Date] [New Time]. Konfirmasi: [Yes/No links]"

**No-show handling:**
- If patient doesn't check in by appointment time + 15 minutes → receptionist marks as "No-Show"
- Status changes to `NO_SHOW`
- Slot stays blocked (can't be rebooked retroactively)

**Policy enforcement (business rule):**
```typescript
const CANCELLATION_WINDOW_HOURS = 2;

function canCancel(appointment: Appointment): boolean {
  const now = new Date();
  const appointmentTime = appointment.scheduledAt;
  const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursDiff >= CANCELLATION_WINDOW_HOURS;
}
```

---

## User Stories (Validated Against Interviews)

### Patient

> "As a patient, I want to book a specific doctor at a specific branch for next Tuesday."

**CONNECT delivers:**
- ✅ Patient selects branch → doctor → date → time → fills form → instant confirmation
- ✅ Real-time slot availability (no double-booking)
- ✅ WA confirmation with cancellation link

**Acceptance criteria:**
- Booking completes in < 2 minutes
- Patient sees only available slots (no "sorry, that's full" after form submission)
- WA confirmation received within 30 seconds

---

### Receptionist

> "As a receptionist, I want to see today's appointment list and check patients in when they arrive."

**CONNECT delivers:**
- ✅ `/portal/appointments/today` → filtered by branch
- ✅ One-click check-in button
- ✅ Real-time updates (if another receptionist checks in, this receptionist sees it immediately)

**Acceptance criteria:**
- Today's appointments load in < 1 second
- Check-in updates status instantly
- Search by name works with partial match ("Dewi" finds "Dewi Kartika")

---

### Doctor

> "As a doctor, I want to block a slot when I'm unavailable without asking the receptionist."

**CONNECT delivers:**
- ✅ Doctor portal: `/portal/schedule/my-schedule`
- ✅ Calendar view showing their appointments
- ✅ "Block Time" button → select date + time range → slot becomes unavailable for booking

**Acceptance criteria:**
- Doctor blocks Tuesday 2-4 PM → those slots disappear from public booking page immediately
- Doctor can unblock later if plans change
- Receptionist can override (book into blocked slot if patient insists)

---

## Must-Have vs Defer

### Must-Have (MVP — Sprint 2)

| Feature | Why | Effort |
|---|---|---|
| **Public booking widget** (branch → doctor → date → time → form) | Core deliverable — saves receptionist 3-4 hours/day | 1.5 weeks |
| **Real-time slot availability** (query + optimistic lock) | Prevents double-booking (happens 3x/month) | 3 days |
| **Multi-branch selection** with distance sorting | Patient picks nearest branch | 2 days |
| **Cross-branch availability hint** ("Try another branch?") | Director pain point — losing patients | 2 days |
| **Anonymous booking** (no account required) | Low friction (patient interview: "make it easy") | 1 day |
| **UU PDP consent checkbox** | Legal requirement | 1 day |
| **Receptionist appointment list** (today's view, filter by branch/doctor/status) | Receptionist daily task | 3 days |
| **One-click check-in** | Replaces paper list crossing-off | 1 day |
| **Walk-in appointment creation** | 20-30% of patients are walk-ins | 2 days |
| **Patient cancellation** (link in WA, 2-hour cutoff) | 10-15% cancel (interview) | 3 days |
| **Receptionist reschedule** | Receptionist interview: "move booking manually" | 3 days |
| **wa.me reminder generation** (1-day + 2-hour reminders) | Patient wants 2-hour reminder (interview finding) | 2 days |
| **Doctor self-scheduling** (block unavailable slots) | Doctor interview: "let me manage availability" | 1 week |
| **Appointment status tracking** (CONFIRMED, CHECKED_IN, COMPLETED, NO_SHOW, CANCELLED) | Audit trail + analytics | 2 days |

**Total effort: ~3 weeks**

---

### Nice-to-Have (Phase 2)

| Feature | Why defer | Effort |
|---|---|---|
| **WA Business API** (automated reminders) | Requires Meta approval + BSP account | 1 week |
| **Patient account** (login, view history) | MVP: phone number is enough | 1 week |
| **One-step reschedule** | Cancel + rebook works for MVP | 3 days |
| **QR code check-in** | Needs tablet at entrance, patient education | 1 week |
| **Recurring appointments** (e.g., braces follow-up every 2 weeks) | Nice-to-have, manual rebooking works | 1 week |
| **Waitlist** (if slot full, notify when available) | Complex, low ROI | 1 week |
| **SMS reminders** | SMS is dead in Indonesia, WA is king | 3 days |
| **Patient rating** (rate experience after visit) | Trust signal, but Google reviews more important | 3 days |
| **Queue management** (patient sees "you're 3rd in line") | Nice-to-have, interview: "sometimes 30 min wait" | 1 week |

---

### Out of Scope

| Feature | Why |
|---|---|
| **Video consultation / telemedicine** | Different product, regulatory complexity |
| **Payment processing** (online payment) | MVP: payment at clinic, online payment = Phase 3 |
| **Subscription booking** (monthly cleaning auto-book) | No demand signal |
| **Group booking** (family books together) | Edge case, manual works |
| **Doctor preference learning** (suggest doctor based on past) | Too advanced, low ROI |

---

## Booking Flow UX (Patient-Facing)

### Step 1: Select Branch

```
┌──────────────────────────────────────────────────┐
│  Pilih Lokasi Klinik                             │
├──────────────────────────────────────────────────┤
│  [📍 Gunakan lokasi saya]                        │
│                                                   │
│  ○ Kelapa Gading (2.3 km)                        │
│     Jl. Boulevard Raya No. 123                   │
│     Buka: 09:00 - 20:00                          │
│                                                   │
│  ○ Pluit (5.1 km)                                │
│     Jl. Pluit Indah No. 45                       │
│     Buka: 09:00 - 18:00                          │
│                                                   │
│  ○ Kemang (8.7 km)                               │
│     Jl. Kemang Raya No. 78                       │
│     Buka: 10:00 - 19:00                          │
│                                                   │
│  [Lanjut →]                                      │
└──────────────────────────────────────────────────┘
```

### Step 2: Select Doctor

```
┌──────────────────────────────────────────────────┐
│  Pilih Dokter Gigi                               │
│  Klinik: Kelapa Gading                           │
├──────────────────────────────────────────────────┤
│  ○ dr. Andi Pratama, drg.                        │
│     Dokter Gigi Umum                             │
│     Tersedia: Senin - Kamis                      │
│                                                   │
│  ○ drg. Sari Wijaya, Sp.Ort                      │
│     Spesialis Ortodonti (Behel)                  │
│     Tersedia: Selasa, Jumat                      │
│                                                   │
│  ○ Dokter Manapun (Tercepat)                     │
│     Lihat slot paling cepat dari semua dokter    │
│                                                   │
│  [← Kembali]  [Lanjut →]                         │
└──────────────────────────────────────────────────┘
```

### Step 3: Select Date & Time

```
┌──────────────────────────────────────────────────┐
│  Pilih Tanggal & Waktu                           │
│  Dokter: dr. Andi Pratama                        │
├──────────────────────────────────────────────────┤
│  [< September 2026 >]                            │
│                                                   │
│  Sen  Sel  Rab  Kam  Jum  Sab  Min              │
│   1    2    3    4    5    6    7               │
│   8    9   [10]  11   12   13   14              │
│  15   16   17   18   19   20   21              │
│                                                   │
│  Rabu, 10 September 2026                         │
│                                                   │
│  Pagi:                                           │
│  ○ 09:00  ○ 09:30  ○ 10:00  ○ 10:30  ○ 11:00   │
│                                                   │
│  Siang:                                          │
│  ○ 13:00  ○ 13:30  ● 14:00  ○ 14:30  ○ 15:00   │
│                                                   │
│  [Tidak ada yang cocok? Coba cabang lain →]     │
│                                                   │
│  [← Kembali]  [Lanjut →]                         │
└──────────────────────────────────────────────────┘
```

### Step 4: Patient Info

```
┌──────────────────────────────────────────────────┐
│  Informasi Pasien                                │
├──────────────────────────────────────────────────┤
│  Nama Lengkap *                                  │
│  [_________________________]                     │
│                                                   │
│  Nomor Telepon (WhatsApp) *                      │
│  [+62 ] [_____________________]                  │
│                                                   │
│  Email (opsional)                                │
│  [_________________________]                     │
│                                                   │
│  Keperluan Kunjungan                             │
│  [Pilih ▼] Pembersihan / Sakit Gigi / Konsultasi│
│                                                   │
│  Asuransi (opsional)                             │
│  [Pilih ▼] BPJS / Allianz / Prudential / Lain   │
│                                                   │
│  ☑ Saya setuju data saya disimpan sesuai        │
│     [Kebijakan Privasi]                          │
│                                                   │
│  [← Kembali]  [Konfirmasi Booking →]            │
└──────────────────────────────────────────────────┘
```

### Step 5: Confirmation

```
┌──────────────────────────────────────────────────┐
│  ✓ Booking Berhasil!                             │
├──────────────────────────────────────────────────┤
│  Kode Booking: #BK123456                         │
│                                                   │
│  📅 Rabu, 10 September 2026 - 14:00              │
│  👨‍⚕️ dr. Andi Pratama, drg.                      │
│  📍 Klinik Gigi Senyum Sehat - Kelapa Gading    │
│      Jl. Boulevard Raya No. 123                  │
│                                                   │
│  ─────────────────────────────────────           │
│                                                   │
│  Kami sudah mengirim konfirmasi ke WhatsApp Anda │
│  di +62 812-3456-7890                            │
│                                                   │
│  [💬 Chat via WhatsApp]                          │
│  [📅 Tambah ke Kalender]                         │
│  [❌ Batalkan Booking]                           │
│                                                   │
│  Harap datang 10 menit lebih awal.              │
│                                                   │
│  [Kembali ke Beranda]                            │
└──────────────────────────────────────────────────┘
```

---

## Technical Notes

### Slot Availability Query (Real-Time)

```typescript
async function getAvailableSlots(doctorId: string, branchId: string, date: Date) {
  // 1. Get doctor schedule for that day
  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      doctorId,
      branchId,
      dayOfWeek: date.getDay(), // 0=Sun, 1=Mon, etc.
      isActive: true,
    },
  });

  if (!schedule) return []; // Doctor not available that day

  // 2. Generate all possible slots (e.g., 30-min intervals from startTime to endTime)
  const slots = generateTimeSlots(schedule.startTime, schedule.endTime, 30);

  // 3. Get existing appointments for that doctor + date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledAt: {
        gte: startOfDay(date),
        lt: endOfDay(date),
      },
      status: { in: ['CONFIRMED', 'CHECKED_IN'] }, // Exclude cancelled/no-show
    },
    select: { scheduledAt: true },
  });

  // 4. Filter out occupied slots
  const occupiedTimes = existingAppointments.map(a => a.scheduledAt.getTime());
  const availableSlots = slots.filter(slot => !occupiedTimes.includes(slot.getTime()));

  return availableSlots;
}
```

### Double-Booking Prevention (Optimistic Lock)

```typescript
// Unique constraint in Prisma schema (already exists)
@@unique([doctorId, scheduledAt])

// When creating appointment:
try {
  const appointment = await prisma.appointment.create({
    data: { doctorId, scheduledAt, patientId, ... },
  });
  return { success: true, appointment };
} catch (error) {
  if (error.code === 'P2002') { // Unique constraint violation
    return { success: false, error: 'Slot sudah penuh' };
  }
  throw error;
}
```

### WA Reminder Generation

```typescript
function generateReminderLink(appointment: Appointment): string {
  const clinic = appointment.branch.organization;
  const message = encodeURIComponent(
    `Halo ${appointment.patient.name},\n\n` +
    `Pengingat: Anda memiliki janji dengan ${appointment.doctor.name} besok, ` +
    `${format(appointment.scheduledAt, 'dd MMMM yyyy', { locale: id })} pukul ` +
    `${format(appointment.scheduledAt, 'HH:mm')} di ${appointment.branch.name}.\n\n` +
    `Alamat: ${appointment.branch.address}\n\n` +
    `Jika tidak bisa hadir, batalkan via link ini: ${getCancelUrl(appointment)}\n\n` +
    `Terima kasih!\n${clinic.name}`
  );

  return `https://wa.me/${appointment.patient.phone.replace(/\D/g, '')}?text=${message}`;
}
```

---

## Success Metrics (Post-Launch)

| Metric | Target | Source |
|---|---|---|
| **Online bookings/month** | 40%+ of total appointments | CONNECT data |
| **Double-booking incidents** | <1 per month per branch | Support tickets |
| **Average booking time** | <2 minutes | Analytics |
| **Cancellation rate** | <15% | CONNECT data |
| **No-show rate** | <20% (down from 20-30%) | CONNECT data |
| **Receptionist time saved** | 2+ hours/day per branch | Interview follow-up |

---

## Next: OPERATE & INTELLIGENCE Scoping

CONNECT is the highest-value MVP module. OPERATE/INTELLIGENCE defer to Phase 2, but document scope anyway.
