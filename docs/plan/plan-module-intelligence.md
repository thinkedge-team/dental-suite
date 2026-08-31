# Implementation Plan: Module INTELLIGENCE (Sprint 4)

> **Phase 3.3 Deliverable**
> Future-ready specification for the INTELLIGENCE module (KPI Dashboard, Patient Visit History, Export), deferred to Phase 2/Sprint 4.

---

## 1. Goal & Scope

Deliver actionable insights and patient history overviews based on accumulated CONNECT and OPERATE data:
1. **Director/Manager Dashboards:** Visualize core KPIs (Appointment volumes, Revenue, No-Show rates, Doctor utilization, Branch comparisons).
2. **Patient Visit History:** Provide doctors and staff with a longitudinal view of a patient's past appointments and services rendered (visit log, NOT full clinical EMR).
3. **Data Export:** Secure CSV exports of appointments, revenue, and visits for accounting (e.g., Jurnal.id manual import) and external analysis.
4. **Basic Patient Portal:** A read-only view for patients to check their own past and upcoming appointments, fulfilling UU PDP data access requirements.

*Note: INTELLIGENCE relies heavily on accumulated data. It must be launched after CONNECT has been active for at least 1-2 months to ensure dashboards display meaningful trends rather than empty charts.*

---

## 2. File Map (Future Architecture)

```
src/
├── app/
│   ├── (portal)/intelligence/        # INTELLIGENCE Module Root (Gated)
│   │   ├── dashboard/page.tsx        # KPI Overview: Charts & branch comparisons
│   │   ├── patients/                 
│   │   │   ├── page.tsx              # Searchable global patient directory
│   │   │   └── [id]/page.tsx         # Patient details & visit history timeline
│   │   ├── reports/                  
│   │   │   └── page.tsx              # Custom date-range reporting & CSV Export hub
│   │
│   ├── (patient)/portal/             # Public Patient Portal (Optional Phase 2+)
│   │   ├── login/page.tsx            # OTP-based login (phone number)
│   │   └── history/page.tsx          # Read-only view of patient's own visits
│   │
├── actions/
│   └── intelligence/
│       ├── kpi.ts                    # Server Actions: aggregate metrics (no-show rate, revenue)
│       ├── patient.ts                # Server Actions: fetch patient history, search patients
│       └── export.ts                 # Server Actions: generate and return CSV data
│
├── lib/
│   ├── validations/
│   │   └── intelligence.ts           # Zod schemas (Date ranges, Export params)
│   └── analytics.ts                  # Query optimization helpers & date math
│
└── components/
    └── intelligence/
        ├── kpi-card.tsx              # Reusable metric card (Value, Trend, Sparkline)
        ├── branch-comparison-chart.tsx # Recharts/Chart.js bar chart
        ├── visit-timeline.tsx        # Vertical timeline of patient's past visits
        └── date-range-picker.tsx     # Standardized UI for selecting reporting periods
```

---

## 3. Core Mechanisms

### 3.1 Aggregation & Query Performance
- **Dashboard Queries:** Dashboards will initially query the `Appointment` and `Visit` tables directly. Indexes on `[organizationId, scheduledAt]`, `[branchId, scheduledAt]`, and `[organizationId, status]` ensure fast aggregation.
- **Time-Series Math:** Server actions will utilize libraries like `date-fns` to compute current period vs. previous period (e.g., "This Month" vs "Last Month") to render trend indicators (+12%, -3%).
- **Future Optimization:** If the `Appointment` table exceeds ~100k rows per org, aggregations will be moved to a nightly cron job writing to a materialized `DailyRollup` table.

### 3.2 Data Privacy & RBAC Enforcement
- **Isolation:** All queries must rigorously enforce the `organizationId` filter via the Prisma middleware.
- **Role Scoping:**
  - `DIRECTOR`: Sees aggregate data across all branches.
  - `MANAGER`: Metrics are strictly scoped to their assigned `branchId`.
  - `DOCTOR`: Sees only visit histories for patients they are treating; utilization KPIs limited to their own schedule.
- **Export Control:** CSV export actions check permissions; only `DIRECTOR` and `MANAGER` can download raw data. All exports are logged in the audit trail.

### 3.3 Patient Visit Log vs EMR
- The `Visit` table records administrative and billing facts: Date, Doctor, Service, and Payment Amount.
- It explicitly **does not** include clinical notes, diagnosis codes, or treatment plans, bypassing strict Permenkes 269 EMR requirements for v1.

---

## 4. Verification & Acceptance Criteria (Future)

- [ ] **Data Scoping:** A `MANAGER` at Branch A viewing the dashboard sees 0 data from Branch B.
- [ ] **Trend Accuracy:** KPI aggregations matching raw table counts perfectly; percentage changes correctly account for identical day-count comparisons.
- [ ] **CSV Export:** Export action successfully streams a properly formatted CSV file containing exactly the data visible in the requested date range.
- [ ] **Patient Directory:** Searching for a patient by phone number yields instant results and displays a chronologically sorted timeline of their past visits.
- [ ] **Module Gating:** Accessing `/portal/intelligence` on an org where `moduleIntelligence === false` redirects to `/portal/dashboard` with a 403 error.
