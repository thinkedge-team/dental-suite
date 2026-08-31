# Module Scoping: GROW — Patient Acquisition

> **Phase 2.1 Deliverable**
> Defining what GROW module builds, informed by user research findings.

---

## Core Questions

### Q1: Is a website builder in scope, or do we only serve the CMS for their existing site?

**Decision: CMS only (content management), not a drag-and-drop website builder.**

**Rationale:**
- Interview finding: Director paid freelancer for WordPress site 3 years ago — it works, but it's **outdated because no one updates it**
- Pain point: "We never update the doctor schedule or promotions"
- What they need: **Easy way to update content**, not rebuild the entire site
- What they don't need: Wix-style drag-and-drop builder — too complex, overkill

**GROW delivers:**
- Pre-built patient-facing website with professional dental clinic design (Think Edge template)
- CMS admin portal for clinic staff to update:
  - Doctor profiles (name, specialty, photo, schedule visibility)
  - Services offered (cleaning, whitening, braces, implants — with prices optional)
  - Branch locations (address, hours, Google Maps embed, parking info)
  - Insurance partners accepted
  - Promotional content (discounts, packages, blog posts)
  - Photos/gallery

**NOT in scope:**
- Custom page builder (no Elementor/Webflow competitor)
- Theme marketplace (one Think Edge template, clinic can't change layout)
- Custom CSS/HTML editor (they get what we give them)

**Why:** Scope creep prevention. Website builder = 6 months dev work. CMS with fixed template = 2-3 weeks.

---

### Q2: Which SEO features are must-have for Indonesian dental SEO?

**Must-have (MVP):**

1. **Google Maps optimization integration**
   - Each branch gets its own Google Business Profile link
   - Address + phone + hours displayed consistently (NAP consistency)
   - Embed Google Maps iframe per location page
   - Schema.org LocalBusiness markup (structured data)

2. **Bahasa Indonesia primary language**
   - All public pages in Bahasa
   - Meta titles/descriptions in Bahasa
   - URL slugs in Bahasa (`/layanan/pembersihan-gigi` not `/services/cleaning`)

3. **Mobile-first responsive design**
   - Interview finding: Patient searches on phone ("Google search: klinik gigi Kelapa Gading")
   - Google prioritizes mobile-friendly sites in Indonesia

4. **Schema.org structured data**
   - `LocalBusiness` for each branch
   - `Dentist` for each doctor
   - `MedicalOrganization` for the clinic network
   - `Service` for each treatment offered
   - `OpeningHoursSpecification` per branch

5. **Open Graph + Twitter cards**
   - When someone shares clinic link on WhatsApp/Instagram, show nice preview (image + title + description)

6. **Page speed optimization**
   - Interview finding: Internet reliability is a concern — slower connections in some areas
   - Image optimization (WebP, lazy loading)
   - Minimal JS (Next.js already handles this)

**Nice-to-have (Phase 2+):**
- Blog/articles (SEO content marketing)
- Multi-language (English for expats)
- Google Business Profile API integration (auto-update hours, photos)
- Local keyword rank tracking
- Sitemap auto-generation (Next.js handles this, but custom prioritization)

**Out of scope:**
- Paid ads management (Google Ads, Meta Ads) — clinic handles separately
- Backlink building — clinic's marketing responsibility
- SEO audit tool — not a feature, this is service work

---

### Q3: Does GROW include managing Google Business Profile programmatically?

**Decision: No API integration in MVP. Manual process + guidance.**

**Rationale:**
- Google My Business API requires verification + approval (takes 1-2 weeks per business)
- Each clinic branch needs separate GMB profile
- **MVP approach:** Think Edge provides a setup guide (checklist) for clinic to create/optimize their GMB profile, but no API automation

**What GROW includes:**
- GMB setup checklist in onboarding wizard
- Link to clinic's GMB profile from website footer ("Find us on Google Maps")
- GMB optimization tips in CMS ("Make sure your GMB hours match the hours on this website")

**Phase 2+:** If multiple clients request it, add GMB API to auto-sync hours, photos, posts.

---

### Q4: What conversion events matter?

**Interview finding (Patient):** "I saw them on Google Maps, read reviews, checked Instagram, then called to book."

**Conversion funnel:**
```
Google/Instagram → Website → [Conversion Event] → Booking → Visit
```

**Conversion events to track:**

1. **"Buat Janji" (Make Appointment) button click** → goes to CONNECT booking widget
   - Primary conversion goal
   - Track via Google Analytics / Plausible

2. **WhatsApp click-to-chat** → `wa.me` link click
   - Track as secondary conversion
   - Shows intent even if they don't complete online booking

3. **Phone call click** (mobile only) → `tel:` link click
   - Track separately from WA

4. **Location page view** → indicates strong intent (researching which branch to visit)

5. **Service page view** → shows interest in specific treatment

**NOT tracking in MVP:**
- Form submissions (no contact form in MVP — only booking widget which is CONNECT module)
- Time on page / scroll depth (nice-to-have analytics, not critical)
- Heatmaps (Hotjar/MS Clarity — defer to Phase 2+)

**Where conversions are measured:**
- **GROW:** Click events (button clicks, WA link clicks)
- **INTELLIGENCE:** Actual bookings completed (conversion rate = bookings / website visits)

---

## User Stories (Validated Against Interviews)

### Director

> "As a clinic director, I want my branches to appear at the top of 'dokter gigi [kota]' Google searches."

**GROW delivers:**
- ✅ Schema.org structured data (helps Google understand your business)
- ✅ Mobile-optimized, fast-loading site (ranking factor)
- ✅ NAP consistency across all pages (ranking factor)
- ⚠️ Ranking depends on GMB optimization + reviews (clinic's responsibility, not platform feature)

**Acceptance criteria:**
- Each location page has valid `LocalBusiness` schema
- PageSpeed Insights score > 90 (mobile)
- All branch addresses match GMB exactly

---

### Receptionist

> "As a receptionist, I want to update the doctor schedule on the website without calling IT."

**GROW delivers:**
- ✅ CMS admin at `/portal/grow/doctors` → edit doctor profile → toggle "Available" per day of week
- ✅ Changes go live immediately (Next.js revalidation)
- ✅ No technical knowledge required (WYSIWYG-style form)

**Acceptance criteria:**
- Receptionist can update doctor availability in < 2 minutes
- Changes visible on public site within 5 seconds
- No "publish" workflow (auto-publish on save)

---

### Patient

> "As a patient, I want to see which insurance partners a clinic accepts before I go."

**Interview finding:** Patient checks website for "price, doctor background, insurance partners" but current website "doesn't show this."

**GROW delivers:**
- ✅ Insurance partner list on homepage (logo grid)
- ✅ Insurance partner detail page per partner (coverage info, claim process)
- ✅ Service pages show "Accepted Insurance" badge

**Acceptance criteria:**
- Homepage displays all accepted insurance partners (BPJS, Allianz, Prudential, etc.)
- Patient can click logo → see detail page (what's covered, how to file claim)
- Service pricing shows "Starting from IDR X" or "Contact us" (optional — clinic decides)

---

## Must-Have vs Defer

### Must-Have (MVP — Sprint 1)

| Feature | Why | Effort |
|---|---|---|
| **Pre-built patient website template** | Core deliverable | 1 week |
| **Homepage** (hero, services preview, doctor preview, insurance logos, locations, CTA) | Entry point | 2 days |
| **Service pages** (cleaning, whitening, braces, etc.) | Patient researches treatments (interview: "I wanted to know price") | 1 week |
| **Doctor profile pages** | Patient wants to see "doctor background" (interview finding) | 3 days |
| **Location pages** (per branch: address, hours, map, parking, photos) | Patient checks location + parking (interview) | 3 days |
| **Insurance partner pages** | Patient checks "which insurance partners" (interview) | 2 days |
| **CMS admin** (CRUD for services, doctors, locations, insurance) | Receptionist must update without IT | 1 week |
| **SEO metadata** (title, description, OG tags per page) | Google search is #1 discovery channel | 2 days |
| **Schema.org structured data** | LocalBusiness, Dentist, Service | 2 days |
| **Mobile-responsive** (Tailwind handles this, but custom breakpoints) | Patient searches on mobile (interview) | 1 day |
| **Fast loading** (image optimization, lazy load) | Internet reliability concern (interview) | 2 days |

**Total effort: ~2.5 weeks**

---

### Nice-to-Have (Phase 2)

| Feature | Why defer | Effort |
|---|---|---|
| Blog / articles | SEO value, but not urgent (no interview mention) | 1 week |
| Multi-language (English) | Expat patients — niche, not core market | 3 days |
| GMB API integration | Requires verification, adds complexity | 1 week |
| Custom branding (clinic uploads logo, colors) | MVP uses Think Edge template, customization = Phase 2 | 1 week |
| Photo gallery with categories | Nice-to-have, basic photo upload in MVP | 3 days |
| Patient testimonials | Trust signal, but reviews on Google more important | 2 days |
| Live chat widget | Not mentioned in interviews, WA preferred | 1 week |

---

### Out of Scope

| Feature | Why |
|---|---|
| Website builder (drag-and-drop) | Scope creep — 6 months work, not needed |
| E-commerce (sell products) | Dental clinics don't sell products online |
| Forum / community | Not a dental clinic use case |
| Video embedding (beyond basic YouTube) | Nice-to-have, no demand signal |
| A/B testing | Too advanced for MVP |

---

## CMS Admin UX (Draft)

### Navigation (GROW section of portal)

```
/portal/grow/
  ├── /dashboard     → Quick stats (website visits, top pages)
  ├── /homepage      → Edit homepage content (hero text, featured services)
  ├── /services      → List/create/edit services
  ├── /doctors       → List/create/edit doctors
  ├── /locations     → List/create/edit branches
  ├── /insurance     → List/create/edit insurance partners
  ├── /gallery       → Upload photos
  └── /settings      → SEO settings, contact info
```

### Edit Flow (Example: Doctor Profile)

1. Staff clicks "Edit" on doctor card
2. Form appears:
   - Name
   - Title (drg., Sp.Pros., etc.)
   - Photo upload
   - Specialty (dropdown: General Dentist, Orthodontist, Periodontist, etc.)
   - Bio (textarea, 200 chars max)
   - SIP Number (optional)
   - STR Number (optional)
   - Availability (checkboxes: Mon-Sun, Morning/Afternoon/Evening)
3. Click "Save" → changes live in 5 seconds
4. Preview button → opens public doctor profile page in new tab

**Design principle:** Form-based, not page builder. Staff fills in fields, system generates the public page.

---

## Technical Notes

### Pages Generated (Next.js App Router)

- `/` (homepage)
- `/layanan` (services index)
- `/layanan/[slug]` (individual service, e.g., `/layanan/pembersihan-gigi`)
- `/dokter` (doctors index)
- `/dokter/[slug]` (individual doctor, e.g., `/dokter/dr-andi-pratama`)
- `/lokasi` (locations index)
- `/lokasi/[slug]` (individual location, e.g., `/lokasi/kelapa-gading`)
- `/asuransi` (insurance partners)
- `/tentang` (about us)
- `/kontak` (contact — just shows phone + WA button)
- `/buat-janji` (redirects to CONNECT booking widget)

### Data Model (Prisma)

Already exists in scaffold schema:
- `Service` ✅
- `Doctor` ✅
- `Branch` (Location) ✅
- `InsurancePartner` ✅

New fields needed:
- `Service.seoTitle`, `Service.seoDescription`
- `Doctor.bio`, `Doctor.photoUrl`
- `Branch.parkingInfo`, `Branch.photoUrls` (array)
- `InsurancePartner.coverageDetails` (text), `InsurancePartner.logoUrl`

### SEO Implementation

```typescript
// Example: Service page metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const service = await prisma.service.findUnique({ where: { slug: params.slug } });
  return {
    title: service.seoTitle || `${service.name} - Klinik Gigi Senyum Sehat`,
    description: service.seoDescription || service.description,
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      images: [service.imageUrl],
    },
  };
}
```

---

## Conversion Tracking Setup

**Tool:** Plausible Analytics (privacy-first, UU PDP compliant — no cookies, no PII tracking)

**Events to track:**
```typescript
plausible('Buat Janji Click', { props: { source: 'homepage' } })
plausible('WhatsApp Click', { props: { location: 'service-page' } })
plausible('Phone Click', { props: { branch: 'Kelapa Gading' } })
```

**Alternative:** Google Analytics 4 (if clinic prefers, but requires cookie consent banner per UU PDP)

---

## Success Metrics (Post-Launch)

How do we know GROW is working?

| Metric | Target | Source |
|---|---|---|
| **Website visits/month** | 1000+ per branch (5000 total) | Plausible |
| **"Buat Janji" click rate** | 15%+ of visits | Plausible events |
| **PageSpeed score** | >90 mobile | Lighthouse |
| **Google Maps ranking** | Top 3 for "dokter gigi [area]" | Manual check |
| **Booking conversion** (clicks → completed booking) | 40%+ | CONNECT + INTELLIGENCE data |

---

## Next: CONNECT Module Scoping

GROW sets up discovery. CONNECT handles booking flow. Scoping CONNECT next.
