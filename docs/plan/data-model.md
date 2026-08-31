# Data Model Finalization

> **Phase 3.2 Deliverable**
> Final schema rationale, field additions from brainstorming, index justification, migration plan.

---

## Current Schema Assessment

The scaffold schema (`prisma/schema.prisma`) covers all 4 modules. This document reviews it against MVP scope decisions made in Phase 2, identifies missing fields, and documents the index strategy.

---

## Required Field Additions (from Phase 2 Brainstorming)

### 1. `Patient` — UU PDP Consent + Soft Delete

**Missing fields identified in regulatory.md:**
- `consentedAt DateTime?` — timestamp when patient accepted privacy consent
- `consentIp String?` — IP address at consent time (audit trail)
- `deletedAt DateTime?` — soft delete for 5-year retention (Permenkes 269)

**Missing field from CONNECT module scoping:**
- `notes String?` — internal notes by receptionist (not EMR, just "patient prefers morning appointments")

```prisma
model Patient {
  id             String    @id @default(cuid())
  organizationId String
  name           String
  phone          String
  email          String?
  dob            DateTime?
  notes          String?       // ← NEW: receptionist notes
  consentedAt    DateTime?     // ← NEW: UU PDP consent timestamp
  consentIp      String?       // ← NEW: IP at consent time (audit)
  deletedAt      DateTime?     // ← NEW: soft delete (5-year retention)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  visits Visit[]
  appointments Appointment[]  // ← NEW: direct relation

  @@unique([organizationId, phone])
  @@index([organizationId, deletedAt])  // ← NEW: filter soft-deleted efficiently
}
```

---

### 2. `Appointment` — Patient FK + Reminder Tracking + Insurance

**Missing fields from CONNECT module scoping:**
- `patientId String?` — FK to `Patient` record (MVP: optional, created at booking)
- `insurancePartnerId String?` — which insurance the patient is using
- `reasonForVisit String?` — dropdown reason ("Cleaning", "Toothache", "Consultation")
- `reminderSentAt DateTime?` — when 1-day reminder was sent
- `reminder2hSentAt DateTime?` — when 2-hour reminder was sent
- `cancelledAt DateTime?` — when cancelled (for analytics)
- `cancelToken String? @unique` — signed cancellation token (from WA link)
- `walkin Boolean @default(false)` — distinguish walk-in from online booking

**Status note:** Current schema uses inline `patientName String` + `patientPhone String`. Keep both for walk-ins; add `patientId` as optional FK for online bookings that create a Patient record.

```prisma
model Appointment {
  id             String            @id @default(cuid())
  organizationId String
  branchId       String
  branch         Branch            @relation(fields: [branchId], references: [id], onDelete: Cascade)
  doctorId       String?
  doctor         Doctor?           @relation(fields: [doctorId], references: [id], onDelete: SetNull)
  patientId      String?           // ← NEW: FK to Patient (null for walk-ins)
  patient        Patient?          @relation(fields: [patientId], references: [id], onDelete: SetNull)
  patientName    String            // kept: denormalized for walk-ins + fast display
  patientPhone   String            // kept: denormalized for WA reminder links
  insurancePartnerId String?       // ← NEW: FK to InsurancePartner
  insurancePartner InsurancePartner? @relation(fields: [insurancePartnerId], references: [id])
  service        String?
  reasonForVisit String?           // ← NEW: Cleaning / Toothache / Consultation / Other
  status         AppointmentStatus @default(CONFIRMED) // changed: PENDING → CONFIRMED (online bookings confirm immediately)
  scheduledAt    DateTime
  checkInAt      DateTime?
  cancelledAt    DateTime?         // ← NEW: cancellation timestamp
  cancelToken    String?  @unique  // ← NEW: one-time cancellation token (WA link)
  walkin         Boolean  @default(false) // ← NEW: walk-in vs online booking
  reminderSentAt   DateTime?       // ← NEW: 1-day reminder sent timestamp
  reminder2hSentAt DateTime?       // ← NEW: 2-hour reminder sent timestamp
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@unique([doctorId, scheduledAt])          // prevent double-booking
  @@index([branchId, scheduledAt])
  @@index([organizationId, status])
  @@index([organizationId, scheduledAt])     // ← NEW: director cross-branch view
  @@index([patientPhone])                    // ← NEW: receptionist search by phone
}
```

**Status change reasoning:** Online booking should create `CONFIRMED` immediately (not `PENDING` requiring manual confirmation — that's the old manual flow). Walk-ins also start as `CONFIRMED`. `PENDING` status can be reserved for future edge cases (e.g., provisional hold).

---

### 3. `InsurancePartner` — New GROW Model

**Missing from schema entirely (needed by GROW + CONNECT):**

```prisma
model InsurancePartner {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  slug           String
  logoUrl        String?
  coverageDetails String?     // what services are covered (text)
  claimProcess   String?      // how to file a claim (text)
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  appointments Appointment[]

  @@unique([organizationId, slug])
}
```

---

### 4. `Organization` — GROW CMS Fields + Location Data

**Missing from Organization:**
- `logoUrl String?` — clinic logo (GROW website)
- `primaryColor String?` — brand color for website template
- `seoTitle String?` — custom SEO title override
- `seoDescription String?` — custom meta description

**Missing from Branch (GROW location pages):**
- `city String?` — city name (for SEO: "Klinik Gigi [City]")
- `province String?` — province (Jawa Barat, DKI Jakarta)
- `postalCode String?` — postal code
- `openingHours Json?` — structured hours `{ "mon": "09:00-20:00", "tue": "09:00-20:00", ... }` (replaces loose `schedule Json?`)
- `parkingInfo String?` — parking description ("Parking tersedia untuk 20 mobil")
- `googleMapsUrl String?` — direct Google Maps link
- `photoUrls String[]` — gallery photos

```prisma
model Organization {
  // ... existing fields ...
  logoUrl        String?
  primaryColor   String?   // hex color e.g. "#3B82F6"
  seoTitle       String?
  seoDescription String?

  // ... rest of relations ...
}

model Branch {
  // ... existing fields, replace schedule Json? with: ...
  city           String?
  province       String?
  postalCode     String?
  openingHours   Json?     // { "1": "09:00-20:00", ... } 1=Mon, 7=Sun
  parkingInfo    String?
  googleMapsUrl  String?
  photoUrls      String[]  @default([])
  // remove: schedule Json? (replaced by openingHours)
  // ... rest of relations ...
}
```

---

### 5. `Doctor` — GROW Profile Fields + Schedule Blocking

**Missing from Doctor (GROW doctor profiles):**
- `sipNumber String?` — SIP (practice permit) number
- `strNumber String?` — STR (registration) number
- `title String?` — drg., Sp.Pros., Sp.Ort., etc.
- `yearsExperience Int?` — years of experience (trust signal)

**New model for doctor schedule blocking (CONNECT):**

```prisma
model ScheduleBlock {
  id        String   @id @default(cuid())
  doctorId  String
  doctor    Doctor   @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  startAt   DateTime // block starts at (inclusive)
  endAt     DateTime // block ends at (exclusive)
  reason    String?  // "Pelatihan", "Sakit", "Libur"
  createdAt DateTime @default(now())

  @@index([doctorId, startAt, endAt])
  @@index([branchId, startAt])
}
```

**Usage:** When generating available slots, exclude times covered by `ScheduleBlock` records.

---

### 6. `Service` — GROW CMS Fields

**Missing from Service:**
- `imageUrl String?` — service photo
- `seoTitle String?` — custom SEO title
- `seoDescription String?` — custom meta description
- `sortOrder Int @default(0)` — display order on website

---

### 7. `Visit` — Missing `organizationId` + `appointmentId`

**Issues in current schema:**
- `Visit` has no `organizationId` → can't query all visits for an org without joining through Patient
- No `appointmentId` → can't link visit to the appointment that triggered it

```prisma
model Visit {
  id             String   @id @default(cuid())
  organizationId String   // ← NEW: direct org filter
  patientId      String
  patient        Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointmentId  String?  @unique // ← NEW: link to appointment that created this visit
  appointment    Appointment? @relation(fields: [appointmentId], references: [id])
  branchId       String
  doctorId       String?
  serviceId      String?  // ← NEW: link to Service catalog
  paymentAmount  Decimal? @db.Decimal(12, 2) // ← NEW: revenue tracking
  paymentMethod  String?  // cash, transfer, insurance, BPJS
  notes          String?  // internal notes (NOT EMR clinical notes)
  deletedAt      DateTime? // ← NEW: soft delete (Permenkes 5-year retention)
  createdAt      DateTime @default(now())

  @@index([patientId])
  @@index([organizationId, createdAt])  // ← NEW: analytics query
  @@index([branchId, createdAt])        // ← NEW: branch analytics
}
```

---

## Complete Updated Schema

The full updated schema with all changes:

```prisma
// Think Edge Dental Suite — Finalized schema (Phase 3)

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── CORE ─────────────────────────────────────────────────────────────────────

model Organization {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  logoUrl        String?
  primaryColor   String?
  seoTitle       String?
  seoDescription String?
  moduleGrow         Boolean @default(true)
  moduleConnect      Boolean @default(true)
  moduleOperate      Boolean @default(false)
  moduleIntelligence Boolean @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  branches         Branch[]
  users            User[]
  services         Service[]
  doctors          Doctor[]
  insurancePartners InsurancePartner[]
  patients         Patient[]
}

model Branch {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  slug           String
  address        String?
  city           String?
  province       String?
  postalCode     String?
  whatsapp       String?
  latitude       Decimal? @db.Decimal(9, 6)
  longitude      Decimal? @db.Decimal(9, 6)
  openingHours   Json?
  parkingInfo    String?
  googleMapsUrl  String?
  photoUrls      String[] @default([])
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  users           User[]
  branchDoctors   BranchDoctor[]
  schedules       Schedule[]
  scheduleBlocks  ScheduleBlock[]
  shifts          Shift[]
  inventory       InventoryItem[]
  approvals       ApprovalRequest[]
  appointments    Appointment[]
  visits          Visit[]

  @@unique([organizationId, slug])
}

model User {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  branchId       String?
  branch         Branch?  @relation(fields: [branchId], references: [id], onDelete: SetNull)
  name           String
  email          String   @unique
  passwordHash   String
  role           Role     @default(STAFF)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  accounts  Account[]
  sessions  Session[]
  shifts    Shift[]
  approvals ApprovalRequest[]
}

enum Role {
  SUPER_ADMIN
  DIRECTOR
  MANAGER
  STAFF
  DOCTOR
}

// ─── GROW ─────────────────────────────────────────────────────────────────────

model Service {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  slug           String
  description    String?
  imageUrl       String?
  price          Decimal? @db.Decimal(12, 2)
  durationMin    Int?
  sortOrder      Int      @default(0)
  seoTitle       String?
  seoDescription String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  visits Visit[]

  @@unique([organizationId, slug])
}

model InsurancePartner {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name            String
  slug            String
  logoUrl         String?
  coverageDetails String?
  claimProcess    String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  appointments Appointment[]

  @@unique([organizationId, slug])
}

// ─── CONNECT ──────────────────────────────────────────────────────────────────

model Doctor {
  id             String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  slug           String
  title          String?
  specialty      String?
  bio            String?
  photoUrl       String?
  sipNumber      String?
  strNumber      String?
  yearsExperience Int?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  branches       BranchDoctor[]
  schedules      Schedule[]
  scheduleBlocks ScheduleBlock[]
  appointments   Appointment[]

  @@unique([organizationId, slug])
}

model BranchDoctor {
  branchId String
  doctorId String
  branch   Branch @relation(fields: [branchId], references: [id], onDelete: Cascade)
  doctor   Doctor @relation(fields: [doctorId], references: [id], onDelete: Cascade)

  @@id([branchId, doctorId])
}

model Schedule {
  id          String  @id @default(cuid())
  doctorId    String
  doctor      Doctor  @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  branchId    String
  branch      Branch  @relation(fields: [branchId], references: [id], onDelete: Cascade)
  dayOfWeek   Int     // 0=Sunday … 6=Saturday
  startTime   String  // "09:00"
  endTime     String  // "17:00"
  slotMinutes Int     @default(30)
  isActive    Boolean @default(true)

  @@unique([doctorId, branchId, dayOfWeek])
  @@index([branchId, dayOfWeek])
}

model ScheduleBlock {
  id        String   @id @default(cuid())
  doctorId  String
  doctor    Doctor   @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  startAt   DateTime
  endAt     DateTime
  reason    String?
  createdAt DateTime @default(now())

  @@index([doctorId, startAt, endAt])
  @@index([branchId, startAt])
}

model Patient {
  id             String    @id @default(cuid())
  organizationId String
  name           String
  phone          String
  email          String?
  dob            DateTime?
  notes          String?
  consentedAt    DateTime?
  consentIp      String?
  deletedAt      DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  appointments Appointment[]
  visits       Visit[]

  @@unique([organizationId, phone])
  @@index([organizationId, deletedAt])
}

model Appointment {
  id                 String            @id @default(cuid())
  organizationId     String
  branchId           String
  branch             Branch            @relation(fields: [branchId], references: [id], onDelete: Cascade)
  doctorId           String?
  doctor             Doctor?           @relation(fields: [doctorId], references: [id], onDelete: SetNull)
  patientId          String?
  patient            Patient?          @relation(fields: [patientId], references: [id], onDelete: SetNull)
  patientName        String
  patientPhone       String
  insurancePartnerId String?
  insurancePartner   InsurancePartner? @relation(fields: [insurancePartnerId], references: [id])
  service            String?
  reasonForVisit     String?
  status             AppointmentStatus @default(CONFIRMED)
  scheduledAt        DateTime
  checkInAt          DateTime?
  cancelledAt        DateTime?
  cancelToken        String?           @unique
  walkin             Boolean           @default(false)
  reminderSentAt     DateTime?
  reminder2hSentAt   DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  visit Visit?

  @@unique([doctorId, scheduledAt])
  @@index([branchId, scheduledAt])
  @@index([organizationId, status])
  @@index([organizationId, scheduledAt])
  @@index([patientPhone])
}

enum AppointmentStatus {
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELLED
  NO_SHOW
}

// ─── OPERATE ──────────────────────────────────────────────────────────────────

model Shift {
  id        String   @id @default(cuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime
  startTime String
  endTime   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([branchId, date])
}

model InventoryItem {
  id        String   @id @default(cuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  name      String
  sku       String?
  stock     Int      @default(0)
  minStock  Int      @default(0)
  unit      String   @default("pcs")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([branchId, stock])
}

model ApprovalRequest {
  id             String         @id @default(cuid())
  organizationId String
  branchId       String
  branch         Branch         @relation(fields: [branchId], references: [id], onDelete: Cascade)
  requestedById  String
  requestedBy    User           @relation(fields: [requestedById], references: [id])
  type           ApprovalType
  payload        Json
  status         ApprovalStatus @default(PENDING)
  reviewNote     String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([organizationId, status])
  @@index([branchId, status])
}

enum ApprovalType {
  PROCUREMENT
  MAINTENANCE
  OTHER
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

// ─── INTELLIGENCE ─────────────────────────────────────────────────────────────

model Visit {
  id             String   @id @default(cuid())
  organizationId String
  patientId      String
  patient        Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointmentId  String?  @unique
  appointment    Appointment? @relation(fields: [appointmentId], references: [id])
  branchId       String
  branch         Branch   @relation(fields: [branchId], references: [id])
  doctorId       String?
  serviceId      String?
  service        Service? @relation(fields: [serviceId], references: [id])
  paymentAmount  Decimal? @db.Decimal(12, 2)
  paymentMethod  String?
  notes          String?
  deletedAt      DateTime?
  createdAt      DateTime @default(now())

  @@index([patientId])
  @@index([organizationId, createdAt])
  @@index([branchId, createdAt])
}

// ─── Auth.js ──────────────────────────────────────────────────────────────────

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Index Strategy

### Hot Query Paths & Index Justification

| Index | Query It Serves | Why It Matters |
|---|---|---|
| `Appointment [branchId, scheduledAt]` | Receptionist: "Show today's appointments for Kelapa Gading" | Run on every portal page load |
| `Appointment [organizationId, scheduledAt]` | Director: "Show all appointments this week across branches" | Analytics dashboard, Monday check |
| `Appointment [organizationId, status]` | Analytics: count by status per org | Dashboard KPI widgets |
| `Appointment [patientPhone]` | Receptionist: "Search patient by phone number" | Check-in lookup |
| `Appointment [doctorId, scheduledAt] UNIQUE` | Double-booking prevention | Write-time constraint |
| `Schedule [branchId, dayOfWeek]` | Booking widget: "Which doctors available on Wednesday at Kelapa Gading?" | Every booking flow |
| `ScheduleBlock [doctorId, startAt, endAt]` | Slot generation: "Is dr. Andi blocked Tuesday 2-4 PM?" | Real-time slot check |
| `Patient [organizationId, phone] UNIQUE` | Booking: "Does this patient phone already exist?" | Patient dedup on booking |
| `Patient [organizationId, deletedAt]` | UU PDP: list patients eligible for hard delete (>5 years) | Compliance cron |
| `Visit [patientId]` | Doctor: "Show patient's visit history" | Patient history page |
| `Visit [organizationId, createdAt]` | Director analytics: revenue trend over time | INTELLIGENCE dashboard |
| `Visit [branchId, createdAt]` | Manager analytics: branch revenue by month | Branch analytics |
| `InventoryItem [branchId, stock]` | Low-stock alert: items where stock < minStock | OPERATE dashboard |
| `ApprovalRequest [organizationId, status]` | Director: "Pending approvals across all branches" | OPERATE approvals page |
| `ApprovalRequest [branchId, status]` | Manager: "Pending approvals for my branch" | OPERATE approvals page |

### Indexes NOT Added (and Why)

| Potential Index | Decision | Reason |
|---|---|---|
| `Appointment [patientId]` | Not added | Low cardinality join (patient has few appointments), covered by `branchId + scheduledAt` |
| `Service [organizationId]` | Not added | Small table (<50 services per org), full scan fast |
| `User [organizationId, role]` | Not added | Small table (<50 users per org), full scan fast |
| `Doctor [organizationId]` | Not added | Small table (<20 doctors per org), full scan fast |
| `Visit [doctorId]` | Not added | Low query frequency, can add if analytics shows need |

---

## Migration Plan

### Development

```bash
# After schema changes, generate migration and apply to local DB
npx prisma migrate dev --name "phase3-data-model-finalization"

# This:
# 1. Generates SQL diff in prisma/migrations/[timestamp]_phase3-data-model-finalization/
# 2. Applies to local DB
# 3. Regenerates Prisma Client
```

### Staging

```bash
# On merge to staging branch (GitHub Actions CI):
npx prisma migrate deploy

# This applies pending migrations to staging DB
# Never generates new migrations (deploy-only mode)
```

### Production

```bash
# Pre-deploy step in Railway/Vercel deploy pipeline:
npx prisma migrate deploy

# Runs before app starts → DB schema always matches app version
# Rollback: re-deploy previous version (migrations are additive, rollback requires manual SQL)
```

### Migration Conventions

1. **Additive only:** Always add columns as nullable first. Never drop or rename in the same migration as adding.
2. **Rename process:** Add new column → backfill data → change app to use new column → (later migration) drop old column.
3. **Never break production:** Every migration must be safe to run against a live database with traffic.
4. **Name format:** `[action]_[entity]_[field]` e.g., `add_patient_consent_fields`, `add_appointment_insurance_fk`

### Phase 3 Migration Order

```
001_initial_scaffold          (exists from scaffold)
002_phase3_grow_cms_fields    (Organization.logoUrl, Branch.city, Service.imageUrl, InsurancePartner model)
003_phase3_connect_patient    (Patient consent fields, soft-delete)
004_phase3_connect_appointment (patientId FK, insurancePartnerId, cancelToken, reminders)
005_phase3_connect_schedule_block (ScheduleBlock model)
006_phase3_intelligence_visit (Visit.organizationId, appointmentId, serviceId, paymentAmount)
```

Each migration is separate → can identify which migration caused an issue.

---

## Data Retention Policy (Permenkes 269 + UU PDP)

| Data Type | Retention | Enforcement |
|---|---|---|
| **Patient PII** (name, phone, email) | 5 years from last visit | `Patient.deletedAt` + cron check |
| **Appointment records** | 5 years from appointment date | Soft-delete via `Patient.deletedAt` cascade |
| **Visit records** | 5 years from visit date | `Visit.deletedAt` |
| **Audit logs** | 5 years | No delete (append-only log table — Phase 2) |
| **Staff data** | Until contract end + 2 years | `User.isActive = false` on termination |

**Hard delete rule:** Hard delete only runs when `deletedAt + 5 years < NOW()`. No earlier.

**Cron job (Phase 2):**
```ts
// cron/cleanup-expired-data.ts - runs monthly
async function cleanupExpiredPatientData() {
  const cutoff = subYears(new Date(), 5);
  
  // Hard delete patients soft-deleted >5 years ago
  await prisma.patient.deleteMany({
    where: {
      deletedAt: { lt: cutoff, not: null }
    }
  });
}
```

---

## Next Step: Apply Schema Changes

After this document is approved, apply changes to `prisma/schema.prisma` and run migration:

```bash
# 1. Update prisma/schema.prisma with all changes above
# 2. Run migration
npx prisma migrate dev --name "phase3-data-model-finalization"
# 3. Verify client generated
npx prisma generate
# 4. Run tsc to ensure no type errors
npx tsc --noEmit
```
