# Module Scoping: OPERATE — Clinic Operations

> **Phase 2.1 Deliverable**
> Defining OPERATE module scope and confirming Phase 2+ deferral based on user research priorities.

---

## Decision: OPERATE Module → Phase 2+

**Rationale from user interviews:**

| Finding | Source | Implication |
|---|---|---|
| "Online booking would cut my workload in half" | Receptionist | CONNECT is higher ROI than OPERATE |
| "I spend 3-4 hours/day handling booking WhatsApp messages" | Receptionist | CONNECT saves 50% of receptionist time |
| "Show me real-time dashboard + online booking — I'll sign immediately" | Director | GROW + CONNECT = demo drivers, OPERATE is not |
| "Weekly scheduling takes 1 hour every Friday" | Manager | Pain exists, but lower priority than booking chaos |
| "I make the schedule in a notebook, type into Excel, send to WA group" | Manager | Manual is annoying but tolerable for MVP |
| "Low stock alerts would be helpful" | Manager | Nice-to-have, not urgent |

**MVP priority:**
1. **GROW** — patient acquisition (website, SEO, discovery)
2. **CONNECT** — booking automation (saves 3-4 hours/day per receptionist)
3. **INTELLIGENCE** — depends on CONNECT data (can't analyze appointments that don't exist yet)
4. **OPERATE** — efficiency improvement (saves 1 hour/week), but doesn't unlock revenue like CONNECT does

**Phase 2 timing:** After Sprint 2 (CONNECT) is live and stable for 1+ month. Use that month to:
- Gather feedback on CONNECT adoption
- Validate whether clinics actually want OPERATE or if Excel is "good enough"
- Interview branch managers again: "Now that booking is automated, what's your next biggest pain?"

---

## What OPERATE Would Include (Phase 2 Scope)

### Core Questions

#### Q1: Shift management — weekly recurring schedule or ad-hoc daily scheduling?

**Decision: Weekly recurring template with daily overrides.**

**Rationale:**
- Interview finding (Manager): "I make it on Friday for the next week"
- Most clinics have predictable schedules (same pattern every week)
- Exceptions (leave, sick, events) need override mechanism

**OPERATE delivers:**

**Weekly template:**
- Manager sets "default schedule" per staff member
- Example: Receptionist A works Mon-Fri 9 AM - 5 PM, Receptionist B works Mon-Fri 1 PM - 9 PM
- Template repeats every week automatically

**Daily overrides:**
- Manager clicks date → modifies schedule for that day only
- "Receptionist A on leave Thursday" → Thursday slot shows empty, system alerts manager to assign coverage

**Shift types:**
- Morning (9 AM - 1 PM)
- Afternoon (1 PM - 5 PM)
- Evening (5 PM - 9 PM)
- Full day (9 AM - 5 PM)
- Custom (manager defines start/end time)

---

#### Q2: Inventory — consumption tracking or purchase-order workflow?

**Decision: Hybrid — simple stock log + low-stock alerts. No full procurement workflow in Phase 2.**

**Rationale:**
- Interview finding (Manager): "I walk to the supply room and look. If low, I WhatsApp Dr. Budi for approval."
- Manual process is tolerable — full procurement workflow (RFQ, PO, approval chain, vendor management) is overkill for dental clinic SMB

**OPERATE delivers:**

**Inventory tracking:**
- Stock items: name, category (consumables, equipment, medicine), quantity, unit (box, piece, bottle), min stock level
- Staff logs usage: "Used 5 syringes today" → quantity decreases
- Low-stock alert: when quantity < min stock → notification to manager + director

**No procurement workflow:**
- Manager sees low-stock alert → manually orders (via WhatsApp, phone, email to supplier)
- When stock arrives → manager updates quantity in system
- No PO numbers, no vendor management, no approval chain (manager already has spending limit)

**Phase 3+ (if demand):** Full procurement (create PO → get approval → track delivery → auto-update stock)

---

#### Q3: Approval flow — branch → director, or branch → manager → director?

**Decision: Simple two-tier — branch staff → branch manager → approved/rejected. Director override available.**

**Rationale:**
- Interview finding (Manager): "Ordering supplies over IDR 1M needs Dr. Budi's approval"
- Most approvals are branch-level (supplies, schedule changes, small purchases)
- Director doesn't want every small approval — only high-value or escalated items

**OPERATE delivers:**

**Approval request types:**
1. Procurement (supplies over threshold, e.g., IDR 1M)
2. Schedule change (doctor leave, staff swap)
3. Discount to patient (beyond standard policy)
4. Other (freeform text)

**Approval workflow:**
```
Staff creates request
  ↓
Branch Manager reviews
  ↓ (approved)                ↓ (rejected)
Executed                      Staff notified
  OR
  ↓ (escalate to director)
Director reviews
  ↓ (approved)                ↓ (rejected)
Executed                      Staff notified
```

**Escalation trigger:**
- Manager can't decide → clicks "Escalate to Director"
- Automatic escalation: procurement > IDR 5M → auto-escalate to director

---

#### Q4: Does OPERATE include payroll / compensation calculation?

**Decision: No. Only attendance tracking. Payroll is accounting software's job.**

**Rationale:**
- Payroll complexity: tax (PPh 21), BPJS contributions, overtime rules, bonuses — specialized domain
- Clinics already use Jurnal.id or similar for accounting
- OPERATE should feed data TO accounting software (attendance log export), not replace it

**OPERATE delivers:**
- Staff attendance log (clock in/out, total hours per day)
- CSV export → import into Jurnal.id or manual payroll calculation

**NOT in scope:**
- Salary calculation
- Tax withholding
- Payslip generation
- Payment disbursement

---

#### Q5: Attendance — manual log-in or integration with biometric devices?

**Decision: Manual log-in for Phase 2. Biometric integration = Phase 3+.**

**Rationale:**
- Interview finding (Director): "We have fingerprint machines, but data is stuck on device — USB export is tedious"
- Interview finding (Manager): "I only check attendance if there's a dispute"
- **Insight:** Attendance tracking is audit/dispute resolution, not daily operational need
- Biometric device integration is fragmented (Solution, Fingerspot, ZKTeco all have different SDKs)

**OPERATE delivers:**

**Manual attendance:**
- Staff portal has "Clock In" / "Clock Out" buttons
- Staff clicks at start/end of shift → timestamp + geolocation recorded
- Manager views attendance report: who's on time, who's late, who's absent

**Geofencing (optional):**
- Staff can only clock in if within 100m of clinic location (use browser geolocation API)
- Prevents remote clock-in fraud

**CSV import from biometric device:**
- Manager exports attendance data from fingerprint device (USB)
- Uploads CSV to OPERATE
- System parses and imports (one-time manual step, but data is in the platform)

**Phase 3+ biometric integration:**
- If 5+ clients use same device brand → build SDK integration
- Auto-sync attendance data from device to platform (no manual export)

---

## User Stories (Phase 2)

### Branch Manager

> "As a branch manager, I want to see which staff are scheduled this week and who called in sick."

**OPERATE delivers:**
- ✅ Weekly calendar view per branch
- ✅ Staff schedule displayed (color-coded by staff member)
- ✅ Override mechanism (mark staff as "On Leave" for specific days)
- ✅ Coverage alerts ("Thursday: No receptionist scheduled")

**Acceptance criteria:**
- Manager sees next 2 weeks of schedules in calendar view
- Clicking a day allows editing (add/remove staff, change shift times)
- System warns if no staff scheduled for an open shift

---

### Receptionist (or any staff)

> "As a receptionist, I want to log that we used 3 dental syringes today so inventory stays accurate."

**OPERATE delivers:**
- ✅ Inventory quick-log widget in staff portal
- ✅ "Log Usage" form: select item → enter quantity → reason (optional) → submit
- ✅ Stock updates in real-time

**Acceptance criteria:**
- Logging usage takes < 30 seconds
- Stock level updates immediately
- Low-stock alert triggers if quantity drops below minStock

---

### Director

> "As a director, I want to approve procurement requests from all branches in one dashboard."

**OPERATE delivers:**
- ✅ `/portal/approvals` → list of pending approvals across all branches
- ✅ One-click approve/reject with optional comment
- ✅ Approval history (who approved what, when)

**Acceptance criteria:**
- Director sees all pending approvals (all branches) on one page
- Clicking "Approve" → request status changes, requestor notified
- Audit trail: director can see "Manager X approved IDR 2M supply order on [date]"

---

## Must-Have (Phase 2, Sprint 3)

| Feature | Why | Effort |
|---|---|---|
| **Shift scheduling** (weekly template + daily overrides) | Manager pain point (1 hour/week manual work) | 1.5 weeks |
| **Staff attendance log** (manual clock in/out) | Audit trail for disputes | 3 days |
| **Inventory item CRUD** | Track what supplies exist | 2 days |
| **Stock adjustment log** (usage, restock, adjustment) | Manager knows when to reorder | 3 days |
| **Low-stock alert** (notification when stock < minStock) | Prevents running out mid-day | 2 days |
| **Approval request workflow** (create → review → approve/reject) | Manager pain point ("must ask Dr. Budi for approval") | 1 week |
| **Approval dashboard** (director sees all pending across branches) | Director's #1 multi-branch visibility need (after appointments) | 3 days |

**Total effort: ~3 weeks**

---

## Nice-to-Have (Phase 3+)

| Feature | Why defer | Effort |
|---|---|---|
| **Biometric device integration** | Fragmented SDKs, CSV import acceptable | 2 weeks |
| **Recurring shifts** (auto-generate weekly schedule) | Manual template works for MVP | 3 days |
| **Shift swap requests** (staff requests to swap shifts) | Nice-to-have, manual coordination works | 1 week |
| **Overtime tracking** | Payroll complexity, defer to accounting software | 1 week |
| **Inventory auto-ordering** (auto-create order when low stock) | Too advanced, manual is fine | 1 week |
| **Vendor management** (supplier contacts, pricing history) | Procurement workflow, Phase 3+ | 1 week |
| **Purchase order workflow** (PO number, approval chain, delivery tracking) | Full ERP feature, overkill for dental SMB | 2 weeks |

---

## Out of Scope

| Feature | Why |
|---|---|
| **Payroll calculation** | Accounting software's job, not practice management |
| **HR management** (onboarding, performance reviews, training) | Different product |
| **Equipment maintenance tracking** | Low ROI, manual calendar works |
| **Staff messaging** (internal chat) | WhatsApp already used |
| **Task management** (to-do lists, projects) | Out of domain |

---

## Why OPERATE Can Wait (Evidence)

**From interviews:**

| Pain Point | Module | Frequency | Impact |
|---|---|---|---|
| Manual booking messages | CONNECT | 3-4 hours/day | High — receptionist bottleneck |
| Double-booking | CONNECT | 3x/month | High — embarrassing, patient loses trust |
| No cross-branch visibility | GROW + CONNECT | Daily | High — losing patients to competitors |
| Manual weekly scheduling | OPERATE | 1 hour/week | Medium — annoying but tolerable |
| Low-stock tracking | OPERATE | Ad-hoc | Low — rarely runs out |
| Approval workflow | OPERATE | ~5 requests/month | Low — WhatsApp works, just not centralized |

**ROI analysis:**

| Module | Time Saved Per Week | Revenue Impact | Dev Effort |
|---|---|---|---|
| **CONNECT** | 20 hours/week (receptionist) | High — more appointments booked | 3 weeks |
| **OPERATE** | 2-3 hours/week (manager) | None — efficiency only | 3 weeks |

**Conclusion:** Same dev effort, but CONNECT saves 10x more time and directly enables more appointments (revenue). OPERATE is nice-to-have efficiency improvement, not a revenue driver.

---

## Phase 2 Launch Trigger

**Criteria to start OPERATE development:**
1. ✅ CONNECT module live and stable for 1+ month
2. ✅ At least 3 clients using CONNECT actively
3. ✅ Client feedback survey shows "operations management" in top 3 requested features
4. ✅ At least 2 clients explicitly say "I'd pay extra for shift scheduling and inventory"

**If criteria not met:** Defer OPERATE to Phase 3, focus on INTELLIGENCE or CONNECT enhancements (WA Business API, QR check-in, recurring appointments).

---

## Next: INTELLIGENCE Scoping

INTELLIGENCE also deferred to Phase 2, but depends on CONNECT data flowing first.
