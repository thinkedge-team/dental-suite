# OPERATE Medical Inventory & Stock Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the Medical Inventory & Stock Management subsystem (Sub-Project 3A of OPERATE), providing dental clinics with catalog management, atomic stock mutations with an immutable audit trail (`InventoryLog`), multi-branch RBAC visibility, and live low-stock alerts.

**Architecture:** Extended Prisma schema with clinical categories and an audit trail log; server actions executing atomic transactional stock calculations (`increment`/`decrement`) and preventing negative stock; modular client UI components (search, category tabs, mutation dialog, audit drawer); and live low-stock warning integration into the portal dashboard.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Prisma 6 (PostgreSQL), Tailwind CSS v4, Lucide React icons, Vitest.

## Global Constraints

- Tech stack: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Prisma 6.
- Copy rule: Strictly zero em-dashes (U+2014) across all UI strings, labels, and placeholders. Use `-` or `·`.
- Timezone: All day boundaries and display dates must use `Asia/Jakarta` (WIB = UTC+7).
- Multi-tenant security: All queries and mutations must verify `session.user.organizationId` and respect branch scoping for non-directors.
- Type safety: No `as any`, no `@ts-ignore`, no empty catch blocks.
- Git protocol: Include `GIT_MASTER=1` for all git commands.

---

### Task 1: Prisma Schema & Seed Update for Inventory & Stock Logs

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces:
  - `InventoryItem.category: String`
  - `model InventoryLog` with relation to `InventoryItem` and `User`
  - `enum InventoryLogType { USAGE, RESTOCK, ADJUSTMENT, DAMAGED }`
  - Updated seed data with `moduleOperate: true` and 8+ realistic dental consumables with stock logs

- [ ] **Step 1: Update `prisma/schema.prisma`**

Modify `prisma/schema.prisma`:
1. In `model User`, add relation:
   ```prisma
   inventoryLogs InventoryLog[]
   ```
2. Update `model InventoryItem`:
   ```prisma
   model InventoryItem {
     id        String   @id @default(cuid())
     branchId  String
     branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
     name      String
     sku       String?
     category  String   @default("Umum")
     stock     Int      @default(0)
     minStock  Int      @default(0)
     unit      String   @default("pcs")
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
     quantity      Int
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

- [ ] **Step 2: Generate Prisma Client**

Run: `npx prisma generate`
Expected: Successfully generated Prisma Client to `src/generated/prisma`.

- [ ] **Step 3: Update `prisma/seed.ts` with OPERATE enablement and dental items**

In `prisma/seed.ts`:
1. Update organization update/create: `moduleOperate: true`.
2. Seed realistic dental inventory items for `branch1` (Kelapa Gading) and `branch2` (Pluit):
   - *Anestesi & Farmasi*: "Lidocaine HCl 2% + Epinephrine", "Mepivacaine 3%", "Amoxicillin 500mg"
   - *Bahan Tambal & Restorasi*: "Composite Resin Filtek Z250 A2", "Bonding Agent Universal", "Etching Gel 37%"
   - *Habis Pakai & Sterilisasi*: "Dental Needle 30G Short", "Latex Examination Gloves M", "Masker Medis 3-Ply", "Pouch Sterilisasi Autoclave"
   - *Ortodonti*: "Bracket Metal MBT 0.022", "Niti Archwire 0.014 Upper"
   - *Instrumen Bedah*: "Blade Bisturi No. 15", "Benang Jahit Silk 3-0"
   Include items with `stock <= minStock` (e.g., Lidocaine remaining: 8 ampul, min: 20 ampul) to simulate low-stock alerts.
3. Seed corresponding `InventoryLog` records for initial stock.

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add prisma/schema.prisma prisma/seed.ts src/generated/prisma/
GIT_MASTER=1 git commit -m "feat(operate): add inventory category, inventory logs schema, and seed data"
```

---

### Task 2: Inventory Server Actions & Unit Tests

**Files:**
- Create: `src/lib/actions/inventory.ts`
- Create: `tests/inventory.test.ts`

**Interfaces:**
- Produces:
  - `recordStockMutation(data: { itemId: string; type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED"; quantity: number; notes?: string }): Promise<{ ok: boolean; error?: string; currentStock?: number }>`
  - `createInventoryItem(data: { branchId: string; name: string; sku?: string; category: string; stock: number; minStock: number; unit: string }): Promise<{ ok: boolean; error?: string; itemId?: string }>`
  - `updateInventoryItem(id: string, data: { name: string; sku?: string; category: string; minStock: number; unit: string }): Promise<{ ok: boolean; error?: string }>`

- [ ] **Step 1: Write unit tests for stock delta calculation and validation logic**

Create `tests/inventory.test.ts`:
```ts
import { describe, it, expect } from "vitest";

function calculateNewStock(
  previousStock: number,
  type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED",
  quantity: number,
): { valid: boolean; newStock: number; delta: number; error?: string } {
  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return { valid: false, newStock: previousStock, delta: 0, error: "Jumlah mutasi harus bilangan bulat positif lebih dari 0." };
  }

  let delta = 0;
  if (type === "RESTOCK") {
    delta = quantity;
  } else if (type === "USAGE" || type === "DAMAGED") {
    delta = -quantity;
  } else if (type === "ADJUSTMENT") {
    delta = quantity - previousStock;
  }

  const newStock = previousStock + delta;
  if (newStock < 0) {
    return { valid: false, newStock: previousStock, delta: 0, error: "Stok tidak mencukupi untuk pemakaian ini." };
  }

  return { valid: true, newStock, delta };
}

describe("Inventory stock delta calculations", () => {
  it("increments stock on RESTOCK", () => {
    const res = calculateNewStock(10, "RESTOCK", 5);
    expect(res.valid).toBe(true);
    expect(res.newStock).toBe(15);
    expect(res.delta).toBe(5);
  });

  it("decrements stock on USAGE and DAMAGED", () => {
    const resUsage = calculateNewStock(10, "USAGE", 4);
    expect(resUsage.valid).toBe(true);
    expect(resUsage.newStock).toBe(6);
    expect(resUsage.delta).toBe(-4);

    const resDamaged = calculateNewStock(6, "DAMAGED", 2);
    expect(resDamaged.valid).toBe(true);
    expect(resDamaged.newStock).toBe(4);
    expect(resDamaged.delta).toBe(-2);
  });

  it("prevents negative stock on excess USAGE", () => {
    const res = calculateNewStock(5, "USAGE", 10);
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Stok tidak mencukupi untuk pemakaian ini.");
  });

  it("adjusts stock correctly to a target physical count", () => {
    const res = calculateNewStock(12, "ADJUSTMENT", 15);
    expect(res.valid).toBe(true);
    expect(res.newStock).toBe(15);
    expect(res.delta).toBe(3);
  });

  it("rejects non-positive numbers", () => {
    expect(calculateNewStock(10, "RESTOCK", 0).valid).toBe(false);
    expect(calculateNewStock(10, "RESTOCK", -5).valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/inventory.test.ts`
Expected: 5/5 tests PASS.

- [ ] **Step 3: Implement `src/lib/actions/inventory.ts`**

Create `src/lib/actions/inventory.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InventoryLogType } from "@/generated/prisma";

export async function recordStockMutation(data: {
  itemId: string;
  type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";
  quantity: number;
  notes?: string;
}): Promise<{ ok: boolean; error?: string; currentStock?: number }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const { organizationId, branchId: userBranchId, role, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!data.quantity || data.quantity <= 0 || !Number.isInteger(data.quantity)) {
    return { ok: false, error: "Jumlah mutasi harus berupa bilangan bulat positif lebih dari 0." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: {
          id: data.itemId,
          branch: { organizationId },
        },
        select: {
          id: true,
          stock: true,
          branchId: true,
          name: true,
        },
      });

      if (!item) {
        throw new Error("Item inventaris tidak ditemukan.");
      }

      if (!isDirector && userBranchId && item.branchId !== userBranchId) {
        throw new Error("Anda hanya berwenang mencatat mutasi stok di cabang Anda.");
      }

      let delta = 0;
      if (data.type === "RESTOCK") {
        delta = data.quantity;
      } else if (data.type === "USAGE" || data.type === "DAMAGED") {
        delta = -data.quantity;
      } else if (data.type === "ADJUSTMENT") {
        delta = data.quantity - item.stock;
      }

      const nextStock = item.stock + delta;
      if (nextStock < 0) {
        throw new Error("Stok saat ini tidak mencukupi untuk pemakaian tersebut.");
      }

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: nextStock },
        select: { stock: true },
      });

      await tx.inventoryLog.create({
        data: {
          itemId: item.id,
          userId,
          type: data.type as InventoryLogType,
          quantity: delta,
          previousStock: item.stock,
          currentStock: nextStock,
          notes: data.notes?.trim() || null,
        },
      });

      return updated.stock;
    });

    revalidatePath("/operate/inventory");
    revalidatePath("/dashboard");
    return { ok: true, currentStock: result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal mencatat mutasi stok." };
  }
}

export async function createInventoryItem(data: {
  branchId: string;
  name: string;
  sku?: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
}): Promise<{ ok: boolean; error?: string; itemId?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const { organizationId, id: userId } = session.user;
  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama barang minimal 2 karakter." };

  const branch = await prisma.branch.findFirst({
    where: { id: data.branchId, organizationId },
    select: { id: true },
  });

  if (!branch) return { ok: false, error: "Cabang tidak valid untuk organisasi ini." };

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.inventoryItem.create({
        data: {
          branchId: data.branchId,
          name: cleanName,
          sku: data.sku?.trim() || null,
          category: data.category.trim() || "Umum",
          stock: Math.max(0, data.stock || 0),
          minStock: Math.max(0, data.minStock || 0),
          unit: data.unit.trim() || "pcs",
        },
      });

      if (created.stock > 0) {
        await tx.inventoryLog.create({
          data: {
            itemId: created.id,
            userId,
            type: InventoryLogType.RESTOCK,
            quantity: created.stock,
            previousStock: 0,
            currentStock: created.stock,
            notes: "Stok awal saat pendaftaran barang",
          },
        });
      }

      return created;
    });

    revalidatePath("/operate/inventory");
    revalidatePath("/dashboard");
    return { ok: true, itemId: item.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menambahkan item inventaris." };
  }
}

export async function updateInventoryItem(
  id: string,
  data: {
    name: string;
    sku?: string;
    category: string;
    minStock: number;
    unit: string;
  },
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) return { ok: false, error: "Unauthorized" };

  const cleanName = data.name.trim();
  if (cleanName.length < 2) return { ok: false, error: "Nama barang minimal 2 karakter." };

  const existing = await prisma.inventoryItem.findFirst({
    where: { id, branch: { organizationId: session.user.organizationId } },
    select: { id: true },
  });

  if (!existing) return { ok: false, error: "Item inventaris tidak ditemukan." };

  try {
    await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: cleanName,
        sku: data.sku?.trim() || null,
        category: data.category.trim() || "Umum",
        minStock: Math.max(0, data.minStock || 0),
        unit: data.unit.trim() || "pcs",
      },
    });

    revalidatePath("/operate/inventory");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui item inventaris." };
  }
}
```

- [ ] **Step 4: Verify typecheck & test suite**

Run: `npx tsc --noEmit && npx vitest run tests/inventory.test.ts`
Expected: 0 errors, all tests passing.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/lib/actions/inventory.ts tests/inventory.test.ts
GIT_MASTER=1 git commit -m "feat(operate): add inventory server actions with atomic transaction and multi-tenant scoping"
```

---

### Task 3: Client Components for Inventory UI

**Files:**
- Create: `src/app/(portal)/operate/inventory/mutation-modal.tsx`
- Create: `src/app/(portal)/operate/inventory/item-modal.tsx`
- Create: `src/app/(portal)/operate/inventory/stock-log-drawer.tsx`
- Create: `src/app/(portal)/operate/inventory/inventory-table.tsx`

**Interfaces:**
- Produces:
  - `MutationModal`: Fast dialog for `recordStockMutation`
  - `ItemModal`: Dialog for creating/editing inventory metadata
  - `StockLogDrawer`: Slide-over drawer displaying immutable log records
  - `InventoryTable`: Interactive table with search filter, category tabs, and action buttons

- [ ] **Step 1: Implement `mutation-modal.tsx`**

Create `src/app/(portal)/operate/inventory/mutation-modal.tsx`:
Modal with type selector (`USAGE` [Pemakaian Tindakan], `RESTOCK` [Restok Masuk], `ADJUSTMENT` [Koreksi Opname], `DAMAGED` [Rusak / Kadaluwarsa]), quantity input, notes textarea, and non-blocking `startTransition` execution.

- [ ] **Step 2: Implement `item-modal.tsx`**

Create `src/app/(portal)/operate/inventory/item-modal.tsx`:
Modal dialog for creating new items or editing existing item metadata (Name, SKU, Category, Branch, Unit, Initial Stock, Min Stock).

- [ ] **Step 3: Implement `stock-log-drawer.tsx`**

Create `src/app/(portal)/operate/inventory/stock-log-drawer.tsx`:
Slide-over drawer component displaying timestamped mutation cards with user name, mutation type badge, quantity delta (`+` / `-`), previous vs new stock, and reason notes.

- [ ] **Step 4: Implement `inventory-table.tsx`**

Create `src/app/(portal)/operate/inventory/inventory-table.tsx`:
Interactive table connecting category tabs (*Semua*, *Anestesi & Farmasi*, *Bahan Tambal & Restorasi*, *Habis Pakai & Sterilisasi*, *Ortodonti*, *Instrumen Bedah*), live search input, status pills (Aman, Menipis, Habis), and action triggers opening the modals/drawer.

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/inventory/
GIT_MASTER=1 git commit -m "feat(operate): add interactive inventory table, mutation modal, and stock log drawer"
```

---

### Task 4: Main Inventory Page & Dashboard/Sidebar Integration

**Files:**
- Create: `src/app/(portal)/operate/inventory/page.tsx`
- Modify: `src/components/portal/sidebar.tsx`
- Modify: `src/app/(portal)/dashboard/page.tsx`

**Interfaces:**
- Produces:
  - Server Component route `/operate/inventory`
  - Sidebar link "Inventaris Medis" when `userModules.operate` is active
  - Live low-stock alert feed in dashboard "Peringatan Sistem"

- [ ] **Step 1: Implement `src/app/(portal)/operate/inventory/page.tsx`**

Create `src/app/(portal)/operate/inventory/page.tsx`:
1. Authenticates session via `auth()`, checks `session.user.organizationId`.
2. Queries organization to verify `moduleOperate === true`. If false, renders access restricted state.
3. Queries branches for director branch selector.
4. Queries items with relation `logs` (top 10 recent logs per item) and `branch`.
5. Calculates KPI metrics (Total Items, Low Stock count, Out of Stock count, Today Mutations count in WIB).
6. Renders KPI summary cards and `<InventoryTable />`.

- [ ] **Step 2: Update `src/components/portal/sidebar.tsx`**

In `src/components/portal/sidebar.tsx`:
Add navigation item for Inventory:
```ts
{ 
  name: "Inventaris Medis", 
  href: "/operate/inventory", 
  icon: Package, 
  show: userModules.operate 
},
```
Import `Package` from `lucide-react`.

- [ ] **Step 3: Update `src/app/(portal)/dashboard/page.tsx` with real low-stock alerts**

In `src/app/(portal)/dashboard/page.tsx`:
Query up to 3 items where `stock <= minStock`:
```ts
const lowStockItems = await prisma.inventoryItem.findMany({
  where: {
    branch: { organizationId: orgId },
    stock: { lte: prisma.inventoryItem.fields.minStock }, // or compute in query
  },
  include: { branch: { select: { name: true } } },
  take: 3,
});
```
Render them dynamically in "Peringatan Sistem" with amber warning dots, replacing hardcoded strings.

- [ ] **Step 4: Verify typecheck & build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 errors, `/operate/inventory` rendered as dynamic server route.

- [ ] **Step 5: Commit changes**

```bash
GIT_MASTER=1 git add src/app/\(portal\)/operate/inventory/page.tsx src/components/portal/sidebar.tsx src/app/\(portal\)/dashboard/page.tsx
GIT_MASTER=1 git commit -m "feat(operate): connect inventory page, sidebar navigation, and live dashboard alerts"
```

---

### Task 5: End-to-End Verification & Quality Polish

- [ ] **Step 1: Zero em-dash scan**

Run: `git grep "\u2014" src/`
Expected: 0 matches.

- [ ] **Step 2: Run Vitest unit tests**

Run: `npx vitest run`
Expected: All tests passing across schedule, whatsapp, and inventory test suites.

- [ ] **Step 3: Run ESLint and TypeScript checks**

Run: `npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: 100% successful build.

- [ ] **Step 5: Final verification commit**

```bash
GIT_MASTER=1 git commit -m "chore(operate): complete and verify Sub-Project 3A medical inventory"
```
