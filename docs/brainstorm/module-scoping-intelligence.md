# Module Scoping: INTELLIGENCE — Data & Analytics

> **Phase 2.1 Deliverable**
> Defining INTELLIGENCE module scope and confirming Phase 2+ timing (after CONNECT data exists).

---

## Decision: INTELLIGENCE Module → Phase 2+ (Sprint 4)

**Rationale: Data dependency — can't analyze appointments that don't exist yet.**

| Module | Launch Timing | Why |
|---|---|---|
| **GROW** | Sprint 1 | Patient discovery — needed first |
| **CONNECT** | Sprint 2 | Booking data starts flowing |
| **INTELLIGENCE** | Sprint 4 | Needs 2+ months of CONNECT data to show meaningful trends |
| **OPERATE** | Sprint 3 (optional) | Independent — no CONNECT dependency |

**Why wait 2 months after CONNECT launch:**
- KPI trends need historical data (30-day, 90-day comparisons)
- No-show rate calculation needs sample size (can't calculate rate from 10 appointments)
- Revenue analytics need baseline (what's "normal" vs "high" for this clinic?)

**Phase 2 trigger:** Sprint 2 complete + 2 months live data collection + client requests analytics.

---

## Core Questions

### Q1: What are the 5 KPIs a director checks every Monday morning?

**From Director interview:**
> "1. Total appointments today (all branches)
> 2. Revenue today vs yesterday
> 3. No-show rate this week
> 4. Which doctors are fully booked vs underutilized
> 5. Low stock alerts"

**INTELLIGENCE delivers (Phase 2):**

**Dashboard widgets:**

1. **Appointments Overview**
   - Today: X appointments (Y checked in, Z pending)
   - This week: X booked / Y completed / Z no-show
   - Comparison: +12% vs last week

2. **Revenue Summary**
   - Today: IDR X (vs IDR Y yesterday)
   - This month: IDR X (vs IDR Y last month)
   - Top service: Cleaning (40% of revenue)

3. **No-Show Rate**
   - This week: 15% (vs 22% last week)
   - Worst day: Monday (30% no-show rate)
   - Branch comparison: Kelapa Gading 10%, Pluit 25%

4. **Doctor Utilization**
   - dr. Andi: 95% booked (18/19 slots filled this week)
   - dr. Sari: 60% booked (12/20 slots filled) ⚠️ Underutilized
   - Suggestion: Promote dr. Sari on website

5. **Operational Alerts**
   - 2 low-stock items (from OPERATE module if enabled)
   - 5 pending approval requests (from OPERATE if enabled)
   - 3 appointments need confirmation (patients booked >1 week ago, no reminder sent)

**Role-based views:**
- **DIRECTOR:** All branches, all KPIs
- **MANAGER:** Own branch only, no revenue (if RBAC configured that way)
- **STAFF:** No access to analytics (unless explicitly granted)

---

### Q2: Does INTELLIGENCE include patient-facing portal (view history, download receipts)?

**Decision: Yes, basic patient portal in Phase 2. Full EMR = Phase 3+.**

**Rationale:**
- **UU PDP compliance:** Patient has right to access their own data
- Interview finding (Doctor): "Patients don't remember when their last visit was"
- Interview finding (Patient): No mention of needing digital records, but UX expectation exists (like banking apps)

**INTELLIGENCE delivers (Phase 2):**

**Patient portal (read-only):**
- Patient logs in with phone + OTP (no password)
- View booking history (past + upcoming)
- View visit history (dates, doctors, services — NO clinical notes in Phase 2)
- Download receipt/invoice (if payment recorded)
- Rebook same service (one-click: "Book Cleaning Again")

**NOT in Phase 2:**
- Clinical notes / diagnosis / treatment plan (EMR scope — Phase 3+)
- Lab results
- X-ray images
- Prescription records

**Why limit scope:**
- Full EMR requires Permenkes 269 compliance (audit trail, retention, doctor signatures)
- Full EMR requires clinical workflow (doctor enters notes during/after visit)
- Basic visit history (what service, when, which doctor) is low-risk and high-value

---

### Q3: Is EMR (electronic medical records, clinical notes) in scope for v1?

**Decision: No. EMR = Phase 3+ (6+ months after CONNECT launch).**

**Rationale from regulatory.md:**
- Permenkes 269/2008 requirements: content rules, 5-year retention, audit trail, access control
- Interview finding (Director): "Klinik+ was too complicated — designed for hospitals"
- **Insight:** EMR is complex, heavily regulated, and clinics are currently using paper files (no urgent pain)

**What qualifies as EMR (out of Phase 2 scope):**
- Clinical notes (doctor's observations during consultation)
- Diagnosis codes (ICD-10)
- Treatment plan
- Prescriptions (e-resep if mandated later)
- Progress notes (follow-up visits)
- Consent forms (surgical procedures)
- Medical images (X-rays, photos)

**What's in Phase 2 (INTELLIGENCE) instead:**
- Visit log: date, doctor, service performed, payment amount
- Patient can see: "You visited dr. Andi on [date] for Cleaning"
- Doctor can see: "Patient's last visit was [date] for [service]"
- No clinical details visible

**Phase 3+ EMR scope (if clients request):**
- Full clinical note entry during/after visit
- Structured forms per service type (cleaning, extraction, filling, braces adjustment)
- Clinical photo upload
- Doctor digital signature
- Audit trail (who viewed/edited what, when)
- Permenkes 269 compliance checklist fully implemented

---

### Q4: Does INTELLIGENCE integrate with accounting software (Jurnal.id, Xero)?

**Decision: CSV export for MVP. API integration = Phase 3+.**

**Rationale:**
- Interview finding (Director): "I use Jurnal.id but enter data manually from Excel"
- Interview finding (Manager): "Accountant needs weekly report"
- **Insight:** Clinics already have accounting workflows — INTELLIGENCE should feed data TO accounting, not replace it

**INTELLIGENCE delivers (Phase 2):**

**CSV export:**
- Director clicks "Export" → selects date range + branch + data type
- Data types:
  - Appointments (for revenue reconciliation)
  - Payments (if payment tracking added in Phase 3)
  - Inventory usage (if OPERATE enabled)
  - Staff attendance (if OPERATE enabled)
- CSV downloads immediately (no email, no batch processing)
- Format matches Jurnal.id import template (research actual format in Phase 3)

**Phase 3+ (if 5+ clients use Jurnal.id):**
- Jurnal.id API integration
- Auto-sync appointments → journal entries
- Auto-sync payments → cash/bank transactions
- OAuth flow: clinic authorizes Think Edge to write to their Jurnal.id account

**Why defer API:**
- API integration is brittle (Jurnal.id changes API, Think Edge breaks)
- CSV export works for 100% of accounting software (universal format)
- Low client urgency (manual entry is annoying but tolerable)

---

### Q5: Who sees what — director sees all branches, manager sees own branch only?

**Decision: RBAC enforced at query level. Default: Director sees all, Manager sees own branch, Staff sees nothing.**

**Rationale:**
- **Security:** Manager at Branch A should not see Branch B's revenue (competitive intel risk)
- **UU PDP:** Analytics aggregates patient data — access must be need-to-know
- **Flexibility:** Director can grant Manager cross-branch access if needed (e.g., regional manager oversees 3 branches)

**INTELLIGENCE RBAC:**

| Role | Analytics Access |
|---|---|
| **SUPER_ADMIN** | All organizations (Think Edge internal) |
| **DIRECTOR** | All branches in their organization |
| **MANAGER** | Own branch only (can be expanded by Director) |
| **STAFF** | None (unless Director explicitly grants) |
| **DOCTOR** | Own appointments only (can see own utilization rate) |

**Implementation:**
- Every analytics query filters by `organizationId` (RLS)
- Manager queries filter by `branchId` (additional constraint)
- Doctor queries filter by `doctorId`
- Audit log: who viewed which report, when

**Override mechanism:**
- Director can assign Manager to multiple branches (e.g., "Regional Manager" role)
- Director can grant Staff read-only dashboard access (e.g., receptionist wants to see daily stats)

---

## User Stories (Phase 2)

### Director

> "As a director, I want to see total appointments booked, attended, and no-showed per branch this month."

**INTELLIGENCE delivers:**
- ✅ Dashboard: monthly appointments by status (bar chart per branch)
- ✅ No-show rate comparison (which branch has worst no-show rate?)
- ✅ Trend chart (no-show rate over last 3 months)

**Acceptance criteria:**
- Director selects month from dropdown → data updates
- Chart shows breakdown: Completed (green), No-Show (red), Cancelled (gray)
- Clicking branch bar → drills down to daily breakdown

---

### Doctor

> "As a doctor, I want to see my patient's previous treatment history before the consultation."

**INTELLIGENCE delivers (Phase 2 — basic):**
- ✅ Doctor portal: patient search by name or phone
- ✅ Visit history list (dates, services, which doctor)
- ❌ Clinical notes: NOT in Phase 2 (paper files still used)

**Phase 3 EMR:**
- ✅ Clinical notes visible
- ✅ Photos, X-rays attached to visits
- ✅ Treatment plan and progress

**Acceptance criteria (Phase 2):**
- Doctor searches "Dewi" → sees 3 past visits
- Each visit shows: date, branch, doctor, service performed
- Clicking visit → shows invoice (if available), no clinical details

---

### Manager

> "As a manager, I want to see which services generate the most revenue at my branch."

**INTELLIGENCE delivers:**
- ✅ Revenue by service chart (pie or bar chart)
- ✅ Top 5 services by revenue this month
- ✅ Comparison: this month vs last month

**Acceptance criteria:**
- Manager sees only own branch data (other branches hidden)
- Chart shows: Cleaning 40%, Whitening 25%, Consultation 15%, etc.
- Manager can export CSV of full revenue breakdown

---

## Must-Have (Phase 2, Sprint 4)

| Feature | Why | Effort |
|---|---|---|
| **Dashboard widgets** (5 KPIs per Director interview) | Director's #1 buying trigger | 1.5 weeks |
| **Appointments analytics** (total, by status, by branch, trends) | Core analytics foundation | 1 week |
| **Revenue by service** | Manager wants to know what's profitable | 3 days |
| **No-show rate tracking** | 20-30% no-show rate is huge problem | 2 days |
| **Doctor utilization report** | Underutilized doctors = lost revenue | 3 days |
| **Branch comparison view** (director-only) | Multi-branch visibility (original pain point) | 3 days |
| **Date range filter** (this week, this month, last 30 days, custom) | Flexibility | 2 days |
| **CSV export** (appointments, revenue, visits) | Accounting integration workaround | 3 days |
| **Basic patient portal** (login via OTP, view history, rebook) | UU PDP compliance + patient convenience | 1 week |
| **RBAC enforcement** (Director sees all, Manager sees own branch) | Security requirement | 2 days |

**Total effort: ~3 weeks**

---

## Nice-to-Have (Phase 3+)

| Feature | Why defer | Effort |
|---|---|---|
| **Full EMR** (clinical notes, diagnosis, treatment plan) | Regulatory complexity, no urgent demand | 4-6 weeks |
| **Jurnal.id API integration** | CSV export acceptable for MVP | 1 week |
| **Patient satisfaction survey** (post-visit NPS) | Nice-to-have, Google reviews more important | 1 week |
| **Predictive analytics** (forecast next month's appointments) | Too advanced, no baseline data yet | 2 weeks |
| **Custom report builder** | Overkill — 5 KPIs + CSV export covers 90% of needs | 2 weeks |
| **Mobile app** (native iOS/Android for analytics) | Web responsive is enough | 4 weeks |
| **Real-time notifications** (push notifications for low stock, no-shows) | Email/in-app notifications sufficient | 1 week |
| **Cohort analysis** (patient retention, repeat visit rate) | Phase 3+ — needs 6+ months data | 1 week |

---

## Out of Scope

| Feature | Why |
|---|---|
| **Business intelligence suite** (pivot tables, ad-hoc queries) | Think Edge is not Tableau/Looker |
| **Data warehouse** (OLAP, star schema) | Overkill for dental clinic scale |
| **Machine learning** (predict no-shows, demand forecasting) | Too advanced, no ROI proof |
| **Patient health records interoperability** (HL7, FHIR) | Government standards not adopted yet |
| **Telemedicine analytics** | Telemedicine out of scope |

---

## Data Model Notes

### Analytics Queries (Read-Heavy)

**Challenge:** Aggregations across 1000+ appointments are slow on transactional DB.

**Solution (Phase 3+ optimization):**
- Materialized views (Postgres) or daily rollup tables
- Example: `analytics_daily_summary` table pre-calculates daily stats (runs at midnight)
- Dashboard queries read from rollup table instead of scanning `Appointment` table

**Phase 2 approach:**
- Query `Appointment` table directly (acceptable for <1000 appointments/month per branch)
- Add indexes: `[organizationId, scheduledAt]`, `[branchId, status, scheduledAt]`
- If performance issue arises → optimize in Phase 3

---

## Success Metrics (Post-Launch)

| Metric | Target | Source |
|---|---|---|
| **Dashboard daily active users** | 70%+ of directors check dashboard daily | Analytics |
| **CSV export usage** | 80%+ of directors export monthly | Feature usage tracking |
| **Patient portal adoption** | 20%+ of patients log in to view history | Patient portal analytics |
| **Decision-making improvement** | 50%+ of directors say "dashboard helps me make better decisions" (survey) | Post-launch interview |
| **Time saved on reporting** | 1+ hour/week saved (vs manual Excel consolidation) | Director interview follow-up |

---

## INTELLIGENCE Depends on CONNECT Data

**Why Sprint 4 timing makes sense:**

```
Sprint 1 (2 weeks): GROW → Patient website live
Sprint 2 (3 weeks): CONNECT → Online booking live
[Wait 2 months: Data collection]
  → 300-500 appointments booked
  → No-show patterns emerge
  → Doctor utilization data accumulated
Sprint 3 (3 weeks, optional): OPERATE → Operations management
Sprint 4 (3 weeks): INTELLIGENCE → Analytics on real data
```

**Without 2-month wait:** Dashboard shows "No data yet" — bad user experience, no value demonstrated.

**With 2-month wait:** Dashboard shows real trends → Director sees value immediately.

---

## Phase 2 Launch Criteria

**Before starting INTELLIGENCE development:**
1. ✅ CONNECT live for 2+ months
2. ✅ At least 300 completed appointments in system (across all pilot clinics)
3. ✅ At least 1 client explicitly requests analytics/reporting
4. ✅ Schema audit: ensure all required fields captured (payment amount, service type, appointment status)

**If criteria not met:** Defer to Phase 3, focus on CONNECT enhancements (WA API, QR check-in) or OPERATE instead.

---

## Next: Patient Journey Map

All 4 modules scoped. Now visualize how they connect in the end-to-end patient journey.
