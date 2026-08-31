# UX Direction — 3 Surfaces

> **Phase 2.4 Deliverable**
> UX direction for patient website, staff portal, and management console — navigation, zero state, critical paths, language, mobile-first priority.

---

## Overview: 3 Surfaces, 3 Audiences

| Surface | Audience | Primary Goal | Device | Language |
|---|---|---|---|---|
| **Patient Website** (`/`) | End patients | Discover clinic + book appointment | Mobile 70%, Desktop 30% | Bahasa Indonesia |
| **Staff Portal** (`/portal`) | Receptionist, Doctor, Manager | Daily operations (check-in, schedule) | Desktop 60%, Tablet 30%, Mobile 10% | Bahasa Indonesia (UI labels), English (tech terms OK) |
| **Management Console** (`/portal`) | Director, Manager | Analytics, configuration, approvals | Desktop 80%, Tablet 20% | Bahasa Indonesia (primary), English (acceptable for settings) |

**Note:** Staff Portal and Management Console share `/portal` — navigation differentiates based on role.

---

## Surface 1: Patient Website (Public, `/`)

### Design Direction

**Vibe:** Clean, trustworthy, modern but not clinical. Warm, approachable, Indonesian-friendly.

**Visual References:**
- Halodoc/Alodokter (Indonesian health apps — patient-familiar UX)
- Doctolib (European leader — polished, professional)
- NOT: Hospital website (too sterile, intimidating)

**Colors:**
- Primary: Soft blue (#3B82F6) — trust, calm
- Accent: Teal (#14B8A6) — health, clean
- Neutral: Warm gray (#6B7280) — readable, not cold
- Success: Green (#10B981) — confirmation, positive
- Warning: Amber (#F59E0B) — alerts

**Typography:**
- Headings: Inter (modern, clean, Indonesian-language support)
- Body: Inter (same font for consistency)
- Size: 16px base (mobile), 18px desktop — readable for 40+ age group

**Imagery:**
- Real clinic photos (not stock photos of white Americans)
- Smiling Indonesian doctors
- Clean, bright clinic interiors
- Patients: diverse ages, families

---

### Navigation Structure

**Header (Desktop):**
```
[Clinic Logo]    Layanan  |  Dokter  |  Lokasi  |  Asuransi  |  Tentang        [Buat Janji]
```

**Header (Mobile):**
```
[☰ Menu]    [Clinic Logo]                                              [Buat Janji]
```

**Mobile Menu (hamburger):**
```
Layanan
Dokter
Lokasi
Asuransi
Tentang Kami
Kontak
────────────
[Buat Janji Sekarang]
```

**Footer:**
```
Layanan              Lokasi              Tentang             Sosial Media
- Pembersihan Gigi   - Kelapa Gading     - Tentang Kami      - Instagram
- Perawatan Saluran  - Pluit             - Kontak            - Facebook
  Akar               - BSD               - Kebijakan Privasi - WhatsApp
- Pemutihan Gigi     - Kemang            - Syarat & Ketentuan
- Behel & Kawat Gigi - Cibubur
                                                              
© 2026 [Clinic Name]. Semua hak dilindungi.
```

---

### Critical Path: Homepage → Booking (5 Clicks Max)

**Path 1 (Direct):**
1. Land on homepage
2. Click "Buat Janji" CTA (hero section)
3. Select branch
4. Select doctor
5. Select date/time
6. Fill form → Done

**Path 2 (Research First):**
1. Land on homepage
2. Click "Layanan" → browse services → click service detail
3. Click "Book This Service" CTA on service page
4. Select branch (service pre-selected)
5. Select doctor → date/time → form → Done

**Path 3 (Doctor-Specific):**
1. Land on homepage
2. Click "Dokter" → browse doctor profiles → click doctor detail
3. Click "Book with This Doctor" CTA
4. Select branch (doctor pre-selected)
5. Select date/time → form → Done

**Maximum clicks from entry to booking confirmation: 6 clicks (acceptable for conversion)**

---

### Zero State (First-Time Visitor)

**Homepage Hero:**
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  [Background: Soft gradient + clinic photo overlay]      │
│                                                           │
│        Senyum Sehat Dimulai dari Sini                    │
│        Klinik Gigi Terpercaya untuk Keluarga Anda        │
│                                                           │
│        [Buat Janji Sekarang →]    [Lihat Lokasi Kami]   │
│                                                           │
│        ⭐ 4.8 dari 1,200+ pasien                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**If patient has booked before (returning visitor — Phase 2+):**
```
Selamat datang kembali, [Name]!

Kunjungan terakhir Anda: [Date] - [Service]
Sudah waktunya kontrol rutin?

[Buat Janji Lagi →]
```

---

### Mobile-First Decisions

**Why mobile-first:** Interview finding: "Patient searches on phone 'dokter gigi Kelapa Gading'" — 70% of discovery happens on mobile.

| Element | Desktop | Mobile | Rationale |
|---|---|---|---|
| **Hero Image** | Full-width, 600px height | Full-width, 400px height | Mobile: shorter hero, faster scroll to content |
| **Navigation** | Horizontal menu | Hamburger menu | Mobile: avoid cramped horizontal nav |
| **Service Cards** | 3 columns | 1 column (stacked) | Mobile: readable, tap-friendly |
| **Doctor Photos** | Grid 3x3 | List (1 per row) | Mobile: easier to scan names + tap |
| **Booking Widget** | Sidebar + modal | Full-page flow | Mobile: avoid cramped forms |
| **Footer** | 4 columns | Accordion (expandable) | Mobile: avoid 5-screen-tall footer |

**Touch Targets:**
- Buttons: min 48px height (WCAG AA + mobile thumb-friendly)
- Links: min 44px tap area
- Form inputs: min 56px height (iOS Safari doesn't zoom at 16px font + 56px input)

---

### Language & Tone

**Primary Language:** Bahasa Indonesia (100% of patient-facing content)

**Tone:**
- Warm, approachable (not cold/clinical)
- Simple (avoid medical jargon unless explained)
- Action-oriented (clear CTAs)
- Trust-building (credentials, reviews, testimonials)

**CTA Button Text:**
- "Buat Janji" (Make Appointment) — primary action
- "Lihat Detail" (See Details) — secondary action
- "Hubungi Kami" (Contact Us) — tertiary action
- "Chat via WhatsApp" — familiar, preferred channel

**Micro-copy examples:**
- Loading: "Memuat..." (not "Loading...")
- Error: "Maaf, terjadi kesalahan. Silakan coba lagi." (not "Error")
- Success: "Booking berhasil! Kami akan mengirim konfirmasi via WhatsApp."

---

## Surface 2: Staff Portal (`/portal`)

### Design Direction

**Vibe:** Functional, efficient, clear. Not beautiful — usable. Table-heavy, data-dense (but not cluttered).

**Visual References:**
- Linear (project management tool — clean tables)
- Stripe Dashboard (clear data hierarchy)
- NOT: Enterprise ERP (too busy, overwhelming)

**Colors:**
- Inherit from patient website brand (consistency)
- Add: Status colors (green=confirmed, amber=pending, red=cancelled)
- Backgrounds: Light gray (#F9FAFB) — reduces eye strain for 8-hour shifts

---

### Navigation Structure

**Sidebar (Collapsed on Mobile):**

```
[Clinic Logo]
[User Name + Role]

── GROW (if enabled) ──
🏠 Dashboard
📄 Halaman Utama
🛍️ Layanan
👨‍⚕️ Dokter
📍 Lokasi
🏥 Asuransi
🖼️ Galeri Foto

── CONNECT (if enabled) ──
📅 Janji Hari Ini
📋 Semua Janji
🔔 Pengingat
🗓️ Jadwal Saya (Doctor only)

── OPERATE (if enabled) ──
📊 Shift & Jadwal
📦 Inventaris
✅ Persetujuan
⏱️ Absensi

── INTELLIGENCE (if enabled) ──
📈 Dashboard Analitik
👥 Data Pasien
📥 Ekspor Data

── SETTINGS ──
⚙️ Pengaturan
👤 Profil Saya
🚪 Keluar
```

**Role-based visibility:**
- DIRECTOR: sees all sections across all modules
- MANAGER: sees GROW (own branch), CONNECT (own branch), OPERATE (own branch), INTELLIGENCE (own branch only)
- STAFF: sees CONNECT only (appointments)
- DOCTOR: sees CONNECT (own schedule), INTELLIGENCE (own patients) — no GROW/OPERATE

---

### Critical Path: Receptionist Daily Workflow

**Morning routine (takes 2 minutes):**
1. Login → lands on `/portal/appointments/today`
2. Sees list of today's appointments (auto-filtered to own branch)
3. Patient arrives → searches by name → clicks "Check In" → done

**Booking via phone/walk-in (takes 1 minute):**
1. Click "New Appointment" button (floating action button, always visible)
2. Mini-form appears: select doctor → select time → fill patient name + phone → submit
3. Confirmation shown → done

**Send reminder (takes 30 seconds per reminder):**
1. Portal shows "5 reminders to send" badge
2. Click badge → list of patients to remind
3. Click "Send Reminder" → WA Web opens → hit Send → done

**Daily total: ~10-15 actions repeated 30-50 times/day** → must be fast, zero-thought.

---

### Zero State (First Login)

**If no appointments today:**
```
┌────────────────────────────────────────────┐
│  📭 Belum ada janji hari ini                │
│                                             │
│  Pasien pertama Anda hari ini akan muncul  │
│  di sini setelah mereka booking.            │
│                                             │
│  [+ Buat Janji Walk-In]                    │
└────────────────────────────────────────────┘
```

**If organization just created (empty CMS):**
```
┌────────────────────────────────────────────┐
│  🚀 Selamat datang di Think Edge!          │
│                                             │
│  Mari lengkapi profil klinik Anda:         │
│  ☐ Tambahkan informasi klinik              │
│  ☐ Upload logo                             │
│  ☐ Tambahkan minimal 3 layanan             │
│  ☐ Tambahkan minimal 1 dokter              │
│  ☐ Tambahkan lokasi cabang                 │
│                                             │
│  [Mulai Sekarang →]                        │
└────────────────────────────────────────────┘
```

---

### Mobile vs Desktop Priority

**Device usage (estimated from interview):**
- **Receptionist:** Desktop 60% (clinic PC), Tablet 30% (iPad at reception), Mobile 10% (personal phone for emergencies)
- **Doctor:** Mobile 70% (checks schedule on phone), Desktop 30% (clinic PC if available)
- **Manager:** Desktop 80% (office work), Mobile 20% (on-the-go)

**Design implication:**
- **Desktop-first for data-heavy views** (appointment list, analytics tables)
- **Mobile-optimized for doctor schedule view** (calendar, block time)
- **Responsive for all** (must work on all devices, but optimize per role)

**Breakpoints:**
- Mobile: <640px (single column, simplified UI)
- Tablet: 640-1024px (2-column, comfortable touch targets)
- Desktop: >1024px (sidebar + main content, dense data tables)

---

### Language & Tone

**Primary Language:** Bahasa Indonesia (UI labels, buttons, notifications)

**Technical Terms:** English acceptable for settings/technical config (e.g., "Module Enabled", "API Key") — staff are tech-literate enough.

**Tone:**
- Direct, no fluff (this is a work tool, not marketing)
- Action-oriented (verbs: "Check In", "Send", "Edit", "Delete")
- Clear status communication ("Appointment confirmed", "Reminder sent", "Low stock alert")

**Button Labels:**
- "Check In" (not "Mark as Checked In")
- "Send Reminder" (not "Generate WhatsApp Reminder Link")
- "New Appointment" (not "Create New Appointment Record")

---

## Surface 3: Management Console (`/portal` — Director/Manager View)

### Design Direction

**Vibe:** Data-first. Charts, tables, KPIs. Not pretty — insightful.

**Visual References:**
- Mixpanel (clean analytics dashboard)
- Plausible (simple metrics, no clutter)
- NOT: Google Analytics (too complex, overwhelming)

---

### Navigation Structure

**Same sidebar as Staff Portal, but sees all modules + analytics sections.**

**Director Home (`/portal` default):**
```
┌────────────────────────────────────────────────────────┐
│  Selamat datang, Dr. Budi                              │
│  Klinik Gigi Senyum Sehat — 5 cabang                   │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │ Janji Hari  │ │ Revenue     │ │ No-Show     │     │
│  │ Ini         │ │ Hari Ini    │ │ Minggu Ini  │     │
│  │             │ │             │ │             │     │
│  │    42       │ │  IDR 12.5M  │ │    15%      │     │
│  │ (+5 vs      │ │ (+2.1M vs   │ │ (-3% vs     │     │
│  │  kemarin)   │ │  kemarin)   │ │  minggu     │     │
│  │             │ │             │ │  lalu)      │     │
│  └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐                     │
│  │ Pengingat   │ │ Stok Rendah │                     │
│  │ Pending     │ │             │                     │
│  │             │ │             │                     │
│  │     8       │ │     2       │                     │
│  │ [Kirim]     │ │ [Lihat]     │                     │
│  └─────────────┘ └─────────────┘                     │
│                                                         │
│  [Lihat Semua Cabang →]                               │
└────────────────────────────────────────────────────────┘
```

---

### Critical Path: Director Weekly Check (Monday Morning)

**Director's Monday routine (takes 5 minutes — down from 1-2 hours manually):**
1. Login → lands on dashboard
2. Sees 5 KPI cards (appointments, revenue, no-show rate, doctor utilization, alerts)
3. Clicks "Lihat Semua Cabang" → branch comparison table
4. Identifies underperforming branch (e.g., Pluit: 60% utilization vs 90% average)
5. Drills down → sees dr. Sari at Pluit is underutilized
6. Makes decision: promote dr. Sari on website, offer discount for her slots
7. Done — no Excel, no WhatsApp messages, no manual consolidation

**Interview finding validation:**
> "Every Monday I WhatsApp each branch manager: 'Berapa pasien minggu lalu? Berapa revenue?' Then I wait for replies and manually consolidate in Excel. Takes 1-2 hours." — Director

**Think Edge solves:** 5 minutes to get same insight, no manual work.

---

### Zero State (First Week — No Data Yet)

```
┌────────────────────────────────────────────┐
│  📊 Dashboard akan muncul setelah data     │
│      mulai masuk                            │
│                                             │
│  Saat ini: 0 janji selesai                 │
│                                             │
│  Untuk melihat analitik, pastikan:         │
│  ☑ Website sudah live (pasien bisa akses) │
│  ☑ Booking online sudah aktif              │
│  ☐ Minimal 10 janji selesai (butuh 1-2    │
│     minggu data)                            │
│                                             │
│  [Lihat Panduan Setup →]                   │
└────────────────────────────────────────────┘
```

---

### Language & Tone

**Primary Language:** Bahasa Indonesia (dashboard labels, KPIs)

**Data Labels:** Bilingual acceptable
- "Janji Hari Ini" (Bahasa) = "Today's Appointments" (English in tooltip)
- "Revenue" (English OK — universally understood by business owners)
- "No-Show Rate" (English OK)

**Tone:**
- Objective, data-driven (no marketing fluff)
- Insight-oriented ("Pluit branch underperforming — promote dr. Sari")
- Actionable (always suggest next step)

---

## Cross-Surface Consistency

### Shared Design System

**Components (Tailwind v4 + shadcn/ui):**
- Button styles: Primary (blue), Secondary (gray), Danger (red)
- Form inputs: Consistent height (56px), border radius (8px), focus states
- Cards: Consistent padding (24px), shadow (subtle), hover states
- Modals: Centered, max-width 600px, ESC to close
- Toasts: Top-right, auto-dismiss 5s, color-coded (success green, error red, info blue)

**Typography Scale:**
- h1: 32px (patient website hero)
- h2: 24px (section headers)
- h3: 20px (card headers)
- Body: 16px (mobile), 18px (desktop)
- Small: 14px (meta info, timestamps)

**Spacing Scale (Tailwind):**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

**Icons:** Lucide React (consistent style, open-source, Next.js-friendly)

---

## Accessibility (WCAG 2.1 AA)

### Must-Have (MVP)

- [x] Color contrast: Text >4.5:1, Large text >3:1
- [x] Focus visible: Blue outline on all interactive elements
- [x] Keyboard navigation: Tab order logical, all actions reachable via keyboard
- [x] Touch targets: Min 44x44px (mobile)
- [x] Form labels: Every input has associated label
- [x] Error messages: Clear, actionable ("Phone number required" not "Invalid input")
- [x] Skip to content: Skip nav link for screen readers
- [x] Alt text: All images have descriptive alt text
- [x] ARIA labels: Buttons with icons only have aria-label

### Phase 2+

- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] High contrast mode support
- [ ] Text resize (200% zoom without breaking layout)
- [ ] Video captions (if we add video content)

---

## Internationalization (i18n) — Phase 2+

**MVP:** Bahasa Indonesia only (hardcoded strings)

**Phase 2+ (if demand):**
- English for expat patients
- Use next-intl or similar i18n library
- Locale switcher in header (globe icon)

**Translation coverage:**
- Patient website: 100% translated (critical for patient trust)
- Staff portal: 80% translated (technical terms can stay English)
- Management console: 50% translated (business owners often bilingual)

---

## Responsive Breakpoints Strategy

### Patient Website

| Breakpoint | Layout | Rationale |
|---|---|---|
| **<640px (Mobile)** | Single column, stacked cards, full-width CTAs | 70% of traffic (interview finding) |
| **640-1024px (Tablet)** | 2 columns, grid layouts, sidebar navigation | iPad users browsing at home |
| **>1024px (Desktop)** | 3 columns, hero image full-width, sticky header | Desktop research before booking |

### Staff Portal

| Breakpoint | Layout | Rationale |
|---|---|---|
| **<640px (Mobile)** | Hidden sidebar (hamburger), single column tables, simplified forms | Doctor checking schedule on phone |
| **640-1024px (Tablet)** | Collapsible sidebar, 2-column forms, readable tables | Receptionist on iPad at desk |
| **>1024px (Desktop)** | Persistent sidebar, multi-column tables, inline editing | Receptionist on clinic PC |

---

## Animation & Motion

**Principle:** Subtle, functional motion only. No decorative animation.

**Use Motion For:**
- Loading states (spinner, skeleton screens)
- Status transitions (appointment CONFIRMED → CHECKED_IN with smooth color change)
- Modal enter/exit (fade + slide up)
- Toast notifications (slide in from right)
- Hover states (button scale 1.02, smooth shadow)

**NO Motion For:**
- Page transitions (just render, no fade)
- Scroll-triggered animations (gimmicky, adds no value)
- Parallax effects (distracting)

**Respect `prefers-reduced-motion`:** Users with motion sensitivity get instant transitions (no animation).

---

## Performance Budget

| Metric | Target | Measurement |
|---|---|---|
| **First Contentful Paint** | <1.5s | Lighthouse |
| **Largest Contentful Paint** | <2.5s | Lighthouse |
| **Time to Interactive** | <3.5s | Lighthouse |
| **Cumulative Layout Shift** | <0.1 | Lighthouse |
| **Lighthouse Score (Mobile)** | >90 | Lighthouse CI |
| **Page Weight** | <1MB (homepage), <500KB (portal pages) | DevTools Network |

**Optimization tactics:**
- Next.js Image component (auto WebP, lazy load)
- Font subsetting (only Latin + Indonesian characters)
- Code splitting (per route)
- Minimize third-party scripts (Plausible OK, GA too heavy)

---

## Phase 2 Exit Criteria

- [x] UX direction agreed for all 3 surfaces
- [x] Navigation structure defined
- [x] Critical paths mapped
- [x] Language/tone documented
- [x] Mobile-first priorities set
- [x] Zero states designed
- [ ] **Sign-off:** User confirms "This UX direction matches our needs, start implementation"

---

## Next: Phase 3 Planning

Phase 2 (BRAINSTORMING) complete. All deliverables ready:
1. ✅ Module scoping (GROW, CONNECT, OPERATE, INTELLIGENCE)
2. ✅ Patient journey map
3. ✅ MVP scope locked
4. ✅ UX direction

**Next phase:** Planning — ADRs, data model finalization, implementation plans per module, API design, DevOps plan.
