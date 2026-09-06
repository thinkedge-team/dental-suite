import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InventoryLogType } from "@/generated/prisma";

export function calculateNewStock(
  previousStock: number,
  type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED",
  quantity: number,
): { valid: boolean; newStock: number; delta: number; error?: string } {
  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return {
      valid: false,
      newStock: previousStock,
      delta: 0,
      error: "Jumlah mutasi harus bilangan bulat positif lebih dari 0.",
    };
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
    return {
      valid: false,
      newStock: previousStock,
      delta: 0,
      error: "Stok saat ini tidak mencukupi untuk pemakaian tersebut.",
    };
  }

  return { valid: true, newStock, delta };
}

export async function recordStockMutation(
  data: {
    itemId: string;
    type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";
    quantity: number;
    notes?: string;
  },
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<{ ok: boolean; error?: string; currentStock?: number }> {
  "use server";
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!data.quantity || data.quantity <= 0 || !Number.isInteger(data.quantity)) {
    return { ok: false, error: "Jumlah mutasi harus bilangan bulat positif lebih dari 0." };
  }

  try {
    const currentStock = await prisma.$transaction(async (tx) => {
      // 1. Read item inside transaction to ensure atomicity and avoid race conditions
      const item = await tx.inventoryItem.findFirst({
        where: {
          id: data.itemId,
          branch: {
            organizationId,
          },
        },
        select: {
          id: true,
          stock: true,
          branchId: true,
        },
      });

      if (!item) {
        throw new Error("Item inventaris tidak ditemukan.");
      }

      // 2. Branch scoping enforcement
      if (!isDirector && item.branchId !== userBranchId) {
        throw new Error("Akses cabang tidak diizinkan");
      }

      // 3. Pure delta and validation calculation
      const calc = calculateNewStock(item.stock, data.type, data.quantity);
      if (!calc.valid) {
        throw new Error(calc.error || "Mutasi stok tidak valid.");
      }

      // 4. Update stock atomically
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: calc.newStock },
      });

      // 5. Create audit log
      await tx.inventoryLog.create({
        data: {
          itemId: item.id,
          userId,
          type: data.type as InventoryLogType,
          quantity: calc.delta,
          previousStock: item.stock,
          currentStock: calc.newStock,
          notes: data.notes?.trim() || null,
        },
      });

      return calc.newStock;
    });

    revalidatePath("/operate/inventory");
    revalidatePath("/dashboard");

    return { ok: true, currentStock };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal mencatat mutasi stok.",
    };
  }
}

export async function createInventoryItem(
  data: {
    branchId: string;
    name: string;
    sku?: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
  },
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<{ ok: boolean; error?: string; itemId?: string }> {
  "use server";

  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  // Branch scoping check for creation
  if (!isDirector && data.branchId !== userBranchId) {
    return { ok: false, error: "Akses cabang tidak diizinkan" };
  }

  // Validate branch exists and belongs to user's organization
  const branch = await prisma.branch.findFirst({
    where: {
      id: data.branchId,
      organizationId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!branch) {
    return { ok: false, error: "Cabang tidak ditemukan atau tidak valid" };
  }

  try {
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.inventoryItem.create({
        data: {
          branchId: data.branchId,
          name: data.name.trim(),
          sku: data.sku?.trim() || null,
          category: data.category.trim() || "Umum",
          stock: Math.max(0, data.stock || 0),
          minStock: Math.max(0, data.minStock || 0),
          unit: data.unit.trim() || "pcs",
        },
      });

      // If initial stock > 0, create initial RESTOCK log
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
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan item inventaris.",
    };
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
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<{ ok: boolean; error?: string }> {
  "use server";

  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  // Check item belongs to user's organization
  const existing = await prisma.inventoryItem.findFirst({
    where: {
      id,
      branch: {
        organizationId,
      },
    },
    select: {
      id: true,
      branchId: true,
    },
  });

  if (!existing) {
    return { ok: false, error: "Item inventaris tidak ditemukan." };
  }

  // Branch scoping enforcement for non-director/non-super-admin
  if (!isDirector && existing.branchId !== userBranchId) {
    return { ok: false, error: "Akses cabang tidak diizinkan" };
  }

  try {
    await prisma.inventoryItem.update({
      where: { id },
      data: {
        name: data.name.trim(),
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
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui item inventaris.",
    };
  }
}