# Implementation Plan: Module GROW (Sprint 1)

> **Phase 3.3 Deliverable**
> Detailed file map, Server Actions, SEO strategy, and test criteria for Sprint 1 (GROW Module).

---

## 1. Goal & Scope

Deliver the patient acquisition and content management surface:
1. **Public Marketing Site (`/`):** Fast, responsive, mobile-first website for patient discovery.
2. **CMS Portal (`/portal/grow`):** Admin interface for clinic staff (DIRECTOR, MANAGER) to update services, doctor profiles, branch locations, and insurance partners.
3. **SEO & Discoverability:** Rich metadata, OpenGraph tags, JSON-LD structured data (`LocalBusiness`, `Dentist`, `MedicalOrganization`), dynamic sitemap.
4. **Image Handling:** Cloudflare R2 integration for doctor portraits, service thumbnails, and clinic gallery photos.

---

## 2. File Map

```
src/
├── app/
│   ├── (marketing)/                  # Public patient-facing website
│   │   ├── layout.tsx                # Marketing shell (Public Header, Footer, CTA)
│   │   ├── page.tsx                  # Homepage (Hero, Featured Services, Doctors, Insurance Logos)
│   │   ├── layanan/                  # Services Directory
│   │   │   ├── page.tsx              # Grid of all active services
│   │   │   └── [slug]/page.tsx       # Service details + "Book Service" CTA
│   │   ├── dokter/                   # Doctors Directory
│   │   │   ├── page.tsx              # Grid of active doctors
│   │   │   └── [slug]/page.tsx       # Doctor bio, credentials (SIP/STR), schedule overview
│   │   ├── lokasi/                   # Clinic Locations
│   │   │   ├── page.tsx              # List of branches
│   │   │   └── [slug]/page.tsx       # Branch address, Google Maps iframe, parking info, hours
│   │   ├── asuransi/                 # Insurance Partners
│   │   │   └── page.tsx              # List of accepted insurance + claim guidelines
│   │   ├── tentang/                  # About Us
│   │   │   └── page.tsx              # Clinic story & philosophy
│   │   ├── sitemap.ts                # Dynamic sitemap generator
│   │   └── robots.txt                # Search engine directives
│   │
│   ├── (portal)/grow/                # CMS Admin Portal (Protected)
│   │   ├── dashboard/page.tsx        # Overview (Active services/doctors count)
│   │   ├── services/                 # Services CMS
│   │   │   ├── page.tsx              # List table
│   │   │   └── [id]/page.tsx         # Edit/Create form
│   │   ├── doctors/                  # Doctors CMS
│   │   │   ├── page.tsx              # List table
│   │   │   └── [id]/page.tsx         # Edit/Create form + branch assignment
│   │   ├── locations/                # Locations CMS
│   │   │   ├── page.tsx              # List table
│   │   │   └── [id]/page.tsx         # Edit/Create form (hours, coordinates, gallery)
│   │   └── insurance/                # Insurance Partners CMS
│   │       ├── page.tsx              # List table
│   │       └── [id]/page.tsx         # Edit/Create form
│   │
├── actions/
│   └── grow/
│       ├── service.ts                # CRUD operations for Services
│       ├── doctor.ts                 # CRUD operations for Doctors
│       ├── location.ts               # CRUD operations for Branches (GROW context)
│       ├── insurance.ts              # CRUD operations for InsurancePartners
│       └── media.ts                  # Cloudflare R2 presigned URL generation & upload
│
├── lib/
│   ├── validations/
│   │   └── grow.ts                   # Zod schemas for CMS forms
│   └── seo.ts                        # JSON-LD generator utility
│
└── components/
    ├── grow/                         # GROW specific components
    │   ├── service-card.tsx
    │   ├── doctor-card.tsx
    │   ├── json-ld.tsx               # Injects schema.org scripts into <head>
    │   └── forms/                    # CMS editing forms
    │       ├── service-form.tsx
    │       ├── doctor-form.tsx
    │       ├── location-form.tsx
    │       ├── insurance-form.tsx
    │       └── image-uploader.tsx    # Drag-and-drop R2 upload component
    └── ...
```

---

## 3. SEO & Structured Data Strategy

### 3.1 Metadata & Localization
- **Language:** `<html lang="id">`
- **Dynamic Meta Tags:** Every dynamic route (`layanan/[slug]`, `dokter/[slug]`) implements Next.js `generateMetadata()`:
  - Uses `seoTitle` and `seoDescription` if defined; falls back to standard name/bio.
  - Injects OpenGraph images (clinic logo or entity-specific photo).

### 3.2 JSON-LD Schema (schema.org)
Implement a utility in `src/lib/seo.ts` to generate robust schema, injected via a React component.

1. **Clinic Network (`MedicalOrganization` & `LocalBusiness`):**
   - On the homepage and `/lokasi`. Includes parent organization data and branch specifics (address, geo coordinates, opening hours).
2. **Doctors (`Physician` / `Dentist`):**
   - On `/dokter/[slug]`. Includes name, medical specialty, branch affiliation, and credentials.
3. **Services (`MedicalProcedure`):**
   - On `/layanan/[slug]`. Includes procedure description, price range indication, and provider linkage.

---

## 4. Server Actions & Data Integrity

### Validation (`src/lib/validations/grow.ts`)
Zod schemas will enforce strict data rules before DB writes:
- Slug formats: `^[a-z0-9-]+$`
- Prices: non-negative decimals.
- Time formats: valid HH:MM strings for branch hours.

### Action Behavior
All actions in `src/actions/grow/*.ts` follow this flow:
1. `await auth()`
2. RBAC check: Must be `SUPER_ADMIN`, `DIRECTOR`, or `MANAGER`. (STAFF/DOCTOR get 403).
3. Validate input via Zod.
4. Execute Prisma mutation scoped to `session.user.organizationId`.
5. **Cache Invalidation:** Call Next.js `revalidatePath()` targeting the affected public routes (e.g., `revalidatePath('/layanan')`, `revalidatePath('/')`) to ensure instant content freshness without full rebuilds.

---

## 5. Image Handling Workflow (Cloudflare R2)

1. **Upload Request:** Admin selects image in `image-uploader.tsx`.
2. **Presigned URL:** Client calls Server Action `getUploadUrl(filename, type)` which returns a secure, time-limited S3-compatible put URL from Cloudflare R2.
3. **Direct Upload:** Client uploads file directly to R2 (bypassing Vercel limits).
4. **Save Reference:** The public URL (`https://media.thinkedge.id/org-id/...`) is saved to the respective Prisma entity (`Service.imageUrl`, `Doctor.photoUrl`).

---

## 6. Verification & Acceptance Criteria

- [ ] **SEO Check:** Homepage, a service page, and a doctor page pass Google Rich Results test.
- [ ] **Lighthouse Performance:** Patient-facing mobile pages score > 90 (FCP < 1.5s).
- [ ] **CMS Functionality:**
  - Manager can add a new Doctor, specify `sipNumber`, and upload a photo.
  - Saving the Doctor instantly updates the public `/dokter` page.
- [ ] **RBAC Enforcement:** Logging in as STAFF and attempting to hit a server action inside `src/actions/grow/` returns an error, and navigating to `/portal/grow` redirects to dashboard.
- [ ] **Image Upload:** Uploading a 2MB image succeeds and renders efficiently via Next.js `<Image />` component with correct `next.config.js` remote pattern setup.
