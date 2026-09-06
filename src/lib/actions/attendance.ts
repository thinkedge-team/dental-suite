"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { AttendanceStatus } from "@/generated/prisma";
import { getWibDayBounds } from "@/lib/appointments/day-bounds";
import { evaluatePunctuality } from "@/lib/attendance/punctuality";
import { prisma } from "@/lib/prisma";

export interface ClockInInput {
  branchId: string;
  notes?: string;
}

export interface ClockOutInput {
  notes?: string;
}

export interface ClockInResult {
  ok: boolean;
  attendanceId?: string;
  status?: AttendanceStatus;
  error?: string;
}

export interface ClockOutResult {
  ok: boolean;
  error?: string;
}

export async function clockIn(
  data: ClockInInput,
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<ClockInResult> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.id || !session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId, id: userId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isDirector && userBranchId && data.branchId !== userBranchId) {
    return { ok: false, error: "Akses cabang tidak diizinkan." };
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
      return { ok: false, error: "Cabang tidak ditemukan dalam organisasi ini." };
    }

    const now = new Date();
    const { start: todayWibStart, end: todayWibEnd } = getWibDayBounds(now);

    const activeRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        clockOutAt: null,
        date: {
          gte: todayWibStart,
          lte: todayWibEnd,
        },
      },
      select: { id: true },
    });

    if (activeRecord) {
      return { ok: false, error: "Anda sudah melakukan clock in sebelumnya." };
    }

    const shift = await prisma.shift.findFirst({
      where: {
        userId,
        date: {
          gte: todayWibStart,
          lte: todayWibEnd,
        },
        attendance: null,
      },
      select: {
        id: true,
        startTime: true,
      },
    });

    const punctuality = evaluatePunctuality(now, shift?.startTime);
    const status = punctuality.status as AttendanceStatus;

    const record = await prisma.attendanceRecord.create({
      data: {
        branchId: data.branchId,
        userId,
        date: todayWibStart,
        clockInAt: now,
        status,
        shiftId: shift?.id ?? null,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/operate/attendance");
    revalidatePath("/dashboard");

    return {
      ok: true,
      attendanceId: record.id,
      status: record.status,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal melakukan clock in.",
    };
  }
}

export async function clockOut(
  data?: ClockOutInput,
  ctx?: { session: { user: { organizationId: string; role: string; branchId?: string | null; id: string } } },
): Promise<ClockOutResult> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.id || !session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, id: userId } = session.user;

  try {
    const activeRecord = await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        clockOutAt: null,
        branch: {
          organizationId,
        },
      },
      orderBy: {
        clockInAt: "desc",
      },
    });

    if (!activeRecord) {
      return { ok: false, error: "Tidak ada sesi presensi aktif untuk clock out." };
    }

    const existingNotes = activeRecord.notes;
    const additionalNotes = data?.notes?.trim();
    const finalNotes = existingNotes && additionalNotes
      ? `${existingNotes} · ${additionalNotes}`
      : additionalNotes || existingNotes || null;

    await prisma.attendanceRecord.update({
      where: { id: activeRecord.id },
      data: {
        clockOutAt: new Date(),
        notes: finalNotes,
      },
    });

    revalidatePath("/operate/attendance");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal melakukan clock out.",
    };
  }
}
