# Regulatory & Compliance Requirements — Indonesia

> **Phase 1.3 Deliverable**
> Legal and regulatory requirements affecting Think Edge Dental Suite feature design and data handling.

---

## Overview

Indonesian dental clinics operate under healthcare regulations that affect:
- What patient data must be stored and how long
- Who can access medical records
- Data privacy and consent requirements
- Doctor licensing verification
- Insurance claim formats

This document maps regulations to platform modules and classifies requirements as **Must Have** (blocks launch), **Nice to Have** (competitive advantage), or **Out of Scope** (defer to Phase 2+).

---

## 1. Permenkes No. 269/2008 — Rekam Medis (Medical Records)

**Source:** Peraturan Menteri Kesehatan Republik Indonesia Nomor 269/MENKES/PER/III/2008 tentang Rekam Medis

### Key Requirements

| Requirement | Detail | Module Impact | Classification |
|---|---|---|---|
| **Content of medical records** | Must include: patient identity, examination results, diagnosis, treatment, action taken, doctor/staff who performed treatment | INTELLIGENCE (if EMR scope) | ⬜ **Out of Scope** for MVP — EMR deferred to Phase 2+ |
| **Retention period** | Minimum 5 years from last treatment date | INTELLIGENCE | ✅ **Must Have** — soft-delete only (`deletedAt` field), no hard delete before 5 years |
| **Access control** | Only authorized personnel can access; patient has right to view their own record | INTELLIGENCE + Auth | ✅ **Must Have** — RBAC enforces access, patient portal for self-view |
| **Physical vs electronic** | Electronic medical records acceptable if system ensures authenticity and can't be altered without audit trail | INTELLIGENCE | ✅ **Must Have** — audit log for all record access/modification |
| **Ownership** | Medical record belongs to healthcare facility, not patient (but patient has access rights) | INTELLIGENCE | ✅ **Must Have** — clarify in Terms of Service |
| **Confidentiality** | Healthcare facility must protect patient data from unauthorized access | All modules | ✅ **Must Have** — encryption at rest, HTTPS, RBAC |

### Implementation Checklist

- [ ] `Patient` and `Visit` models: add `deletedAt DateTime?` for soft-delete
- [ ] Retention policy enforcement: cron job checks `deletedAt + 5 years < NOW()` before allowing hard delete
- [ ] Audit trail: `AuditLog` model records `{ userId, action, resourceType, resourceId, timestamp, ipAddress }`
- [ ] Patient portal: read-only view of own visit history (INTELLIGENCE module)
- [ ] Terms of Service: clarify record ownership and access rights
- [ ] Security: already covered by Auth.js JWT + Prisma RLS patterns + HTTPS

**Module mapping:**
- GROW: not affected
- CONNECT: booking data is not "rekam medis" — retention can be shorter
- OPERATE: inventory/staff data not medical records
- **INTELLIGENCE: primary impact** — visit history, treatment notes (if EMR scope expands)

**MVP Decision:** 
- ✅ Soft-delete and 5-year retention: implement in schema (already has `deletedAt` pattern ready)
- ✅ Audit logging: implement for all patient data access
- ⬜ Full EMR (clinical notes, diagnosis, treatment): **deferred to Phase 2+** due to regulatory complexity and UX requirements

---

## 2. UU PDP (Undang-Undang Pelindungan Data Pribadi) — Personal Data Protection Act 2022

**Source:** UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (Indonesia's GDPR-equivalent, effective October 2024)

### Key Requirements

| Requirement | Detail | Module Impact | Classification |
|---|---|---|---|
| **Consent for processing** | Must obtain explicit consent before collecting/processing personal data | CONNECT (booking) | ✅ **Must Have** — consent checkbox at booking, stored with timestamp |
| **Purpose limitation** | Data only used for stated purpose | All modules | ✅ **Must Have** — Terms clearly state usage (appointment mgmt, analytics) |
| **Data minimization** | Collect only necessary data | CONNECT | ✅ **Must Have** — booking form: name + phone + optional email (no unnecessary fields) |
| **Data localization** | Sensitive personal data must be stored in Indonesia (with exceptions for cross-border transfer with consent) | All modules | ✅ **Must Have** — host database in Indonesian data center (or explicit consent for offshore) |
| **Right to access** | Data subject can request copy of their data | INTELLIGENCE | ✅ **Must Have** — patient portal shows own data |
| **Right to rectification** | Data subject can request correction | INTELLIGENCE | ⚠️ **Nice to Have** — patient can request edit via email (manual for MVP, self-service in Phase 2) |
| **Right to erasure** | Data subject can request deletion (with exceptions for legal retention) | INTELLIGENCE | ✅ **Must Have** — `/api/patient/delete-account` with conflict check (5-year retention rule wins) |
| **Data breach notification** | Must notify authority within 72 hours | Infrastructure | ✅ **Must Have** — incident response plan, Sentry error monitoring |
| **Data controller obligations** | Register with authority, appoint Data Protection Officer if > certain scale | Business/Legal | ⬜ **Out of Scope** — legal team handles, not platform feature |

### Health Data Classification (UU PDP Article 4)

**Sensitive personal data** includes health records → stricter protection required:
- Explicit consent (not just opt-out)
- Enhanced security (encryption)
- Access logging

**Think Edge data classified as sensitive:**
- Patient phone + name + appointment reason (health-related)
- Visit history (if EMR scope)

**Think Edge data NOT sensitive:**
- Clinic staff scheduling (internal ops)
- Inventory data (business ops)

### Implementation Checklist

- [ ] Consent checkbox at booking: "Saya menyetujui [Klinik Name] untuk menyimpan dan memproses data pribadi saya sesuai [Privacy Policy]"
- [ ] Consent record: `Patient.consentedAt DateTime`, `Patient.consentIp String?`
- [ ] Privacy Policy page: `/privacy` (Bahasa Indonesia) — clear purpose statement
- [ ] Terms of Service: `/terms` — data usage, retention, user rights
- [ ] Data export API: `GET /api/patient/me/export` → JSON of all patient's data
- [ ] Account deletion API: `DELETE /api/patient/me` → soft-delete with retention check
- [ ] Database location: Railway/Supabase Jakarta region OR explicit consent for Singapore/US region
- [ ] Breach notification procedure: documented in DevOps plan (Phase 3.5)

**Module mapping:**
- **CONNECT: primary impact** — booking flow collects patient PII
- **INTELLIGENCE:** patient portal for data access + deletion
- GROW: public website doesn't collect PII (just displays clinic info)
- OPERATE: internal ops data, not patient data

**MVP Decision:**
- ✅ Consent checkbox + timestamp: implement in booking form (CONNECT Sprint 2)
- ✅ Privacy Policy + Terms pages: write and link before first patient booking
- ✅ Data export + deletion API: implement in INTELLIGENCE Sprint 4
- ✅ Indonesian data center: select Railway Jakarta or Supabase Singapore with consent disclosure
- ⬜ Self-service data correction: defer to Phase 2 (manual email process for MVP)

---

## 3. SIP/STR — Doctor Licensing (Surat Izin Praktik / Surat Tanda Registrasi)

**Source:** Permenkes No. 31/2019 tentang Sistem Informasi Pemerintahan Bidang Kesehatan

### Key Requirements

**STR (Surat Tanda Registrasi):**
- National registration issued by KKI (Konsil Kedokteran Indonesia)
- Valid 5 years, must be renewed
- Required for all practicing doctors

**SIP (Surat Izin Praktik):**
- Practice permit issued by local health office (Dinas Kesehatan)
- Tied to specific clinic location
- Must be renewed annually

### Should Think Edge validate SIP/STR numbers?

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Validate via API** (if govt API exists) | Ensures only licensed doctors listed | Dependency on govt system uptime, API may not exist or may be restricted | ⬜ **Out of Scope** — no public API available as of 2024 |
| **Store but don't validate** | Clinic enters number, platform stores it for their records | No verification — clinic could enter fake number | ⚠️ **Nice to Have** — useful for clinic's own compliance tracking |
| **Don't store at all** | Simpler schema | Clinic has no digital record of doctor licenses | ⬜ **Out of Scope** for MVP |

### Implementation Decision

**MVP:** Store `Doctor.sipNumber String?` and `Doctor.strNumber String?` as optional fields (clinic can track if they want). No validation. Display on doctor profile page if present.

**Phase 2+:** If government launches public STR verification API, integrate validation and show "Verified" badge on doctor profiles.

**Module mapping:**
- **GROW:** Doctor profile pages can display SIP/STR (builds trust with patients)
- CONNECT: booking logic doesn't need license validation
- OPERATE/INTELLIGENCE: not affected

---

## 4. BPJS & Insurance Integration

**Source:** BPJS Kesehatan (Indonesia's national health insurance) and private insurance providers

### Current State

- **BPJS claims:** typically submitted via offline/manual portal by clinic admin (not real-time API)
- **Private insurance (Allianz, Prudential, AXA):** each has own claim submission format (usually email/portal)
- **No standard API** for claim submission across insurance providers in Indonesia (unlike US/EU)

### What clinics need from Think Edge

| Need | Module | Classification |
|---|---|---|
| **Track which patients have insurance** | CONNECT | ⚠️ **Nice to Have** — `Appointment.insuranceId` FK to `InsurancePartner` |
| **Display accepted insurance on website** | GROW | ✅ **Must Have** — `InsurancePartner` model already in schema |
| **Generate claim documentation** (patient name, treatment code, cost) | INTELLIGENCE | ⬜ **Out of Scope** for MVP — manual export for now |
| **Submit claim via API** | INTELLIGENCE | ⬜ **Out of Scope** — no standard API exists |

### Implementation Decision

**MVP:**
- ✅ `InsurancePartner` CRUD (GROW CMS): clinic lists accepted insurance on website
- ✅ `Appointment.insuranceId?` (CONNECT): receptionist can select patient's insurance at booking
- ⬜ Claim generation: defer to Phase 2+ (manual process for MVP)

**Phase 2+:** If insurance providers launch APIs or if there's demand for claim export templates, add CSV export with BPJS format.

---

## 5. E-Resep (Electronic Prescription) — Optional/Future

**Source:** Permenkes No. 3 Tahun 2015 + Surat Edaran Kemenkes (e-prescription pilot programs)

### Current State (2024-2026)
- E-prescription is being piloted in some hospitals
- Not yet mandatory for dental clinics
- No standardized national system yet

### Implementation Decision

⬜ **Out of Scope** for MVP and Phase 2. If EMR scope expands in Phase 3+, revisit when regulation mandates e-prescription for dental clinics.

---

## Compliance Checklist Summary

### Must Have (blocks MVP launch)

- [ ] **Data retention:** Soft-delete only, 5-year minimum retention for patient visit data
- [ ] **Consent:** Checkbox + timestamp at booking
- [ ] **Privacy Policy:** Published at `/privacy` in Bahasa Indonesia
- [ ] **Terms of Service:** Published at `/terms`
- [ ] **Data access:** Patient can view own appointment history
- [ ] **Data deletion:** Patient can request account deletion (with retention conflict check)
- [ ] **Access control:** RBAC ensures only authorized staff see patient data
- [ ] **Audit logging:** All patient data access logged (userId + timestamp + action)
- [ ] **Encryption:** HTTPS for all traffic, database credentials encrypted at rest
- [ ] **Data location:** Database in Indonesian data center OR explicit consent for offshore

### Nice to Have (competitive advantage, not blockers)

- [ ] Doctor SIP/STR tracking (helps clinic with compliance)
- [ ] Insurance selection at booking (improves workflow)
- [ ] Verified doctor badge (if govt API available)
- [ ] Patient self-service data correction (email process acceptable for MVP)

### Out of Scope (explicitly deferred)

- ❌ Full EMR (clinical notes, diagnosis) — Phase 2+
- ❌ E-prescription — Phase 3+ (when mandated)
- ❌ BPJS claim submission API — Phase 2+ (if APIs become available)
- ❌ Real-time license validation — Phase 2+ (no govt API)
- ❌ Data Protection Officer appointment — legal/business decision, not platform feature

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| UU PDP enforcement before launch | High (law effective Oct 2024) | High (fines up to IDR 2B) | Implement all Must Have items before first client onboarding |
| Permenkes 269 audit | Low (mostly hospital-focused) | Medium (reputational) | Soft-delete + audit log in place from Day 1 |
| Data breach | Low (if security checklist followed) | High (breach notification + fines) | Phase 6 security review, Sentry monitoring, incident response plan |
| Insurance API becomes available | Medium | Medium (competitive pressure) | Modular design — can add integration later without schema changes |
| E-prescription mandate | Low (2026-2027) | Low (affects EMR scope only) | EMR already deferred, can add when required |

---

## Next Steps

1. Legal review: have Indonesian healthcare lawyer review this checklist (user/Think Edge to arrange)
2. Draft Privacy Policy + Terms of Service (Phase 2 Brainstorming)
3. Confirm database hosting location (Railway Jakarta preferred, document in ADR-007)
4. Add audit logging requirements to Phase 3 data model finalization
5. Add consent checkbox to CONNECT booking wireframes (Phase 2 UX Direction)

---

## References & Further Reading

- [UU PDP full text (Bahasa)](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)
- [Permenkes 269/2008 (rekam medis)](https://peraturan.bpk.go.id/Details/50572/permenkes-no-269menkesperiii2008-tahun-2008)
- [Permenkes 31/2019 (sistem informasi kesehatan)](https://peraturan.bpk.go.id/Details/109659/permenkes-no-31-tahun-2019)
- BPJS Kesehatan: [bpjs-kesehatan.go.id](https://www.bpjs-kesehatan.go.id/)
- KKI (doctor licensing): [kki.go.id](http://www.kki.go.id/)
