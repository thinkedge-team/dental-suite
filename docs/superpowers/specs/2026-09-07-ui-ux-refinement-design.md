# Design Specification: UI/UX Refinement - Booking Schedule Flow & Unified Settings Hub

**Date**: 2026-09-07  
**Status**: Approved  
**Scope**: Public Booking Schedule UX Overhaul & Unified Portal Settings Experience

---

## 1. Overview & Objectives

This specification addresses two key UI/UX friction points in the application:
1. **Public Booking Schedule Flow (`/book`)**: Replace primitive native HTML `<input type="date">` and `<input type="time">` with an interactive, mobile-friendly **14-day horizontal Date Carousel** and a **Session-based Time Slot Chip Grid** (Pagi, Siang, Sore).
2. **Unified Settings Hub (`/settings/*`)**: Consolidate fragmented settings into a cohesive, high-end hub using a shared settings layout with tab navigation (*Profil Saya*, *Keamanan Akun*, and *Klinik & Lisensi*), premium Think Edge card styling, and calibrated typography.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   ├── (marketing)/
│   │   └── book/
│   │       ├── step-schedule.tsx           # Overhauled: 14-day date strip + session slot chips
│   │       └── date-slot-utils.ts          # Pure helpers: 14-day generator, doctor schedule matcher, session slot groupings
│   │
│   └── (portal)/
│       └── settings/
│           ├── layout.tsx                  # New shared layout with interactive sub-navigation tabs
│           ├── settings-nav.tsx            # Client Component tab strip with active indicators
│           ├── profile/page.tsx            # Redesigned: Premium user profile & role overview
│           ├── security/page.tsx           # Redesigned: Secure password change with visibility toggle
│           └── organization/page.tsx       # Redesigned: Clinic profile & 2-column entitlement license cards
```

---

## 3. Detailed Component Specifications

### 3.1 Public Booking Schedule Flow (`src/app/(marketing)/book/`)

#### 1. Date Strip Carousel (14-Day Horizon)
- Generates 14 consecutive calendar dates starting from today/tomorrow (in WIB).
- Each card displays:
  - Day abbreviation in Indonesian (*Sen, Sel, Rab, Kam, Jum, Sab, Min*).
  - Large date number (*7, 8, 9, ...*).
  - Month name (*Sep*).
  - Special badge if "Hari Ini" or "Besok".
- Doctor Schedule Filtering:
  - If a doctor is pre-selected, checks doctor's weekly `Schedule` days (0 = Sunday ... 6 = Saturday).
  - If the doctor does not practice on that day, the card is visually dimmed with label *"Libur"* and cannot be clicked.
- Touch momentum horizontal scrolling (`overflow-x-auto no-scrollbar scroll-smooth`).
- Selected state: Primary Orange ring, warm background tint (`bg-primary/10 border-primary text-primary`).

#### 2. Session-Based Time Slot Chips
Grouped into 3 distinct operational clinic sessions:
- **Sesi Pagi** (Icon: `SunMedium` / `Sunrise`): `09:00`, `09:30`, `10:00`, `10:30`, `11:00`, `11:30`.
- **Sesi Siang** (Icon: `Sun`): `13:00`, `13:30`, `14:00`, `14:30`, `15:00`.
- **Sesi Sore / Malam** (Icon: `Moon` / `Sunset`): `16:00`, `16:30`, `17:00`, `17:30`, `18:00`.
- Behavior:
  - Single-click selection updating `form.time`.
  - Checkmark indicator on active slot.
  - Replaces all manual time typing.

---

### 3.2 Unified Settings Hub (`src/app/(portal)/settings/`)

#### 1. Shared Layout (`src/app/(portal)/settings/layout.tsx` & `settings-nav.tsx`)
- Server Component layout querying session role to determine whether to render the "Klinik & Lisensi" tab (only for `DIRECTOR` and `SUPER_ADMIN`).
- Header:
  - Eyebrow: *"Pusat Kontrol"*
  - Heading: *"Pengaturan & Preferensi"*
  - Subtitle: *"Kelola identitas profil staf, keamanan akun login, dan profil operasional klinik."*
- Sub-Navigation Tabs (`settings-nav.tsx`):
  - Tab 1: **Profil Saya** (`/settings/profile`, Icon: `User`)
  - Tab 2: **Keamanan Akun** (`/settings/security`, Icon: `ShieldCheck`)
  - Tab 3: **Klinik & Lisensi** (`/settings/organization`, Icon: `Building2`, Directors only)
  - Active state: Primary Orange bottom indicator bar and semi-bold text.

#### 2. Profile Page Redesign (`/settings/profile`)
- Visual identity card:
  - Large brand initial avatar with subtle warm border.
  - Role pill (e.g. `Direktur`, `Manajer`, `Staf Klinik`).
  - Assigned branch pill.
- Form card:
  - Clean inputs with icons (`UserIcon`, `MailIcon`).
  - Read-only email with verified security badge.
  - Save changes button with tactile hover and active scale.

#### 3. Security Page Redesign (`/settings/security`)
- Security guidelines banner with lock icon explaining the 8-character password policy.
- Password form with eye toggle buttons to reveal/hide password input.
- Clear error and success alerts.

#### 4. Organization Page Redesign (`/settings/organization`)
- Clinic profile card with clean fields for clinic name and slug.
- 2-column grid for Module Entitlements:
  - Each module (*GROW, CONNECT, OPERATE, INTELLIGENCE*) in an elegant card with icon, feature summary, and live status badge (`Aktif · Berlisensi` in emerald).
  - Enterprise contact banner for clinic scaling.

---

## 4. Constraint & Brand Compliance

- **Typography & Copy**: Strictly ZERO em-dashes (U+2014). Use `-` or `·`. All copy in professional Indonesian.
- **Styling**: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All date computations anchored in `Asia/Jakarta` (WIB = UTC+7).
- **Type Safety**: Full TypeScript strict mode, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Booking Flow Verification**:
   - Navigate to `/book` -> Step 1 -> Step 2.
   - Click different date cards -> verify selection highlights date.
   - Click session time slot chips -> verify selection highlights time.
   - Verify next button advances cleanly.
2. **Settings Navigation Verification**:
   - Navigate to `/settings/profile`, `/settings/security`, `/settings/organization`.
   - Verify active tab indicator tracks current pathname.
   - Verify form submissions and feedback alerts.
3. **Build & Quality Gates**:
   - `npx vitest run` -> 100% pass.
   - `npx eslint "src/**/*.{ts,tsx}"` -> 0 errors.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run build` -> clean build.
