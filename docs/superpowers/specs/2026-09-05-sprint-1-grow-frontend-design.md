# Design Spec: Sprint 1 (GROW Module) - Public Patient Website (Frontend First)

**Date**: 2026-09-05  
**Status**: Approved (Brainstorming Complete)  
**Module**: GROW (Sprint 1)  
**Strategy**: Frontend First -> Review -> Backend Integration (Prisma & Server Actions)

---

## 1. Objective & Scope

Deliver a patient discovery and acquisition frontend adhering strictly to the Think Edge Master Brand guidelines:
- **Design Tokens**: Primary Orange (`#f38218`), Ink (`#161817`), Paper (`#f7f5f0`), Line (`rgba(22,24,23,0.12)`), Slate (`#5b6465`).
- **Typography**: Strictly sans-serif (`Plus_Jakarta_Sans`). No serif fonts.
- **Tone**: Premium clinical excellence, modern, trustworthy, high contrast, mobile-first responsive.
- **Strategy**: 
  1. Build typed mock datasets (`src/data/mock-grow.ts`) mirroring Prisma models (`Service`, `Doctor`, `Branch`, `InsurancePartner`).
  2. Implement reusable presentational UI components (`src/components/grow/*`).
  3. Create public marketing routes (`src/app/(marketing)/*`) with shared header/footer layout.
  4. Verify visual hierarchy, mobile layout, and zero lint/type errors.
  5. Once approved visually, seamlessly swap data fetching to Prisma queries & Server Actions.

---

## 2. Information Architecture & Route Map

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx                # Marketing shell with Public Header & Footer
│   │   ├── page.tsx                  # Home landing page (updated navigation links)
│   │   ├── layanan/
│   │   │   ├── page.tsx              # All dental services categorized + search/filter
│   │   │   └── [slug]/page.tsx       # Single service detail, price, duration, FAQ, CTA
│   │   ├── dokter/
│   │   │   ├── page.tsx              # Doctor team directory, filters by specialty & branch
│   │   │   └── [slug]/page.tsx       # Doctor bio, credentials (STR/SIP), practice schedules
│   │   ├── lokasi/
│   │   │   ├── page.tsx              # Branch directory (Kelapa Gading & Pluit)
│   │   │   └── [slug]/page.tsx       # Branch detail: hours, parking, maps, contact
│   │   └── asuransi/
│   │       └── page.tsx              # Partner insurance logos, cashless/reimbursement guide
├── components/
│   └── grow/
│       ├── public-header.tsx         # Responsive navbar: logo, links, WA button, portal link
│       ├── public-footer.tsx         # Clinical footer: branches, accreditation, hours, copyright
│       ├── service-card.tsx          # Card with price preview, duration badge, arrow CTA
│       ├── doctor-card.tsx           # Card with photo/avatar, specialty badge, branch tag
│       ├── branch-card.tsx           # Card with address, hours badge, Google Maps link
│       └── insurance-grid.tsx        # Grid of partner badges with cashless indicators
└── data/
    └── mock-grow.ts                  # Typed mock data directly mapping to Prisma models
```

---

## 3. Component & Page Specifications

### 3.1 Shared Marketing Shell (`layout.tsx`, `public-header.tsx`, `public-footer.tsx`)
- **Header**:
  - Sticky glassmorphic top navigation (`backdrop-blur-md bg-paper/90 border-b border-line`).
  - Brand Logo + Clinic Name ("Klinik Gigi Senyum Sehat").
  - Nav links: *Layanan*, *Dokter*, *Lokasi*, *Asuransi*.
  - Actions: WhatsApp Direct button (`bg-primary text-white font-medium`) + *Portal Staf* link.
  - Mobile hamburger menu with accessible drawer.
- **Footer**:
  - Column 1: Clinic identity, Kemenkes licensing status, emergency contact.
  - Column 2: Quick links to services.
  - Column 3: Branch locations with phone numbers & operating hours (Mon-Sat 09:00 - 20:00).
  - Column 4: WhatsApp direct consultations & booking CTA.

### 3.2 Services Directory (`/layanan` & `/layanan/[slug]`)
- **Directory (`/layanan/page.tsx`)**:
  - Hero header: "Layanan Perawatan Gigi Komprehensif" with category filter pills (Semua, Estetika, Restorasi, Bedah & Cabut, Pencegahan/Anak).
  - Grid of `ServiceCard` showing price range (e.g. `Rp 450.000`), estimated time (`45 - 60 menit`), description excerpt, and "Detail Layanan" link.
- **Detail (`/layanan/[slug]/page.tsx`)**:
  - Procedure breakdown, indications, steps of treatment.
  - Transparent pricing & insurance coverage applicability.
  - Doctor specialists performing this treatment.
  - Action card: "Konsultasikan via WhatsApp" / "Booking Jadwal".
  - FAQ accordion related to the treatment.

### 3.3 Doctors Directory (`/dokter` & `/dokter/[slug]`)
- **Directory (`/dokter/page.tsx`)**:
  - Filter by branch (Kelapa Gading vs Pluit) & specialty (Sp.KG, Sp.BM, Sp.Ort, Dokter Gigi Umum).
  - Grid of `DoctorCard` with clean portrait, name, gelar, SIP/STR verification badge.
- **Detail (`/dokter/[slug]/page.tsx`)**:
  - Professional bio, university background, clinical expertise.
  - Weekly schedule table displaying practice hours across branches.
  - Direct booking prompt for this specific doctor.

### 3.4 Locations Directory (`/lokasi` & `/lokasi/[slug]`)
- **Directory (`/lokasi/page.tsx`)**:
  - Cards for Kelapa Gading branch and Pluit branch.
  - Address, operational days, phone, WhatsApp, parking & accessibility info.
- **Detail (`/lokasi/[slug]/page.tsx`)**:
  - Google Maps embedded view or direct navigation trigger.
  - Facilities available at this branch (Dental X-Ray Panoramic, Ruang Sterilisasi, VIP Lounge).
  - Active doctors practicing at this branch.

### 3.5 Insurance & Payment (`/asuransi/page.tsx`)
- **Partner Showcase**:
  - Grid of approved providers: Prudential, Allianz, Mandiri Inhealth, Sinarmas, BPJS Kesehatan.
  - Coverage types: Cashless direct billing vs reimbursement support.
  - 3-step guide: "Cara Menggunakan Asuransi Anda di Klinik Gigi Senyum Sehat".

---

## 4. Frontend-First Data Contract (`src/data/mock-grow.ts`)

```typescript
export interface MockService {
  id: string;
  name: string;
  slug: string;
  category: 'PREVENTIVE' | 'ESTHETIC' | 'RESTORATION' | 'SURGERY' | 'ORTHODONTICS';
  description: string;
  shortDesc: string;
  durationMinutes: number;
  basePrice: number;
  featured: boolean;
  insuranceCovered: boolean;
}

export interface MockDoctor {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  subSpecialty?: string;
  sipNumber: string;
  strNumber: string;
  photoUrl: string;
  bio: string;
  branches: string[]; // Branch names or IDs
  schedule: {
    day: string;
    branch: string;
    hours: string;
  }[];
}

export interface MockBranch {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  hours: string;
  facilities: string[];
  mapEmbedUrl: string;
}

export interface MockInsurance {
  id: string;
  name: string;
  type: 'CASHLESS' | 'REIMBURSEMENT';
  logoText: string;
  supportedBranches: string[];
}
```

---

## 5. Transition to Backend Gate
Once this frontend mock is visually validated and passes TypeScript / responsive checks:
1. Replace `import { mockServices } from '@/data/mock-grow'` with `await prisma.service.findMany()`.
2. Swap dynamic route slugs to live database queries with `notFound()` fallback.
3. Wire dynamic SEO metadata (`generateMetadata()`) and JSON-LD structured schema.
4. Proceed to CMS Admin forms in `/grow/services`, `/grow/doctors`, etc.
