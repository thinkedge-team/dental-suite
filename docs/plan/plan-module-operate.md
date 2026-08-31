# Implementation Plan: Module OPERATE (Sprint 3)

> **Phase 3.3 Deliverable**
> Future-ready specification for the OPERATE module (Shift Scheduling, Inventory, Approvals, Attendance), deferred to Phase 2/Sprint 3.

---

## 1. Goal & Scope

Deliver internal clinic operations management designed to replace Excel spreadsheets and unstructured WhatsApp coordination:
1. **Shift Management:** Weekly recurring schedule templates with daily overrides for staff.
2. **Inventory Tracking:** Simple stock logs (usage, restock, adjustment) with low-stock alerts.
3. **Approval Workflows:** Two-tier request system (Staff → Manager → Director) for procurement and schedule changes.
4. **Attendance Logging:** Basic manual clock in/out for audit and dispute resolution (biometric sync deferred).

*Note: This module is heavily gated by `Organization.moduleOperate`. All components and actions must verify this flag before execution.*

---

## 2. File Map (Future Architecture)

```
src/
├── app/
│   ├── (portal)/operate/             # OPERATE Module Root (Gated)
│   │   ├── dashboard/page.tsx        # Overview: Low stock, pending approvals, today's absent staff
│   │   ├── schedule/                 
│   │   │   ├── page.tsx              # Weekly calendar view of staff shifts
│   │   │   └── template/page.tsx     # Define recurring default shift patterns
│   │   ├── inventory/                
│   │   │   ├── page.tsx              # List view with "Low Stock" highlights
│   │   │   ├── [id]/page.tsx         # Item details & stock adjustment history
│   │   │   └── log/page.tsx          # Quick-action form to log daily usage
│   │   ├── approvals/                
│   │   │   ├── page.tsx              # Manager/Director: Pending vs Resolved requests
│   │   │   └── new/page.tsx          # Staff: Form to request supplies or leave
│   │   └── attendance/               
│   │       ├── page.tsx              # Manager view: Timesheet records
│   │       └── clock/page.tsx        # Staff view: Big "Clock In" / "Clock Out" buttons
│   │
├── actions/
│   └── operate/
│       ├── shift.ts                  # Server Actions: assign, modify, override shifts
│       ├── inventory.ts              # Server Actions: create item, adjust stock
│       ├── approval.ts               # Server Actions: submit, approve, reject, escalate
│       └── attendance.ts             # Server Actions: clock in, clock out
│
├── lib/
│   └── validations/
│       └── operate.ts                # Zod schemas (InventoryItem, ApprovalRequest, Shift)
│
└── components/
    └── operate/
        ├── shift-calendar.tsx        # Interactive weekly grid for staff coverage
        ├── inventory-badge.tsx       # Visual indicator (Red if stock < minStock)
        ├── approval-card.tsx         # Request details with Approve/Reject actions
        └── clock-widget.tsx          # Geolocation-aware clock in/out component
```

---

## 3. Core Mechanisms

### 3.1 Inventory & Low-Stock Alerts
- **Mechanism:** Inventory adjustments (e.g., receptionist logs "Used 5 syringes") hit `adjustInventory` Server Action.
- **Trigger:** The action checks the new `stock` against `minStock`. If `stock < minStock`, it generates a notification payload (for future in-app notifications) and highlights the item in red on the dashboard.
- **Race Conditions:** Stock updates must use Prisma atomic operations (e.g., `update { data: { stock: { decrement: 5 } } }`) rather than read-then-write to prevent concurrent usage logs from corrupting the total.

### 3.2 Two-Tier Approval Workflow
- **State Machine:** `PENDING` → (`APPROVED` | `REJECTED`).
- **Data payload:** The `payload` field on `ApprovalRequest` is stored as JSON, allowing flexibility for different request types (e.g., `PROCUREMENT` needs `itemId`, `qty`, `estimatedCost`; `MAINTENANCE` needs `description`, `urgency`).
- **RBAC Enforcement:** 
  - `STAFF` can only read their own requests and create new ones.
  - `MANAGER` can approve/reject requests originating from their own `branchId`.
  - `DIRECTOR` can view, approve, reject, or override requests across all branches.

### 3.3 Shift Scheduling
- **Data Model implication:** The `Shift` table handles concrete daily assignments. A cron job or background task (to be defined in Phase 2) will periodically generate concrete `Shift` records based on the recurring template.
- **Overrides:** Managers can edit a specific `Shift` record for a day without altering the master template.

---

## 4. Verification & Acceptance Criteria (Future)

- [ ] **Module Gating:** Accessing `/portal/operate` on an organization where `moduleOperate === false` instantly redirects to `/portal/dashboard` with a 403 Access Denied toast.
- [ ] **Atomic Inventory:** Two concurrent requests deducting 5 items from a stock of 10 results in exactly 0 stock, not 5.
- [ ] **Approval RBAC:** A `MANAGER` logged into Branch A cannot view or approve an `ApprovalRequest` originating from Branch B.
- [ ] **Low-Stock Detection:** Updating an inventory item so its stock drops below `minStock` immediately surfaces it in the "Needs Attention" list on the Manager dashboard.
