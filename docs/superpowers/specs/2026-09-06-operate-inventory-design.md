# Design Specification: OPERATE Module - Medical Inventory & Stock Management

**Date**: 2026-09-06  
**Status**: Approved  
**Module**: OPERATE (Sub-Project 3A: Medical Inventory & Stock Management)

---

## 1. Overview & Goals

Medical inventory management is vital for multi-branch dental clinics to prevent procedural delays, track high-value dental consumables (anesthetics, composite resins, orthodontic brackets, sterilization supplies), and eliminate manual spreadsheet discrepancies.

This specification covers Sub-Project 3A of the OPERATE module:
1. **Clinical Inventory Catalog**: Structured dental items categorized by clinical domain, SKU, stock quantity, minimum threshold (`minStock`), and unit.
2. **Atomic Stock Mutation & Audit Trail**: Transactional stock adjustments (`USAGE`, `RESTOCK`, `ADJUSTMENT`, `DAMAGED`) with complete user attribution and reason logging in `InventoryLog`.
3. **Multi-Branch RBAC & Visibility**: Branch-scoped access for staff and managers with organization-wide consolidation and switching for clinic directors.
4. **Live Low-Stock Detection & Alerts**: Visual warning badges in the inventory table and live alerts piped into the main portal dashboard.

---

## 2. Architecture & File Structure

```
src/
├── app/
│   ├── (portal)/
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Updated to query real low-stock inventory alerts
│   │   └── operate/
│   │       └── inventory/
│   │           ├── page.tsx                # Inventory catalog server component with KPI cards & filters
│   │           ├── inventory-table.tsx     # Interactive client table with search, category tabs, actions
│   │           ├── item-modal.tsx          # Create/edit inventory item modal dialog
│   │           ├── mutation-modal.tsx      # Fast stock deduction/addition modal
│   │           └── stock-log-drawer.tsx    # Slide-over drawer showing immutable InventoryLog history
│
├── lib/
│   └── actions/
│       └── inventory.ts                    # Server actions: recordStockMutation, createInventoryItem, updateInventoryItem
│
├── components/
│   └── portal/
│       └── sidebar.tsx                     # Updated to expose "Inventaris Medis" when moduleOperate is active
│
└── prisma/
    ├── schema.prisma                       # Updated with category and InventoryLog model
    └── seed.ts                             # Seeded with realistic dental consumables and sample stock logs
```

---

## 3. Detailed Technical Specifications

### 3.1 Data Model (`prisma/schema.prisma`)

```prisma
model InventoryItem {
  id        String   @id @default(cuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  name      String
  sku       String?
  category  String   @default("Umum") // "Anestesi & Farmasi", "Bahan Tambal & Restorasi", "Habis Pakai & Sterilisasi", "Ortodonti", "Instrumen Bedah"
  stock     Int      @default(0)
  minStock  Int      @default(0)
  unit      String   @default("pcs") // "ampul", "vial", "box", "tube", "set", "pcs"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  logs      InventoryLog[]

  @@index([branchId, stock])
  @@index([branchId, category])
}

model InventoryLog {
  id            String           @id @default(cuid())
  itemId        String
  item          InventoryItem    @relation(fields: [itemId], references: [id], onDelete: Cascade)
  userId        String
  user          User             @relation(fields: [userId], references: [id])
  type          InventoryLogType
  quantity      Int              // Positive for addition, negative for deduction
  previousStock Int
  currentStock  Int
  notes         String?
  createdAt     DateTime         @default(now())

  @@index([itemId, createdAt])
  @@index([userId])
}

enum InventoryLogType {
  USAGE
  RESTOCK
  ADJUSTMENT
  DAMAGED
}
```

---

### 3.2 Server Actions (`src/lib/actions/inventory.ts`)

#### 1. `recordStockMutation`
- **Signature**:
  ```ts
  export async function recordStockMutation(data: {
    itemId: string;
    type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";
    quantity: number; // Positive number representing magnitude
    notes?: string;
  }): Promise<{ ok: boolean; error?: string; currentStock?: number }>
  ```
- **Validation & Multi-Tenant Scoping**:
  - Requires authenticated session with `session.user.organizationId`.
  - Queries `InventoryItem` joining `branch`. Confirms `branch.organizationId === session.user.organizationId`.
  - Role-based Branch Constraint: If `session.user.role` is `STAFF`, `MANAGER`, or `DOCTOR`, verifies `item.branchId === session.user.branchId`.
  - Magnitude validation: `quantity` must be a positive integer `> 0`.
- **Atomic Transaction (`prisma.$transaction`)**:
  - Computes `delta`:
    - `RESTOCK` -> `+quantity`
    - `USAGE`, `DAMAGED` -> `-quantity`
    - `ADJUSTMENT` -> `quantity - previousStock`
  - Validates `currentStock = previousStock + delta >= 0`. Prevents negative physical inventory.
  - Updates `InventoryItem.stock`.
  - Creates `InventoryLog` record linking `userId: session.user.id`.
- **Revalidation**: Revalidates `/operate/inventory` and `/dashboard`.

#### 2. `createInventoryItem`
- **Signature**:
  ```ts
  export async function createInventoryItem(data: {
    branchId: string;
    name: string;
    sku?: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
  }): Promise<{ ok: boolean; error?: string; itemId?: string }>
  ```
- Verifies branch belongs to `session.user.organizationId`.
- Inserts item; if initial `stock > 0`, writes an initial `RESTOCK` log entry.

#### 3. `updateInventoryItem`
- **Signature**:
  ```ts
  export async function updateInventoryItem(
    id: string,
    data: {
      name: string;
      sku?: string;
      category: string;
      minStock: number;
      unit: string;
    },
  ): Promise<{ ok: boolean; error?: string }>
  ```
- Updates metadata without altering `stock` directly (stock changes must go through `recordStockMutation` for audit compliance).

---

### 3.3 UI Specifications (`/operate/inventory`)

#### 1. Metrics Bar
- 4 dynamic summary cards:
  - **Total Item**: Total active items in current branch filter.
  - **Stok Menipis**: Items where `stock > 0` and `stock <= minStock` (Amber status).
  - **Stok Habis**: Items where `stock === 0` (Red alert status).
  - **Mutasi Hari Ini**: Count of `InventoryLog` records created today (WIB).

#### 2. Category & Branch Filters
- Branch Selector: Dropdown for `DIRECTOR` and `SUPER_ADMIN`. Fixed badge for branch-specific staff.
- Clinical Category Tabs:
  - *Semua*
  - *Anestesi & Farmasi*
  - *Bahan Tambal & Restorasi*
  - *Habis Pakai & Sterilisasi*
  - *Ortodonti*
  - *Instrumen Bedah*
- Real-time client search filtering by item name and SKU.

#### 3. Table Rows & Status Indicators
- Status visual pill:
  - Red (`Habis`): `stock === 0`
  - Amber (`Menipis`): `stock <= minStock`
  - Emerald (`Aman`): `stock > minStock`
- Action buttons:
  - **Catat Mutasi** (Icon: ArrowUpDown): Opens modal with type, quantity, and notes.
  - **Riwayat** (Icon: History): Opens sliding drawer with timestamped list of mutations, user name, and notes.
  - **Edit** (Icon: Pencil): Opens item metadata editor.

#### 4. Dashboard Integration
- The "Peringatan Sistem" card on `/dashboard` now queries:
  ```ts
  prisma.inventoryItem.findMany({
    where: {
      branch: { organizationId: orgId },
      stock: { lte: prisma.raw("minStock") } // or stock <= minStock
    },
    include: { branch: { select: { name: true } } },
    take: 3,
  })
  ```
- Replaces hardcoded strings with actual low-stock item names and quantities.

---

## 4. Constraint & Brand Token Compliance

- **Typography & Copy**: Strictly zero em-dashes (U+2014). Use `-` or `·`. All terminology in professional Indonesian (*Bahan Medis*, *Pemakaian Tindakan*, *Restok Masuk*, *Penyesuaian Opname*).
- **Styling**: Primary Orange (`#f38218`), Paper (`#f7f5f0`), Ink (`#161817`), Line (`rgba(22,24,23,0.12)`).
- **Timezone**: All log timestamps rendered in WIB (`Asia/Jakarta`).

---

## 5. Verification Plan

1. **Prisma & Migration**:
   - Apply schema change and verify `InventoryItem.category` and `InventoryLog` table creation.
2. **Concurrency & Atomicity**:
   - Verify that simultaneous stock deductions cannot drive stock below 0.
3. **Multi-Tenant Isolation**:
   - Ensure a staff member from Branch A cannot view or mutate inventory belonging to Branch B or Organization B.
4. **End-to-End Flow**:
   - Add new item -> record usage -> check log history drawer -> verify low-stock warning appears on `/dashboard`.
   - Run linter, typecheck, and full build.
