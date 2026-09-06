# Design Specification: OPERATE Module - Two-Tier Approval Workflows

**Date**: 2026-09-06  
**Status**: Approved  
**Module**: OPERATE (Sub-Project 3C: Two-Tier Approval Workflows)

---

## 1. Overview & Goals

Dental clinic operations involve recurring internal requests (procurement of depleted medicines/consumables, equipment repairs, facility maintenance). In multi-branch networks, informal requests over WhatsApp cause lost records, unauthorized expenses, and unfulfilled stock orders.

This specification covers Sub-Project 3C of the OPERATE module:
1. **Internal Clinic Request System (`/operate/approvals`)**: Structured submissions for `PROCUREMENT` (linked to inventory catalog), `MAINTENANCE` (dental chair/autoclave repair), and `OTHER` (operational needs).
2. **Two-Tier Approval Hierarchy**: Branch Manager review for branch-level requests (Tier 1) and Director organization-wide review and override (Tier 2).
3. **One-Click Stock Fulfillment**: Approved procurement requests can be received directly into inventory with automatic `RESTOCK` mutation logging.
4. **Seamless Inventory Integration**: Quick-action "Ajukan Pengadaan" button on low-stock items in `/operate/inventory` pre-filling the procurement request.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   └── (portal)/
│       └── operate/
│           ├── approvals/
│           │   ├── page.tsx                    # Server Component: Approval dashboard with KPI cards & filters
│           │   ├── approval-table.tsx          # Interactive client table with search, status tabs, drawer triggers
│           │   ├── approval-request-modal.tsx  # Multi-tab request form (Procurement, Maintenance, Other)
│           │   └── approval-detail-drawer.tsx  # Review slide-over with approve/reject actions & stock fulfillment
│           │
│           └── inventory/
│               └── inventory-table.tsx         # Updated: Quick-action button triggering procurement request modal
│
├── lib/
│   └── actions/
│       └── approvals.ts                        # Server actions: submitApprovalRequest, reviewApprovalRequest, fulfillProcurementToStock
│
├── components/
│   └── portal/
│       └── sidebar.tsx                         # Updated: Added "Persetujuan & Request" navigation item
│
└── prisma/
    └── seed.ts                                 # Seeded sample approval requests (pending procurement, maintenance)
```

---

## 3. Detailed Technical Specifications

### 3.1 Data Model Integration (`prisma/schema.prisma`)

Existing `ApprovalRequest` model utilized directly without breaking migrations:
```prisma
model ApprovalRequest {
  id             String         @id @default(cuid())
  organizationId String
  branchId       String
  branch         Branch         @relation(fields: [branchId], references: [id], onDelete: Cascade)
  requestedById  String
  requestedBy    User           @relation(fields: [requestedById], references: [id])
  type           ApprovalType   // PROCUREMENT, MAINTENANCE, OTHER
  payload        Json
  status         ApprovalStatus @default(PENDING) // PENDING, APPROVED, REJECTED
  reviewNote     String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([organizationId, status])
  @@index([branchId, status])
}

enum ApprovalType {
  PROCUREMENT
  MAINTENANCE
  OTHER
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Typed Payload Shapes
```ts
export interface ProcurementPayload {
  title: string;
  itemId?: string;
  itemName: string;
  category?: string;
  currentStock?: number;
  minStock?: number;
  unit: string;
  quantity: number;
  estimatedCost?: number;
  urgency: "NORMAL" | "URGENT";
  notes?: string;
  fulfilledAt?: string; // ISO date when received into stock
}

export interface MaintenancePayload {
  title: string;
  equipmentName: string;
  urgency: "NORMAL" | "URGENT";
  estimatedCost?: number;
  description: string;
}

export interface OtherPayload {
  title: string;
  estimatedCost?: number;
  description: string;
}
```

---

### 3.2 Server Actions (`src/lib/actions/approvals.ts`)

#### 1. `submitApprovalRequest`
- **Signature**:
  ```ts
  export async function submitApprovalRequest(data: {
    branchId: string;
    type: "PROCUREMENT" | "MAINTENANCE" | "OTHER";
    payload: ProcurementPayload | MaintenancePayload | OtherPayload;
  }): Promise<{ ok: boolean; error?: string; requestId?: string }>
  ```
- **Access & Scoping**:
  - Requires authenticated session with `session.user.organizationId`.
  - Non-directors are strictly locked to `session.user.branchId`.
  - Verifies target branch belongs to `session.user.organizationId`.
  - Creates `ApprovalRequest` with status `PENDING`.
  - Revalidates `/operate/approvals` and `/dashboard`.

#### 2. `reviewApprovalRequest`
- **Signature**:
  ```ts
  export async function reviewApprovalRequest(data: {
    requestId: string;
    status: "APPROVED" | "REJECTED";
    reviewNote?: string;
  }): Promise<{ ok: boolean; error?: string }>
  ```
- **Access & RBAC Enforcement**:
  - `MANAGER`: Can only review requests where `branchId === session.user.branchId`.
  - `DIRECTOR` / `SUPER_ADMIN`: Can review requests across all branches of their organization.
  - `STAFF` / `DOCTOR`: Blocked with `Unauthorized`.
  - Verifies request belongs to `session.user.organizationId`.
  - Updates status and `reviewNote`.
  - Revalidates `/operate/approvals`.

#### 3. `fulfillProcurementToStock`
- **Signature**:
  ```ts
  export async function fulfillProcurementToStock(data: {
    requestId: string;
  }): Promise<{ ok: boolean; error?: string }>
  ```
- **Logic**:
  - Verifies request is `APPROVED` and `type === "PROCUREMENT"`.
  - Verifies item exists in inventory and belongs to the request's branch.
  - Runs in `prisma.$transaction`:
    1. Updates `InventoryItem.stock` via `increment: payload.quantity`.
    2. Inserts `InventoryLog` (`type: RESTOCK`, notes: `Pengadaan disetujui: ${payload.title}`).
    3. Updates request payload with `fulfilledAt: new Date().toISOString()`.
  - Revalidates `/operate/approvals`, `/operate/inventory`, and `/dashboard`.

---

### 3.3 User Interface Specifications

#### 1. Approvals Page (`/operate/approvals`)
- **Metric Cards (KPI Bar)**:
  - *Menunggu Review*: Count of `PENDING` requests in selected branch filter.
  - *Disetujui Bulan Ini*: Count of `APPROVED` requests created this month (WIB).
  - *Ditolak Bulan Ini*: Count of `REJECTED` requests created this month.
  - *Total Pengajuan*: All-time count.
- **Filters**:
  - Branch Switcher (Director) / Branch Pill (Staff).
  - Status Tabs: *Semua*, *Menunggu*, *Disetujui*, *Ditolak*.
  - Type Tabs: *Semua Tipe*, *Pengadaan*, *Pemeliharaan*, *Lainnya*.
  - Live search input (title & applicant name).
- **Interactive Table**:
  - Columns: Judul Permohonan, Pemohon & Cabang, Tipe, Urgensi (*Mendesak* badge merah / *Normal* badge slate), Estimasi Biaya (Rupiah), Status, Aksi (Detail).

#### 2. Request Modal (`approval-request-modal.tsx`)
- Type selector: `Pengadaan Barang`, `Pemeliharaan Alat`, `Lainnya`.
- In `Pengadaan`: Item dropdown preloaded from active branch inventory (or custom item name), quantity, estimated cost, urgency, notes.

#### 3. Review Drawer (`approval-detail-drawer.tsx`)
- Slide-over showing complete request details:
  - Applicant avatar, date in WIB, branch name, urgency badge.
  - Formatted payload details (Item name, requested quantity, current stock at request time, cost).
  - Review section:
    - If user is Manager/Director and request is `PENDING`: Textarea for review notes, Green "Setujui Permohonan", Red "Tolak Permohonan".
    - If request is `APPROVED` and `PROCUREMENT` with unfulfilled stock: Blue button "Terima Barang ke Inventaris" (triggers `fulfillProcurementToStock`).
    - If resolved: Displays review note, reviewer name, and decision timestamp.

#### 4. Quick Action from Inventory Table
- On `/operate/inventory`, items with `stock <= minStock` or zero stock feature an amber/primary quick action icon: **"Pengadaan"**.
- Clicking it opens `ApprovalRequestModal` with branch, item name, SKU, current stock, and unit prefilled.

#### 5. Navigation Integration
- Sidebar item: **"Persetujuan & Request"** (`/operate/approvals`, icon `CheckSquare`) under `userModules.operate`.

---

## 4. Constraint & Brand Token Compliance

- **Typography & Copy**: Strictly zero em-dashes (U+2014). Use `-` or `·`. Terminology in Indonesian (*Pengadaan Barang*, *Pemeliharaan Alat*, *Menunggu Review*, *Disetujui*, *Ditolak*, *Mendesak*).
- **Styling**: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All dates and timestamps formatted in `Asia/Jakarta` (WIB = UTC+7).
- **Type Safety**: TypeScript strict mode, clean typed payloads, zero `as any` or `@ts-ignore`.

---

## 5. Verification Plan

1. **Unit & Logic Tests (`tests/approvals.test.ts`)**:
   - Test payload validation and cost calculations.
   - Test branch scoping logic for manager vs director.
2. **End-to-End Build & Lint**:
   - `npx vitest run` -> 100% pass.
   - `npx eslint "src/**/*.{ts,tsx}"` -> 0 errors.
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run build` -> clean build.
