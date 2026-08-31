# Competitive Analysis — Indonesian Dental Clinic Software Market

> **Phase 1.2 Deliverable**
> Analysis of existing solutions, pricing models, and positioning gaps for Think Edge Dental Suite.

---

## Feature Matrix

| Competitor | Type | GROW | CONNECT | OPERATE | INTELLIGENCE | Target Market | Weaknesses |
|---|---|---|---|---|---|---|---|
| **Klinik+ / SimRS** | Indonesian HIS/EMR | ⬜ No | ⚠️ Basic | ✅ Full | ⚠️ Reports only | Hospitals, large clinics | No patient-facing booking, dated UI, expensive on-prem setup, not dental-specific |
| **Halodoc / Alodokter** | Consumer health app | ⬜ No | ✅ Strong | ⬜ No | ⬜ No | Individual patients | Commission-based (20-30%), no multi-branch CMS, no ops tools, clinic has no control over patient data |
| **Qontak** | CRM + WA automation | ⬜ No | ⚠️ Manual | ⬜ No | ⬜ No | SMB across industries | Not dental-specific, no booking logic, no schedule management, requires manual WA Business API setup |
| **Doctolib (EU)** | Full practice suite | ✅ Full | ✅ Full | ✅ Full | ✅ Full | European dental/medical | No Indonesia presence, no Bahasa UI, no BPJS integration, pricing €129-199/month (IDR 2.2-3.4M) too high for Indonesian SMB |
| **Dental Intel (US)** | Analytics only | ⬜ No | ⬜ No | ⬜ No | ✅ Full | US dental practices | Analytics-only (no booking/ops), no Southeast Asia, requires existing practice management software, $299-599/month |
| **Excel + WhatsApp + Google Sheets** | Manual status quo | ⬜ No | ⬜ Manual | ⬜ Manual | ⬜ Manual | Everyone | **The real competitor:** Free, familiar, but error-prone, no automation, no multi-branch consolidation, staff-dependent |

### Legend
- ✅ **Full**: Complete feature coverage competitive with Think Edge
- ⚠️ **Basic/Manual**: Feature exists but limited or requires manual work
- ⬜ **No**: Feature not available

---

## Detailed Competitor Profiles

### 1. Klinik+ / SimRS (Indonesian Hospital Information System)

**What they do:**
- Electronic Medical Records (EMR)
- Patient registration & billing
- Pharmacy & lab integration
- Shift & doctor scheduling
- Basic reporting (revenue, patient count)

**Pricing:**
- **On-premise:** IDR 50-200M one-time setup + IDR 5-10M/month maintenance (3-5 branches)
- **SaaS model (rare):** IDR 500K-1M per user/month

**Strengths:**
- Deep hospital workflows (inpatient, OR scheduling, lab results)
- BPJS integration for claims
- Established in Indonesian healthcare market

**Weaknesses:**
- No patient-facing booking (all booking is receptionist-mediated)
- UI feels like Windows XP era — steep learning curve
- Overkill for dental clinics (built for hospitals)
- No website/SEO tools (GROW module missing entirely)
- Expensive for 3-5 branch dental chains

**Think Edge advantage:** Modern UI, patient self-booking, GROW module for acquisition, priced for dental SMB not hospitals.

---

### 2. Halodoc / Alodokter (Consumer Health Marketplace)

**What they do:**
- Patient app for finding doctors
- Online booking & telemedicine
- Appointment reminders
- Patient reviews

**Pricing:**
- **Commission-based:** 20-30% of consultation fee per booking
- No upfront cost for clinics

**Strengths:**
- Large patient base (10M+ users)
- Strong brand recognition in Indonesia
- No technical setup required for clinics

**Weaknesses:**
- **Commission eats margin** — dental clinics typically work on 30-40% margin; 20-30% commission is prohibitive for routine check-ups
- Clinic has **no control** — patient data stays with Halodoc, no CRM access
- No multi-branch management — each branch listed separately, no consolidated view
- No operations tools (inventory, shift scheduling, approvals)
- Patients book through Halodoc brand, not clinic's own brand

**Think Edge advantage:** Clinic owns the platform & patient data, no commission, multi-branch unified view, includes OPERATE module.

---

### 3. Qontak (CRM + WhatsApp Automation)

**What they do:**
- WhatsApp Business API integration
- Broadcast messages & chatbot
- Contact management (CRM)
- Basic task/deal pipeline

**Pricing:**
- **Starter:** IDR 600K/month (1 agent, 2500 WA messages)
- **Professional:** IDR 2M/month (5 agents, 10K messages)
- + WhatsApp conversation fees (~IDR 500-1000 per conversation)

**Strengths:**
- Official WhatsApp Business API partner
- Good for marketing broadcasts
- Multi-channel (WA, IG, FB Messenger)

**Weaknesses:**
- **Not practice management** — it's a CRM, not scheduling software
- No booking logic (can't block slots, check doctor availability, prevent double-booking)
- No schedule management for doctors
- No inventory or operations tools
- Requires manual rule setup for every workflow

**Think Edge advantage:** Purpose-built for clinic workflows with real booking logic, integrated with OPERATE, not just a generic CRM.

---

### 4. Doctolib (European Leader)

**What they do:**
- Patient website & online booking
- Video consultation
- Patient records & history
- Doctor schedule management
- Multi-location support
- SMS/email reminders
- Payment processing

**Pricing (Europe):**
- **Essential:** €129/month per location
- **Perfect:** €199/month per location
- Minimum 1-year contract

**Strengths:**
- **The gold standard** — this is what Think Edge aspires to be for Indonesia
- Used by 60M+ patients in France/Germany
- Full-featured, polished UI
- Strong patient adoption

**Weaknesses for Indonesia:**
- **No Indonesia presence** — UI only in English/French/German/Italian
- No BPJS integration
- No Bahasa Indonesia
- **Pricing too high** — €199/month = ~IDR 3.4M/location. Indonesian dental clinics pay IDR 500K-1M/month for SaaS tools.
- Cultural mismatch (European healthcare workflows ≠ Indonesian)

**Think Edge opportunity:** Be "Doctolib for Indonesia" — same vision, localized execution, Indonesian pricing.

---

### 5. Dental Intel (US Analytics)

**What they do:**
- Practice analytics dashboard
- KPI tracking (production, collections, new patients)
- Insurance claim analysis
- Hygiene reappointment tracking

**Pricing (US):**
- $299-599/month depending on practice size

**Strengths:**
- Deep dental-specific metrics
- Integrates with major US practice management software (Dentrix, Eaglesoft, Open Dental)

**Weaknesses:**
- **Analytics-only** — no booking, no scheduling, no CMS
- Requires existing practice management software (which Indonesian clinics don't have)
- No Southeast Asia presence
- US-centric (insurance logic, compliance, language)

**Think Edge advantage:** Integrated suite (GROW + CONNECT + OPERATE + INTELLIGENCE) not just analytics, built for Indonesian market.

---

### 6. Excel + WhatsApp + Google Sheets (The Real Competitor)

**What they do:**
- Excel: appointment log, staff schedule, inventory list
- WhatsApp: booking requests, reminders, internal communication
- Google Sheets: shared revenue tracking (sometimes)

**Pricing:**
- Free (labor cost: receptionist spends 2-3 hours/day manually managing)

**Strengths:**
- **Zero cost**
- Everyone knows how to use it
- Infinite flexibility (can add any column)
- Works offline (Excel on desktop)

**Weaknesses:**
- **Error-prone** — double-booking common (two receptionists editing same sheet)
- **No automation** — every reminder sent manually via WA
- **No consolidation** — director has to ask each branch "send me this week's numbers"
- **Staff-dependent** — if receptionist who maintains the sheet quits, knowledge is lost
- **No patient-facing** — patients can't see availability or book themselves
- **No audit trail** — who changed what? when?
- **Doesn't scale** — works for 1-2 branches, breaks at 3+

**Think Edge advantage:** Everything Excel/WA does, but automated, consolidated, multi-branch, audit-trailed, patient-facing, and reduces receptionist workload by 50%.

---

## Pricing Benchmarks

| Model | Example | Monthly Cost (IDR) | Think Edge Target |
|---|---|---|---|
| **Per-seat SaaS** | Klinik+ (5 users) | 2,500K-5,000K | ❌ Too expensive for dental SMB |
| **Per-location SaaS** | Doctolib (3 branches) | 10,200K (~€600) | ❌ Not realistic for Indonesia |
| **Commission-based** | Halodoc (30 appointments/month @ 25%) | 2,250K (assuming IDR 300K/consult) | ❌ Unsustainable for clinics |
| **Per-clinic flat rate** | — | — | ✅ **Think Edge model** |
| **Freemium + modules** | — | — | ✅ **Think Edge alternative** |

### Think Edge Pricing Strategy (Hypothesis — validate in interviews)

**Option A: Flat per-clinic pricing**
- **GROW only:** IDR 500K/month (unlimited branches, unlimited users)
- **GROW + CONNECT:** IDR 1.5M/month
- **GROW + CONNECT + OPERATE:** IDR 2.5M/month
- **Full suite (all 4 modules):** IDR 3.5M/month
- Annual payment: 2 months free (14 months for price of 12)

**Option B: Per-branch pricing**
- **GROW + CONNECT:** IDR 750K/month per branch
- **Add OPERATE:** +IDR 400K/branch
- **Add INTELLIGENCE:** +IDR 300K/branch
- Example: 3 branches, all modules = 3 × (750 + 400 + 300) = IDR 4.35M/month

**Option C: Freemium**
- **GROW (basic):** Free (1 location, 3 doctors, Think Edge branding)
- **CONNECT:** IDR 1M/month (unlimited booking, WA reminders)
- **OPERATE:** IDR 800K/month
- **INTELLIGENCE:** IDR 600K/month
- Remove branding: +IDR 300K/month

**Validation needed:** Interview Q14-15 (Director guide) will test pricing sensitivity.

---

## Positioning Map

```
High Feature Coverage
        ▲
        │
        │  Doctolib (EU)
        │     ●
        │
        │              ● Think Edge
        │            (target position)
        │
        │  Klinik+/SimRS
        │     ●
        │
        │                    ● Halodoc
        │                  (booking only)
        │
        │  Qontak
        │   ●
        │
        │         Excel/WA
        │            ●
        │
        └────────────────────────────────▶
    Low Cost                         High Cost
```

**Think Edge positioning:**
- **Horizontal:** Mid-market pricing (cheaper than Doctolib/Klinik+, more expensive than Excel/free, no commission unlike Halodoc)
- **Vertical:** Full-stack coverage (all 4 pillars, unlike single-feature competitors)
- **Tagline (draft):** "Platform lengkap untuk jaringan klinik gigi modern — dari website sampai operasional."
  - Translation: "Complete platform for modern dental clinic networks — from website to operations."

---

## Gaps & Opportunities

### Market Gaps Think Edge Fills

| Gap | Current State | Think Edge Solution |
|---|---|---|
| **No integrated suite in Indonesia** | Clinics patch together 3-4 tools (website from freelancer, booking via WA, ops via Excel) | One platform, 4 modules |
| **No multi-branch consolidation** | Director calls/WA each branch for numbers | Real-time org-wide dashboard (INTELLIGENCE) |
| **No patient self-service** | 100% receptionist-mediated booking | Public booking widget (CONNECT) |
| **No dental-specific SaaS** | Generic CRM (Qontak) or hospital HIS (SimRS) | Purpose-built for dental workflows |
| **No affordable modern solution** | Doctolib/Dental Intel pricing unrealistic | Indonesian market pricing (IDR 1.5-3.5M/month) |
| **Commission model unsustainable** | Halodoc takes 20-30% forever | Flat monthly fee, clinic keeps all revenue |

---

## Competitive Threats

### What could disrupt Think Edge?

1. **Halodoc/Alodokter pivots to B2B SaaS** — drops commission, sells clinic-branded booking platform
   - **Mitigation:** Move fast, lock in first 10 clinics with annual contracts, build switching cost (data migration, training)

2. **Doctolib enters Indonesia** — localizes UI, partners with large hospital chain
   - **Mitigation:** Focus on 3-10 branch dental SMB (too small for Doctolib), emphasize local support & understanding

3. **Klinik+/SimRS modernizes UI and prices down**
   - **Mitigation:** GROW module (SEO, patient website) — they won't build this, it's outside their hospital DNA

4. **Open-source dental practice software** (like OpenDental) gains traction in Indonesia
   - **Mitigation:** Hosted SaaS with zero IT setup, automatic updates, integrated WA reminders (open-source requires self-hosting)

---

## Next Steps

1. Validate pricing hypothesis in Director interviews (Q14-15)
2. Test "Excel/WA is the real competitor" hypothesis in Receptionist interviews
3. Research: does Halodoc offer B2B tools? (might have launched since last check)
4. Monitor: Klinik+ pricing changes, Doctolib expansion plans

---

## References

- Halodoc pricing: [halodoc.com/untuk-dokter](https://www.halodoc.com/)
- Qontak pricing: [qontak.com/pricing](https://qontak.com/)
- Doctolib pricing: [doctolib.fr/tarifs](https://www.doctolib.fr/)
- Klinik+ info: anecdotal from Indonesian healthcare forums (no public pricing)
