# OPERATE Two-Tier Approval Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the Two-Tier Approval Workflows subsystem (Sub-Project 3C of OPERATE), enabling clinic staff to submit procurement, maintenance, and operational requests, providing branch managers (Tier 1) and directors (Tier 2) with review tools, and offering direct inventory restock fulfillment.

**Architecture:** Typed payload interfaces on `ApprovalRequest.payload` JSON; server actions enforcing two-tier RBAC (`MANAGER` branch-scoped, `DIRECTOR` org-scoped); interactive review drawer with approve/reject and restock fulfillment; quick-action "Ajukan Pengadaan" button in the inventory catalog; and sidebar navigation integration.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Prisma 6.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All day boundaries and display dates must use `Asia/Jakarta` (WIB = UTC+7).
- Multi-tenant security: All queries and mutations must verify `session.user.organizationId`. Non-directors are strictly locked to their assigned `branchId`.
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Payload Types, Seed Data, and Server Actions

**Files:**
- Create: `src/lib/approvals/types.ts`
- Create: `src/lib/actions/approvals.ts`
- Create: `tests/approvals.test.ts`
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces:
  - `ProcurementPayload`, `MaintenancePayload`, `OtherPayload`, `ApprovalPayload`
  - `submitApprovalRequest(data: { branchId: string; type: "PROCUREMENT" | "MAINTENANCE" | "OTHER"; payload: ApprovalPayload }): Promise<{ ok: boolean; error?: string; requestId?: string }>`
  - `reviewApprovalRequest(data: { requestId: string; status: "APPROVED" | "REJECTED"; reviewNote?: string }): Promise<{ ok: boolean; error?: string }>`
  - `fulfillProcurementToStock(data: { requestId: string }): Promise<{ ok: boolean; error?: string }>`
  - Seeded sample approval requests in `prisma/seed.ts`

- [ ] **Step 1: Create `src/lib/approvals/types.ts`**

Define typed shapes:
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
  fulfilledAt?: string;
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

export type ApprovalPayload = ProcurementPayload | MaintenancePayload | OtherPayload;

export function isProcurementPayload(p: unknown): p is ProcurementPayload {
  return typeof p === "object" && p !== null && "itemName" in p && "quantity" in p;
}
```

- [ ] **Step 2: Write unit tests in `tests/approvals.test.ts`**

Unit tests verifying payload validation and permissions logic:
- Procurement payload validation (quantity > 0, required title & itemName).
- Maintenance payload validation (title & description).
- Manager vs Director review permission checks.

- [ ] **Step 3: Implement `src/lib/actions/approvals.ts`**

Implement `submitApprovalRequest`, `reviewApprovalRequest`, and `fulfillProcurementToStock`:
- `submitApprovalRequest`:
  - Checks `session.user.organizationId`.
  - Non-directors must submit for their `session.user.branchId`.
  - Validates branch belongs to organization.
  - Creates `prisma.approvalRequest` with status `PENDING`.
  - Revalidates `/operate/approvals` and `/dashboard`.
- `reviewApprovalRequest`:
  - Validates role: `MANAGER` can only review requests where `branchId === session.user.branchId`; `DIRECTOR` and `SUPER_ADMIN` can review all.
  - Updates `status` and `reviewNote`.
  - Revalidates `/operate/approvals`.
- `fulfillProcurementToStock`:
  - Checks request is `APPROVED` and `type === "PROCUREMENT"`.
  - In `prisma.$transaction`:
    1. Updates `InventoryItem.stock` with `increment: payload.quantity`.
    2. Writes `InventoryLog` (`type: RESTOCK`).
    3. Updates payload with `fulfilledAt: new Date().toISOString()`.
  - Revalidates `/operate/approvals`, `/operate/inventory`, and `/dashboard`.

- [ ] **Step 4: Update `prisma/seed.ts`**

Seed sample `ApprovalRequest` records:
- 1 `PENDING` `PROCUREMENT` request for Lidocaine HCl (30 ampul, estimated cost Rp 450.000, URGENT) requested by staff at Kelapa Gading.
- 1 `APPROVED` `MAINTENANCE` request for Dental Unit 2 suction hose repair at Kelapa Gading.

- [ ] **Step 5: Verify tests and typecheck**

Run: `npx vitest run tests/approvals.test.ts && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/approvals/ src/lib/actions/approvals.ts tests/approvals.test.ts prisma/seed.ts
GIT_MASTER=1 git commit -m "feat(operate): add approval types, server actions with two-tier RBAC, and seed data"
```

---

### Task 2: Client Interactive Components for Approvals

**Files:**
- Create: `src/app/(portal)/operate/approvals/approval-request-modal.tsx`
- Create: `src/app/(portal)/operate/approvals/approval-detail-drawer.tsx`
- Create: `src/app/(portal)/operate/approvals/approval-table.tsx`
- Modify: `src/app/(portal)/operate/inventory/inventory-table.tsx`

**Interfaces:**
- Produces:
  - `ApprovalRequestModal`: Multi-tab submission dialog (Procurement with inventory picker, Maintenance, Other)
  - `ApprovalDetailDrawer`: Slide-over with complete details, Manager/Director review actions, and stock fulfillment button
  - `ApprovalTable`: Interactive table with status & type tabs, search filter, urgency pills, and drawer triggers
  - Quick action "Pengadaan" in `InventoryTable` pre-filling procurement modal

- [ ] **Step 1: Implement `approval-request-modal.tsx`**

Create `src/app/(portal)/operate/approvals/approval-request-modal.tsx`:
- Tabs: "Pengadaan Barang", "Pemeliharaan Alat", "Lainnya".
- Procurement tab: Branch inventory dropdown (or custom item name), quantity, estimated cost, urgency switch (Normal / Mendesak), notes.
- Maintenance tab: Equipment name, urgency, estimated cost, description.
- Other tab: Title, estimated cost, description.
- Accessible Escape key & click-outside listeners.
- Submits via `submitApprovalRequest` inside `startTransition`.

- [ ] **Step 2: Implement `approval-detail-drawer.tsx`**

Create `src/app/(portal)/operate/approvals/approval-detail-drawer.tsx`:
- Header with request title, applicant name, role, branch, and status badge.
- Formatted payload summary (item details, quantity, cost in Rupiah, urgency, description).
- Actions:
  - If `PENDING` and user is Manager/Director: review notes input, Green "Setujui Permohonan", Red "Tolak Permohonan" calling `reviewApprovalRequest`.
  - If `APPROVED` and `PROCUREMENT` with unfulfilled stock: Blue button "Terima Barang ke Inventaris" calling `fulfillProcurementToStock`.
  - If resolved: Displays decision note and reviewer info.
- Accessible backdrop and Escape dismissal.

- [ ] **Step 3: Implement `approval-table.tsx`**

Create `src/app/(portal)/operate/approvals/approval-table.tsx`:
- Status filter tabs (*Semua*, *Menunggu*, *Disetujui*, *Ditolak*).
- Type filter tabs (*Semua Tipe*, *Pengadaan*, *Pemeliharaan*, *Lainnya*).
- Live search input (title & applicant).
- Columns: Judul & Tanggal, Pemohon & Cabang, Jenis, Urgensi (*Mendesak* badge merah), Estimasi Biaya, Status Badge, Aksi (Detail).
- Integrates `ApprovalRequestModal` and `ApprovalDetailDrawer`.

- [ ] **Step 4: Update `src/app/(portal)/operate/inventory/inventory-table.tsx`**

Add quick action button **"Pengadaan"** (Icon: `ShoppingCart` or `FilePlus`) on inventory table rows. When clicked on a low-stock or depleted item, opens `ApprovalRequestModal` with pre-filled item name, SKU, unit, and branch.

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/approvals/ src/app/\(portal\)/operate/inventory/inventory-table.tsx
GIT_MASTER=1 git commit -m "feat(operate): add approval table, request modal, review drawer, and inventory quick procurement"
```

---

### Task 3: Main Approvals Page & Sidebar Integration

**Files:**
- Create: `src/app/(portal)/operate/approvals/page.tsx`
- Modify: `src/components/portal/sidebar.tsx`

**Interfaces:**
- Produces:
  - Route `/operate/approvals` (Server Component)
  - Sidebar link "Persetujuan & Request" under `userModules.operate`

- [ ] **Step 1: Implement `src/app/(portal)/operate/approvals/page.tsx`**

Server Component:
1. Authenticates session, verifies `session.user.organizationId` and `moduleOperate === true`.
2. Awaits `searchParams: Promise<{ branch?: string }>`.
3. Resolves branch scoping: `DIRECTOR` / `SUPER_ADMIN` can switch branches; other roles locked to `session.user.branchId`.
4. Queries branches for selector.
5. Queries active inventory items for the branch (to pass as options for procurement).
6. Queries `ApprovalRequest` records with `requestedBy: { select: { id: true, name: true, role: true } }` and `branch: { select: { id: true, name: true } }`.
7. Computes KPI metrics:
   - Menunggu Review (count `status: PENDING`)
   - Disetujui Bulan Ini (count `status: APPROVED` created this month in WIB)
   - Ditolak Bulan Ini (count `status: REJECTED` created this month in WIB)
   - Total Pengajuan (count all)
8. Renders KPI cards and `<ApprovalTable />`.

- [ ] **Step 2: Update `src/components/portal/sidebar.tsx`**

Add navigation item:
```ts
{ 
  name: "Persetujuan & Request", 
  href: "/operate/approvals", 
  icon: CheckSquare, 
  show: userModules.operate 
},
```
Import `CheckSquare` from `lucide-react`.

- [ ] **Step 3: Verify typecheck & production build**

Run: `npx tsc --noEmit && npm run build`
Expected: Clean build, `/operate/approvals` rendered as dynamic route.

- [ ] **Step 4: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/approvals/page.tsx src/components/portal/sidebar.tsx
GIT_MASTER=1 git commit -m "feat(operate): connect approvals page and sidebar navigation"
```

---

### Task 4: End-to-End Verification & Quality Polish

- [ ] **Step 1: Zero em-dash scan**

Run: `git grep "\u2014" src/`
Expected: 0 matches.

- [ ] **Step 2: Run all Vitest unit tests**

Run: `npx vitest run`
Expected: All tests pass across approvals, shifts, attendance, inventory, schedule, and whatsapp suites.

- [ ] **Step 3: Run ESLint and TypeScript checks**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: 100% successful build.

- [ ] **Step 5: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(operate): complete and verify Sub-Project 3C approval workflows"
```
