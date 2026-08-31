# ADR-006: EMR Scope — Out of V1

**Status:** Accepted  
**Date:** 2026-08-31  
**Deciders:** Think Edge Engineering Team  
**Context:** Phase 3 Planning — Electronic Medical Records (EMR) scope decision

---

## Context

Electronic Medical Records (EMR) refers to digital clinical documentation:
- Doctor's clinical notes during/after consultation
- Diagnosis codes (ICD-10)
- Treatment plans
- Prescriptions (e-resep if mandated)
- Progress notes for follow-up visits
- Medical images (X-rays, intraoral photos)
- Consent forms (surgical procedures)

**Question:** Should Think Edge Dental Suite include EMR in MVP (Sprint 1-2)?

---

## Decision

**EMR is OUT OF SCOPE for MVP, Sprint 2, Sprint 3, and Sprint 4.**

**Earliest consideration: Phase 3 (6+ months after MVP launch), only if 3+ clients explicitly request it.**

---

## Rationale

### 1. No Urgent Demand (Interview Findings)

**From Director interview:**
> "We tried Klinik+ (hospital management system). It was horrible. Too complicated — designed for hospitals, not small dental clinics. The staff begged me to go back to Excel after 2 months."

**From Doctor interview:**
> "Paper files work fine. The receptionist hands me the file when the patient checks in."

**From Receptionist interview:**
> (No mention of EMR pain. Top pain: booking chaos, double-booking, manual WhatsApp messages)

**Insight:** Clinics are comfortable with paper files. EMR is not a pain point. CONNECT (booking) is 10x more urgent.

---

### 2. Regulatory Complexity (Permenkes 269/2008)

**Permenkes No. 269/2008 requirements for electronic medical records:**

| Requirement | Implementation Complexity | MVP Blocker? |
|---|---|---|
| **Authenticity guarantee** | Digital signatures (e-signature PKI from BSSN) | ✅ Yes — requires third-party integration |
| **Cannot be altered without audit trail** | Immutable log (blockchain or append-only log) | ⚠️ Medium — doable but adds complexity |
| **5-year retention** | Soft-delete + retention policy | ⚠️ Already planned for visit data |
| **Access control** | RBAC (who can view/edit clinical notes) | ⚠️ Already have RBAC, but needs clinical-specific rules |
| **Doctor signature on every note** | E-signature on save | ✅ Yes — legal requirement, complex integration |
| **Patient consent for electronic record** | Separate consent from booking consent | ⚠️ Doable but adds form complexity |

**Blockers:**
1. **E-signature integration:** Indonesian law requires PKI-based digital signatures from certified providers (BSSN-approved). Integration = 2-4 weeks work + legal review + ongoing compliance cost.
2. **Medical terminology standards:** ICD-10 codes, SNOMED CT (dental subset) — must integrate terminology database.
3. **Audit trail immutability:** Must prove record wasn't altered (blockchain or cryptographic hashing) — adds infrastructure.

**Timeline impact:** EMR adds 4-6 weeks to MVP (doubles timeline from 8 weeks to 12-14 weeks).

---

### 3. Clinical Workflow Complexity

**Current workflow (paper-based):**
1. Patient checks in → receptionist pulls paper file
2. Doctor reviews previous visit notes (handwritten)
3. Doctor performs treatment
4. Doctor writes notes in paper file
5. Receptionist files it back

**EMR workflow (digital):**
1. Patient checks in → receptionist marks checked-in in portal
2. Doctor opens patient record on tablet/PC
3. Doctor reviews previous visit notes (digital)
4. Doctor performs treatment
5. **Doctor enters notes in structured form** ← NEW STEP (adds 5-10 min per patient)
6. Doctor signs notes digitally ← NEW STEP (e-signature flow)
7. System saves immutable record

**Doctor resistance risk:**
- Interview finding (Doctor): "If it's complicated like Klinik+, forget it."
- Entering structured data (dropdowns, checkboxes, codes) is slower than handwritten notes
- Doctors are already time-constrained (15-20 patients/day)
- Adding 5-10 min per patient = 2+ hours/day extra work → doctors resist adoption

**Mitigation (if we build EMR):**
- Voice-to-text clinical notes (adds speech recognition complexity)
- Templates per treatment type (cleaning, extraction, filling) — reduces typing
- Mobile-optimized (tablet at chairside, not desktop in back office)

**Result:** Even with mitigation, EMR is a 4-6 week UX design + implementation effort.

---

### 4. What We Include Instead (Visit Log ≠ EMR)

**MVP includes (INTELLIGENCE module, Sprint 4):**
- **Visit log:** Date, doctor, service performed, payment amount
- Patient can see: "You visited dr. Andi on [date] for Cleaning"
- Doctor can see: "Patient's last visit was [date] for [service]"

**This is NOT EMR because:**
- ❌ No clinical notes
- ❌ No diagnosis codes
- ❌ No treatment plan
- ❌ No doctor signature
- ❌ Not compliant with Permenkes 269 (doesn't claim to be medical record)

**This IS acceptable because:**
- ✅ Booking system (appointment history = business record, not medical record)
- ✅ Useful for patient ("when was my last cleaning?")
- ✅ Useful for doctor ("has patient been here before?")
- ✅ No legal baggage (not claiming medical record status)

**Legal classification:** Think Edge Dental Suite is "practice management software" (booking, scheduling, operations), not "EMR software" (clinical documentation). Different regulatory category.

---

## Alternatives Considered

### Option A: Full EMR in MVP (Rejected)

**Scope:**
- Clinical notes (free-text + structured fields)
- Diagnosis codes (ICD-10 dropdown)
- Treatment plans (multi-visit planning for braces, implants)
- Prescriptions (e-resep integration if mandated)
- Medical images (X-ray upload)
- Doctor e-signature (PKI integration)

**Effort:** 6-8 weeks (doubles MVP timeline)

**Risk:** Doctors resist adoption ("too complicated"), EMR sits unused while paper files continue.

**Verdict:** Too much effort for uncertain demand. Prioritize CONNECT (booking) which has clear, validated pain point.

---

### Option B: Light EMR (Basic Notes Only) — Rejected

**Scope:**
- Free-text clinical notes (no structured fields)
- No diagnosis codes, no treatment plans
- Doctor types notes, no signature required

**Effort:** 2-3 weeks

**Risk:** 
- Not Permenkes-compliant (no signature, no immutability)
- Clinic can't use it as legal medical record (must keep paper files anyway)
- Doctor enters data twice (digital + paper) → wastes time

**Verdict:** Adds work without solving legal requirement. Clinic still needs paper files, so EMR provides no value.

---

### Option C: Visit Log Only (Chosen)

**Scope:**
- Appointment history (date, doctor, service, payment)
- No clinical notes, no diagnosis
- UU PDP-compliant (patient right to view own appointment history)

**Effort:** Already included in INTELLIGENCE module (Sprint 4)

**Risk:** None. This is appointment data, not medical records.

**Verdict:** Delivers 80% of value (patient history visibility) with 10% of effort.

---

## Decision Matrix

| Criteria | Full EMR | Light EMR | Visit Log Only | Weight | Winner |
|---|---|---|---|---|---|
| **Client demand** | ⚠️ No evidence | ⚠️ No evidence | ✅ Useful | 30% | Visit Log |
| **Time to MVP** | ❌ 14 weeks | ⚠️ 10 weeks | ✅ 8 weeks | 25% | Visit Log |
| **Regulatory compliance** | ⚠️ Complex (e-sig) | ❌ Non-compliant | ✅ Not medical record | 20% | Visit Log |
| **Doctor adoption risk** | ❌ High resistance | ⚠️ Medium resistance | ✅ No workflow change | 15% | Visit Log |
| **Legal liability** | ❌ High (medical record) | ❌ High (claims to be EMR but isn't) | ✅ Low (appointment data) | 5% | Visit Log |
| **Competitive advantage** | ⚠️ Maybe (if done well) | ❌ No (half-baked) | ⚠️ No (baseline) | 5% | Full EMR |

**Weighted score:**
- Full EMR: 45/100
- Light EMR: 40/100
- Visit Log Only: 95/100

---

## Phase 3+ EMR Consideration Criteria

**Before starting EMR development, ALL must be true:**

1. ✅ **Client demand:** 3+ clinics explicitly request EMR ("we need digital clinical notes")
2. ✅ **Paper file pain:** Clients report paper files are causing problems (lost files, illegible handwriting, cross-branch access issues)
3. ✅ **Willingness to pay:** Clients agree to pay extra for EMR module (IDR +1M/month or equivalent)
4. ✅ **Doctor buy-in:** Doctors at pilot clinics agree to use EMR (not forced by director)
5. ✅ **Legal review:** Indonesian healthcare lawyer reviews Permenkes 269 requirements and signs off on implementation plan
6. ✅ **E-signature partner:** Identified BSSN-approved e-signature provider (VIDA, Privy, Digisign) with reasonable pricing

**If ANY is false → defer another 6 months.**

---

## What Happens If Client Asks for EMR in Year 1?

**Response:**
> "Think Edge Dental Suite focuses on practice management (booking, scheduling, operations, analytics). For electronic medical records, we recommend continuing with paper files or using a dedicated EMR system like [recommend Indonesian EMR if available].
> 
> Our visit log shows appointment history (when patient visited, which doctor, which service), which covers most use cases for patient history. Full clinical documentation (diagnosis, treatment notes, prescriptions) is not currently supported.
> 
> We're evaluating EMR for Phase 3 based on client demand. If this is critical for you, please let us know and we'll prioritize accordingly."

**Alternative (enterprise tier):**
> "For clients requiring EMR, we can integrate with your existing EMR system via API (if available) or recommend a dedicated dental EMR partner. Think Edge handles booking and operations, EMR partner handles clinical documentation."

---

## Competitive Positioning

**How do competitors handle EMR?**

| Competitor | EMR Included? | Notes |
|---|---|---|
| **Klinik+ / SimRS** | ✅ Yes (full EMR) | But interview finding: "too complicated, staff hated it" |
| **Halodoc / Alodokter** | ❌ No (booking only) | No clinical documentation |
| **Doctolib (EU)** | ⚠️ Basic notes | Not full EMR, more like "appointment notes" |
| **Dental Intel (US)** | ❌ No (analytics only) | Requires separate practice management software with EMR |

**Insight:** Even European/US leaders (Doctolib, Dental Intel) don't do full EMR. EMR is specialized domain, separate from practice management.

**Think Edge positioning:** Follow Doctolib model — excellent practice management, integrate with EMR if needed, don't build EMR ourselves.

---

## Consequences

### Positive

1. **Faster MVP:** 8 weeks instead of 14 weeks (EMR adds 6 weeks)
2. **Lower risk:** No doctor adoption resistance (paper files continue to work)
3. **No regulatory burden:** Practice management software has lower compliance bar than EMR
4. **Simpler UX:** No complex clinical forms, faster doctor workflow
5. **Focus:** Ship excellent booking/scheduling (core value) instead of mediocre EMR

### Negative

1. **Missing feature:** Some clients may expect EMR (set expectations early)
2. **Competitive gap:** If competitor launches good EMR, we're behind
3. **Data silos:** Clinical notes in paper, appointment data in Think Edge (not unified)

### Mitigation Strategies

**Set expectations early:**
- Website clearly states: "Practice management software" (not EMR)
- Sales calls: "We handle booking, scheduling, operations. For clinical notes, paper files or dedicated EMR."
- Onboarding: "Your paper files stay. Think Edge manages appointments and operations."

**Integration option (Phase 3+):**
- If demand emerges, partner with existing Indonesian EMR (if any) for integration
- Think Edge = source of truth for appointments
- EMR partner = source of truth for clinical notes
- Two-way sync via API

**Monitor demand:**
- Track support requests: "Do you have EMR?" or "Can doctors enter notes?"
- Quarterly survey: "What features are missing?"
- Revisit decision every 6 months

---

## References

- [Permenkes 269/2008 full text](https://peraturan.bpk.go.id/Details/50572/permenkes-no-269menkesperiii2008-tahun-2008)
- [Doctolib feature set](https://www.doctolib.fr/) — note: no full EMR
- [Why practice management ≠ EMR](https://www.dentistryiq.com/practice-management/industry-news/article/16350094/practice-management-software-vs-emr-whats-the-difference)

---

## Review Schedule

**Review trigger:** 3+ clients request EMR OR competitor launches EMR module

**If triggered:**
- Conduct detailed EMR requirements workshop with pilot clients
- Get quotes from e-signature providers (VIDA, Privy, Digisign)
- Legal review of Permenkes 269 compliance plan
- Build vs buy vs partner decision

**Expected:** No EMR for 1-2 years. Visit log (appointment history) covers 80% of use cases without regulatory complexity.
