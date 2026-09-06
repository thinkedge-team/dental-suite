"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getWibIsoBounds } from "@/lib/appointments/day-bounds";
import { prisma } from "@/lib/prisma";

export interface AssignShiftInput {
  userId: string;
  branchId: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  notes?: string;
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  error?: string;
  shiftId?: string;
  data?: T;
}

export async function assignShift(
  data: AssignShiftInput,
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<ActionResult> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isDirector && data.branchId !== userBranchId) {
    return { ok: false, error: "Akses cabang tidak diizinkan." };
  }

  if (!data.userId || !data.branchId || !data.date || !data.startTime || !data.endTime) {
    return { ok: false, error: "Data shift tidak lengkap." };
  }

  try {
    const [targetUser, targetBranch] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: data.userId,
          organizationId,
        },
        select: { id: true },
      }),
      prisma.branch.findFirst({
        where: {
          id: data.branchId,
          organizationId,
        },
        select: { id: true },
      }),
    ]);

    if (!targetUser) {
      return { ok: false, error: "Staf tidak ditemukan dalam organisasi ini." };
    }

    if (!targetBranch) {
      return { ok: false, error: "Cabang tidak ditemukan dalam organisasi ini." };
    }

    const isoDate = data.date.includes("T") ? data.date.split("T")[0] : data.date;
    const { start: dayStart, end: dayEnd } = getWibIsoBounds(isoDate);

    const existingShift = await prisma.shift.findFirst({
      where: {
        userId: data.userId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: { id: true },
    });

    let shiftId: string;

    if (existingShift) {
      const updated = await prisma.shift.update({
        where: { id: existingShift.id },
        data: {
          branchId: data.branchId,
          date: dayStart,
          startTime: data.startTime,
          endTime: data.endTime,
          shiftType: data.shiftType || "PAGI",
          notes: data.notes?.trim() || null,
        },
      });
      shiftId = updated.id;
    } else {
      const created = await prisma.shift.create({
        data: {
          userId: data.userId,
          branchId: data.branchId,
          date: dayStart,
          startTime: data.startTime,
          endTime: data.endTime,
          shiftType: data.shiftType || "PAGI",
          notes: data.notes?.trim() || null,
        },
      });
      shiftId = created.id;
    }

    revalidatePath("/operate/shifts");

    return { ok: true, shiftId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan jadwal shift.",
    };
  }
}

export async function deleteShift(
  id: string,
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  try {
    const shift = await prisma.shift.findFirst({
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

    if (!shift) {
      return { ok: false, error: "Shift tidak ditemukan." };
    }

    if (!isDirector && shift.branchId !== userBranchId) {
      return { ok: false, error: "Akses cabang tidak diizinkan." };
    }

    await prisma.shift.delete({
      where: { id },
    });

    revalidatePath("/operate/shifts");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal menghapus jadwal shift.",
    };
  }
}
