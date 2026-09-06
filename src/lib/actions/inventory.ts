"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InventoryLogType } from "@/generated/prisma";

export async function recordStockMutation(
  data: {
    itemId: string;
    type: "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";
    quantity: number;
    notes?: string;
  },
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string; id: string } } },
): Promise<{ ok: boolean; error?: string; currentStock?: number }> {
  const session = ctx?.session ?? await auth();
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const organizationId = session.user.organizationId;

  const item = await prisma.inventoryItem.findFirst({
    where: {
      id: data.itemId,
      branch: {
        organizationId,
      },
    },
    include: {
      branch: true,
    },
  });

  if (!item) {
    return { ok: false, error: "Inventory item not found or not accessible" };
  }

  // Branch scoping: non-director/non-super-admin must be restricted to their branch
  if (
    session.user.role !== "DIRECTOR" &&
    session.user.role !== "SUPER_ADMIN" &&
    item.branchId !== session.user.branchId
  ) {
    return { ok: false, error: "Akses cabang tidak diizinkan" };
  }

  // Validate quantity > 0 and integer
  if (!Number.isInteger(data.quantity) || data.quantity <= 0) {
    return { ok: false, error: "Jumlah harus lebih besar dari 0" };
  }

  const previousStock = item.stock;

  let delta: number;
  switch (data.type) {
    case "RESTOCK":
      delta = data.quantity;
      break;
    case "USAGE":
    case "DAMAGED":
      delta = -data.quantity;
      break;
    case "ADJUSTMENT":
      delta = data.quantity - previousStock;
      break;
    default:
      return { ok: false, error: "Tipe mutasi tidak valid" };
  }

  const nextStock = previousStock + delta;

  if (nextStock < 0) {
    return {
      ok: false,
      error: "Stok saat ini tidak mencukupi untuk pemakaian tersebut.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id: item.id },
      data: { stock: nextStock },
    });

    await tx.inventoryLog.create({
      data: {
        itemId: item.id,
        userId: session.user.id,
        type: data.type as InventoryLogType,
        quantity: delta,
        previousStock,
        currentStock: nextStock,
        notes: data.notes?.trim() || null,
      },
    });
  });

  revalidatePath("/operate/inventory");
  revalidatePath("/dashboard");

  return { ok: true, currentStock: nextStock };
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
  ctx?: { session: { user: { organizationId: string; role: string; id: string } } },
): Promise<{ ok: boolean; error?: string; itemId?: string }> {
  const session = ctx?.session ?? await auth();
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const organizationId = session.user.organizationId;

  // Validate branch exists and belongs to user's organization
  const branch = await prisma.branch.findFirst({
    where: {
      id: data.branchId,
      organizationId,
      isActive: true,
    },
  });

  if (!branch) {
    return { ok: false, error: "Cabang tidak ditemukan atau tidak valid" };
  }

  await prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.create({
      data: {
        branchId: data.branchId,
        name: data.name,
        sku: data.sku,
        category: data.category,
        stock: data.stock,
        minStock: data.minStock,
        unit: data.unit,
      },
    });

    // If initial stock > 0, create initial RESTOCK log
    if (data.stock > 0) {
      await tx.inventoryLog.create({
        data: {
          itemId: item.id,
          userId: session.user.id,
          type: InventoryLogType.RESTOCK,
          quantity: data.stock,
          previousStock: 0,
          currentStock: data.stock,
          notes: "Stok awal saat pendaftaran barang",
        },
      });
    }
  });

  revalidatePath("/operate/inventory");
  revalidatePath("/dashboard");

  return { ok: true, itemId: (await prisma.inventoryItem.findFirst({ where: { branchId: data.branchId, name: data.name } }))?.id };
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
  ctx?: { session: { user: { organizationId: string; role: string; id: string } } },
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? await auth();
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const organizationId = session.user.organizationId;

  // Check item belongs to user's organization
  const item = await prisma.inventoryItem.findFirst({
    where: {
      id,
      branch: {
        organizationId,
      },
    },
    include: {
      branch: true,
    },
  });

  if (!item) {
    return { ok: false, error: "Inventory item not found or not accessible" };
  }

  await prisma.inventoryItem.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      minStock: data.minStock,
      unit: data.unit,
    },
  });

  revalidatePath("/operate/inventory");
  revalidatePath("/dashboard");

  return { ok: true };
}