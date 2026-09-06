"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InventoryLogType } from "@/generated/prisma";
import { calculateNewStock } from "@/lib/inventory/calc";

export async function recordStockMutation(
  data: {
    itemId: string;
    type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";
    quantity: number;
    notes?: string;
  },
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<{ ok: boolean; error?: string; currentStock?: number }> {
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

      if (!isDirector && item.branchId !== userBranchId) {
        throw new Error("Akses cabang tidak diizinkan");
      }

      const calc = calculateNewStock(item.stock, data.type, data.quantity);
      if (!calc.valid) {
        throw new Error(calc.error || "Mutasi stok tidak valid.");
      }

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { stock: calc.newStock },
      });

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
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isDirector && data.branchId !== userBranchId) {
    return { ok: false, error: "Akses cabang tidak diizinkan" };
  }

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
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

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
