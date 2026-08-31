# MVP Scope — Locked Feature List

> **Phase 2.3 Deliverable**
> Final signed-off feature matrix for MVP (Sprint 1-2). **No feature creep after this point.**

---

## MVP Definition

**MVP = GROW + CONNECT modules only**

**Timeline:**
- Sprint 0: Foundation (1-2 weeks) — auth, org/branch/user CRUD, CI/CD
- Sprint 1: GROW (2-3 weeks) — patient website + CMS
- Sprint 2: CONNECT (3-4 weeks) — online booking + receptionist portal

**Total: ~8 weeks to first demoable milestone**

**First demo to client:** Patient can discover clinic via website + book appointment online + receptionist checks them in.

---

## What Ships in MVP

### Sprint 0: Foundation (Before GROW/CONNECT)

| Feature | Why | Owner | Estimate |
|---|---|---|---|
| **Organization + Branch CRUD** | Multi-tenant foundation | Backend | 2 days |
| **User management** (CRUD + role assignment) | RBAC foundation | Backend | 3 days |
| **Login page** | Entry point to portal | Frontend | 1 day |
| **JWT session + middleware** | Auth enforcement | Backend | 1 day |
| **Module flag toggle** | Enable/disable GROW/CONNECT/OPERATE per org | Backend | 1 day |
| **CI/CD pipeline** (lint + typecheck on PR) | Quality gate | DevOps | 2 days |
| **docker-compose.yml** (Postgres + MailHog) | Local dev env | DevOps | 1 day |
| **Seed script** (demo org + branches + users) | QA + demo data | Backend | 1 day |

**Exit criteria:** Can create org → add branches → invite users → login → see empty portal dashboard.

---

### Sprint 1: GROW — Patient Website + CMS

#### Public Patient Website (Read-Only)

| Page | Features | Estimate |
|---|---|---|
| **Homepage** | Hero section, services preview (3 cards), doctors preview (3 cards), insurance partner logos, locations list, "Buat Janji" CTA | 2 days |
| **Services Index** (`/layanan`) | List all services with photo, short description, "Starting from IDR X" price (optional) | 1 day |
| **Service Detail** (`/layanan/[slug]`) | Full description, benefits, process, duration, price, accepted insurance, "Book This Service" CTA | 2 days |
| **Doctors Index** (`/dokter`) | Grid of doctor cards (photo, name, specialty, available days) | 1 day |
| **Doctor Detail** (`/dokter/[slug]`) | Full profile (bio, credentials, SIP/STR if provided, availability calendar view, "Book with This Doctor" CTA) | 2 days |
| **Locations Index** (`/lokasi`) | List all branches (address, hours, phone, map preview) | 1 day |
| **Location Detail** (`/lokasi/[slug]`) | Full branch page (address, hours, parking info, Google Maps embed, photo gallery, doctors at this branch, "Book at This Location" CTA) | 2 days |
| **Insurance Partners** (`/asuransi`) | List accepted insurance with logos, coverage details per partner | 1 day |
| **About Us** (`/tentang`) | Clinic story, mission, values (optional — can launch without this) | 1 day |
| **Contact** (`/kontak`) | Phone, email, WA button, "Buat Janji" CTA (no contact form in MVP) | 0.5 day |

**SEO & Performance:**
- [x] Meta tags (title, description, OG) per page
- [x] Schema.org structured data (LocalBusiness, Dentist, Service)
- [x] Mobile-responsive (Tailwind v4 handles this)
- [x] Image optimization (Next.js Image component)
- [x] Fast loading (target: Lighthouse >90)

**Total: ~2 weeks**

---

#### CMS Admin Portal (Staff-Facing)

| Section | Features | Estimate |
|---|---|---|
| **Dashboard** | Quick stats (website visits via Plausible, top pages) | 1 day |
| **Homepage Editor** | Edit hero text, featured services (drag to reorder), featured doctors | 2 days |
| **Services CRUD** | Create/edit/delete service (name, description, price, photo, seoTitle, seoDescription) | 2 days |
| **Doctors CRUD** | Create/edit/delete doctor (name, title, specialty, photo, bio, SIP/STR, availability toggles per day) | 3 days |
| **Locations CRUD** | Create/edit/delete branch (name, address, hours, phone, parking info, photos) | 2 days |
| **Insurance CRUD** | Create/edit/delete insurance partner (name, logo, coverage details, claim process) | 1 day |
| **Photo Gallery** | Upload photos, assign to service/doctor/branch | 1 day |
| **SEO Settings** | Global meta tags, site title, OG default image | 1 day |

**Permissions:**
- DIRECTOR + MANAGER: full access to CMS
- STAFF: read-only (can view but not edit)
- DOCTOR: no access (unless explicitly granted)

**Total: ~2 weeks**

**Sprint 1 Exit Criteria:**
- [x] Public website live with at least 3 services, 3 doctors, 3 branches, 3 insurance partners
- [x] CMS admin can create/edit content without technical help
- [x] Lighthouse mobile score >90
- [x] "Buat Janji" button visible on every page → links to CONNECT booking widget (built in Sprint 2)

---

### Sprint 2: CONNECT — Online Booking + Receptionist Portal

#### Public Booking Widget (Patient-Facing)

| Step | Features | Estimate |
|---|---|---|
| **Step 1: Select Branch** | List branches sorted by distance (geolocation API), show address + hours, "Use My Location" button | 2 days |
| **Step 2: Select Doctor** | List doctors at selected branch, show photo + specialty + available days, "Any Doctor (Fastest)" option | 2 days |
| **Step 3: Select Date & Time** | Calendar picker, time slot grid (real-time availability check), "No slots available? Try another branch" button | 4 days |
| **Step 4: Patient Info** | Form: name, phone, email (optional), reason for visit (dropdown), insurance (dropdown), UU PDP consent checkbox | 2 days |
| **Step 5: Confirmation** | Booking code, appointment details, "Add to Calendar" button, "Chat via WhatsApp" button, "Cancel Booking" link | 1 day |

**Critical Features:**
- [x] **Real-time slot availability** (query existing appointments, filter occupied slots)
- [x] **Double-booking prevention** (unique constraint `[doctorId, scheduledAt]`, catch P2002 error)
- [x] **Cross-branch search** ("Try another branch" suggests alternative slots at nearby branches)
- [x] **Anonymous booking** (no account required, phone is identifier)
- [x] **Instant confirmation** (booking created immediately, no manual approval)

**Total: ~2 weeks**

---

#### Receptionist Portal (Staff-Facing)

| Section | Features | Estimate |
|---|---|---|
| **Today's Appointments** (`/portal/appointments/today`) | List view filtered by branch, search by name/phone, status badges (CONFIRMED, CHECKED_IN, COMPLETED, NO_SHOW, CANCELLED) | 3 days |
| **Check-In Button** | One-click status update CONFIRMED → CHECKED_IN, timestamp recorded | 1 day |
| **Walk-In Creation** | "New Appointment" button → mini booking form (select doctor + time + patient info) | 2 days |
| **Appointment Details** | Modal shows full patient info, booking history, "Cancel" / "Reschedule" / "Mark No-Show" actions | 2 days |
| **Reschedule Flow** | Pick new date/time → update appointment → send WA notification to patient | 2 days |
| **Cancel Flow** | Mark as CANCELLED, slot becomes available, optional cancellation reason | 1 day |
| **Search & Filters** | Filter by doctor, status, date range; search by name or phone | 1 day |

**Total: ~2 weeks**

---

#### Doctor Self-Scheduling (Doctor-Facing)

| Section | Features | Estimate |
|---|---|---|
| **My Schedule View** (`/portal/schedule/my-schedule`) | Calendar showing own appointments + blocked slots | 2 days |
| **Block Time** | Click date + time range → slot becomes unavailable for booking | 2 days |
| **Unblock Time** | Remove block if plans change | 1 day |
| **View Patient List** | See today's patients (names only, no clinical details in Sprint 2) | 1 day |

**Total: ~1 week**

---

#### WA Reminder System (MVP = wa.me)

| Feature | Implementation | Estimate |
|---|---|---|
| **1-Day Reminder** | Receptionist portal shows "Reminders to Send" list → click generates wa.me link → WA Web opens with pre-filled message → receptionist hits Send | 2 days |
| **2-Hour Reminder** | Same flow as 1-day reminder (added from interview feedback) | 1 day |
| **Booking Confirmation WA** | Confirmation page shows "Chat via WhatsApp" button with pre-filled message | 1 day |
| **Cancellation Link** | Signed JWT in URL → patient clicks → confirm cancellation → status updated | 2 days |

**NOT in Sprint 2:**
- ❌ WA Business API (automated sending) — Phase 2+
- ❌ Reminder automation (cron job auto-sends) — Phase 2+

**Total: ~1 week**

---

## Sprint 2 Exit Criteria

- [x] Patient can book appointment online in <2 minutes
- [x] Booking creates appointment in DB with status CONFIRMED
- [x] Double-booking prevented (unique constraint works)
- [x] Receptionist can see today's appointments, check in patients
- [x] Doctor can block unavailable slots
- [x] wa.me reminder links generate correctly
- [x] Patient can cancel booking via link
- [x] Cross-branch search shows alternative branches when primary branch full

---

## Feature Matrix: In vs Out

| Feature | MVP (Sprint 1-2) | Phase 2 | Phase 3+ | Rationale |
|---|---|---|---|---|
| **GROW: Patient website** | ✅ In | — | — | Discovery channel (interview: 70% find via Google) |
| **GROW: CMS admin** | ✅ In | — | — | Must update content without IT |
| **GROW: SEO optimization** | ✅ In | — | — | Rank in top 3 for "dokter gigi [area]" |
| **GROW: Blog/articles** | ❌ Out | ⚠️ Maybe | — | SEO value, but not urgent |
| **GROW: GMB API integration** | ❌ Out | ⚠️ Maybe | — | Requires verification, manual setup works |
| **GROW: Multi-language (English)** | ❌ Out | ⚠️ Maybe | — | Niche market (expats), not core |
| **CONNECT: Online booking** | ✅ In | — | — | Saves 3-4 hours/day per receptionist |
| **CONNECT: Real-time slots** | ✅ In | — | — | Prevents double-booking (3x/month pain) |
| **CONNECT: Cross-branch search** | ✅ In | — | — | New from interview: Director losing patients |
| **CONNECT: 2-hour reminder** | ✅ In | — | — | New from interview: Patient forgets despite 1-day reminder |
| **CONNECT: wa.me reminders** | ✅ In (manual) | Auto via API | — | Manual acceptable for MVP |
| **CONNECT: Check-in portal** | ✅ In | — | — | Replaces paper list |
| **CONNECT: Doctor self-schedule** | ✅ In | — | — | Doctor wants mobile access to block slots |
| **CONNECT: Cancellation** | ✅ In | — | — | 10-15% cancel (interview) |
| **CONNECT: Reschedule (one-step)** | ❌ Out | ✅ In | — | Cancel + rebook works for MVP |
| **CONNECT: QR check-in** | ❌ Out | ⚠️ Maybe | — | Needs tablet, patient education |
| **CONNECT: Patient account** | ❌ Out | ⚠️ Maybe | — | Phone number enough for MVP |
| **CONNECT: WA Business API** | ❌ Out | ✅ In | — | Requires Meta approval + cost |
| **CONNECT: Recurring appointments** | ❌ Out | ❌ Out | ⚠️ Maybe | Low demand signal |
| **OPERATE: Shift scheduling** | ❌ Out | ✅ In | — | 1 hour/week pain (lower priority than CONNECT) |
| **OPERATE: Inventory tracking** | ❌ Out | ✅ In | — | Nice-to-have, not urgent |
| **OPERATE: Approval workflow** | ❌ Out | ✅ In | — | WhatsApp approval works for MVP |
| **OPERATE: Attendance log** | ❌ Out | ✅ In | — | Audit-only, not daily need |
| **OPERATE: Biometric integration** | ❌ Out | ❌ Out | ⚠️ Maybe | Fragmented SDKs, CSV import acceptable |
| **INTELLIGENCE: Dashboard (5 KPIs)** | ❌ Out | ✅ In | — | Needs 2 months of CONNECT data first |
| **INTELLIGENCE: Patient portal** | ❌ Out | ✅ In | — | UU PDP right to access data |
| **INTELLIGENCE: CSV export** | ❌ Out | ✅ In | — | Accounting integration |
| **INTELLIGENCE: EMR (clinical notes)** | ❌ Out | ❌ Out | ⚠️ Maybe | Regulatory complexity, no urgent demand |
| **INTELLIGENCE: Jurnal.id API** | ❌ Out | ❌ Out | ⚠️ Maybe | CSV export acceptable |

---

## Explicit Out-of-Scope (Will NOT Build)

| Feature | Why Out |
|---|---|
| **Website builder (drag-and-drop)** | Scope creep — 6 months work, fixed template sufficient |
| **Payment processing (online payment)** | MVP: payment at clinic, online payment = Phase 3+ |
| **Telemedicine / video consultation** | Different product, regulatory complexity |
| **E-commerce (sell products)** | Not a dental clinic use case |
| **SMS reminders** | SMS dead in Indonesia, WhatsApp dominates |
| **Native mobile app** | Web responsive sufficient, app = Phase 3+ if demand justifies |
| **Payroll calculation** | Accounting software's job |
| **HR management (onboarding, performance)** | Different product |
| **Task management / projects** | Out of domain |
| **Live chat widget** | WA preferred |
| **Patient community / forum** | Not a use case |
| **A/B testing** | Too advanced for MVP |
| **Predictive analytics / ML** | No ROI proof yet |

---

## Validation Against Interview Findings

| Interview Pain Point | MVP Solution | Module |
|---|---|---|
| "I spend 3-4 hours/day handling booking WhatsApp messages" | Online booking widget (patient books themselves) | CONNECT ✅ |
| "Double-booking happens 3+ times per month" | Real-time availability + unique constraint | CONNECT ✅ |
| "Branch A full, Branch B empty, patient goes to competitor" | Cross-branch search suggests alternative branches | CONNECT ✅ |
| "Patient books 2 weeks ahead, forgets despite 1-day reminder" | 2-hour advance reminder added | CONNECT ✅ |
| "Excel corruption loses 2 weeks of appointment data" | Database (reliable, backed up) | CONNECT ✅ |
| "Website outdated, no doctor profiles, no booking" | Patient website + CMS + online booking | GROW ✅ |
| "Can't find price or insurance info on website" | Service pages show price + accepted insurance | GROW ✅ |
| "I spend 1-2 hours/week collecting data from branches" | Deferred to Sprint 4 (INTELLIGENCE) | ❌ Not MVP |
| "Weekly shift scheduling takes 1 hour" | Deferred to Sprint 3 (OPERATE) | ❌ Not MVP |

**Validation:** MVP addresses top 3 pains (booking chaos, double-booking, cross-branch visibility). OPERATE/INTELLIGENCE pains are real but lower ROI.

---

## Success Criteria (Post-MVP Launch)

| Metric | Target | Measurement |
|---|---|---|
| **Online booking adoption** | 40%+ of appointments booked online (vs phone/WA) | CONNECT analytics |
| **Receptionist time saved** | 2+ hours/day per branch | Interview follow-up |
| **Double-booking incidents** | <1 per month per branch | Support tickets |
| **No-show rate** | <15% (down from 20-30%) | CONNECT status tracking |
| **Patient booking time** | <2 minutes average | Plausible event tracking |
| **Website conversion** | 15%+ of visitors click "Buat Janji" | Plausible |
| **Lighthouse score** | >90 mobile | Lighthouse CI |
| **Director satisfaction** | "I'd sign a contract after this demo" | Pilot feedback |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Staff resist new system** (prefer Excel) | High | High | Onboarding wizard, training videos, phone support first 2 weeks |
| **No-show rate doesn't improve** | Medium | Medium | Iterate on reminder timing/content based on data |
| **Patients don't trust online booking** | Low | Medium | Show "X patients booked today" trust signal, WA confirmation |
| **Internet drops during booking** | Medium | Low | Auto-save form to localStorage, retry on reconnect |
| **Cross-branch search confuses patients** | Low | Low | A/B test: show vs hide by default |
| **WA reminder manual step is bottleneck** | Medium | Medium | Phase 2 upgrade to WA API when validated |

---

## MVP Go/No-Go Checklist

Before starting Sprint 1 (GROW):
- [x] Phase 1 research complete
- [x] Phase 2 brainstorming complete (module scoping + journey map + MVP scope)
- [x] Prisma schema validated (already done in scaffold)
- [x] Local dev environment ready (docker-compose.yml in Sprint 0)
- [x] Figma wireframes or Excalidraw sketches reviewed (Phase 2.4 UX Direction)
- [ ] **User sign-off:** Director reviews this MVP scope and says "Yes, this solves my pain"

**Only proceed if all checked.**

---

## Phase 2 Exit Criteria (Before Phase 3 Planning)

- [x] All 4 module scoping docs written
- [x] Patient journey map complete
- [x] **MVP scope locked** (this document)
- [ ] UX direction agreed per surface (next deliverable)
- [ ] **Sign-off:** User confirms "This MVP scope is correct, start implementation"

---

## Next: UX Direction

MVP features locked. Now define navigation structure, critical paths, and wireframe-level UX for 3 surfaces (patient web, staff portal, management console).
