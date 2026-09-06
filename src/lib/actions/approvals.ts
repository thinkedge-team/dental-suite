"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ApprovalStatus,
  ApprovalType,
  InventoryLogType,
  Prisma,
} from "@/generated/prisma";
import {
  canUserReviewRequest,
  validateApprovalPayload,
  type ApprovalPayload,
  type ProcurementPayload,
} from "@/lib/approvals/types";

export type ApprovalActionContext = {
  session: {
    user: {
      id: string;
      role: string;
      organizationId: string;
      branchId?: string | null;
    };
  };
};

export async function submitApprovalRequest(
  data: {
    branchId: string;
    type: "PROCUREMENT" | "MAINTENANCE" | "OTHER";
    payload: ApprovalPayload;
  },
  ctx?: ApprovalActionContext
): Promise<{ ok: boolean; error?: string; requestId?: string }> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isDirector && data.branchId !== userBranchId) {
    return { ok: false, error: "Akses cabang tidak diizinkan." };
  }

  const validation = validateApprovalPayload(data.type, data.payload);
  if (!validation.valid) {
    return { ok: false, error: validation.error || "Data permohonan tidak valid." };
  }

  try {
    const branch = await prisma.branch.findFirst({
      where: {
        id: data.branchId,
        organizationId,
      },
      select: { id: true },
    });

    if (!branch) {
      return { ok: false, error: "Cabang tidak ditemukan." };
    }

    const request = await prisma.approvalRequest.create({
      data: {
        organizationId,
        branchId: data.branchId,
        requestedById: userId,
        type: data.type as ApprovalType,
        payload: data.payload as unknown as Prisma.InputJsonValue,
        status: ApprovalStatus.PENDING,
      },
      select: { id: true },
    });

    revalidatePath("/operate/approvals");
    revalidatePath("/dashboard");

    return { ok: true, requestId: request.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal mengajukan permohonan.",
    };
  }
}

export async function reviewApprovalRequest(
  data: {
    requestId: string;
    status: "APPROVED" | "REJECTED";
    reviewNote?: string;
  },
  ctx?: ApprovalActionContext
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;

  try {
    const request = await prisma.approvalRequest.findFirst({
      where: {
        id: data.requestId,
        organizationId,
      },
      select: {
        id: true,
        branchId: true,
        status: true,
      },
    });

    if (!request) {
      return { ok: false, error: "Permohonan tidak ditemukan." };
    }

    const allowed = canUserReviewRequest(role, userBranchId, request.branchId);
    if (!allowed) {
      return { ok: false, error: "Tidak memiliki izin untuk meninjau permohonan ini." };
    }

    await prisma.approvalRequest.update({
      where: { id: request.id },
      data: {
        status: data.status as ApprovalStatus,
        reviewNote: data.reviewNote?.trim() || null,
      },
    });

    revalidatePath("/operate/approvals");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memproses review permohonan.",
    };
  }
}

export async function fulfillProcurementToStock(
  data: {
    requestId: string;
  },
  ctx?: ApprovalActionContext
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  try {
    const request = await prisma.approvalRequest.findFirst({
      where: {
        id: data.requestId,
        organizationId,
        status: ApprovalStatus.APPROVED,
      },
      select: {
        id: true,
        branchId: true,
        type: true,
        payload: true,
      },
    });

    if (!request) {
      return {
        ok: false,
        error: "Permohonan tidak ditemukan atau belum disetujui.",
      };
    }

    if (!isDirector && request.branchId !== userBranchId) {
      return { ok: false, error: "Akses cabang tidak diizinkan." };
    }

    if (request.type !== ApprovalType.PROCUREMENT) {
      return { ok: false, error: "Tipe permohonan bukan pengadaan barang." };
    }

    const payload = request.payload as unknown as ProcurementPayload;

    if (payload.fulfilledAt) {
      return {
        ok: false,
        error: "Permohonan pengadaan ini sudah diproses ke stok.",
      };
    }

    if (payload.itemId) {
      await prisma.$transaction(async (tx) => {
        const item = await tx.inventoryItem.findFirst({
          where: {
            id: payload.itemId,
            branchId: request.branchId,
            branch: {
              organizationId,
            },
          },
          select: {
            id: true,
            stock: true,
          },
        });

        if (!item) {
          throw new Error("Item inventaris tidak ditemukan pada cabang ini.");
        }

        const newStock = item.stock + payload.quantity;

        await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            stock: { increment: payload.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            itemId: item.id,
            userId,
            type: InventoryLogType.RESTOCK,
            quantity: payload.quantity,
            previousStock: item.stock,
            currentStock: newStock,
            notes: `Pengadaan barang disetujui: ${payload.title}`,
          },
        });

        const updatedPayload: ProcurementPayload = {
          ...payload,
          fulfilledAt: new Date().toISOString(),
        };

        await tx.approvalRequest.update({
          where: { id: request.id },
          data: {
            payload: updatedPayload as unknown as Prisma.InputJsonValue,
          },
        });
      });
    } else {
      const updatedPayload: ProcurementPayload = {
        ...payload,
        fulfilledAt: new Date().toISOString(),
      };

      await prisma.approvalRequest.update({
        where: { id: request.id },
        data: {
          payload: updatedPayload as unknown as Prisma.InputJsonValue,
        },
      });
    }

    revalidatePath("/operate/approvals");
    revalidatePath("/operate/inventory");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memproses pengadaan ke stok.",
    };
  }
}
