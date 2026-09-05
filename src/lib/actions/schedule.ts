"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createScheduleBlock(data: {
  doctorId: string;
  branchId: string;
  startAt: Date;
  endAt: Date;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const organizationId = session.user.organizationId;

  if (!data.doctorId || !data.branchId || !data.startAt || !data.endAt) {
    return { ok: false, error: "Data jadwal blokir tidak lengkap" };
  }

  const startDate = new Date(data.startAt);
  const endDate = new Date(data.endAt);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { ok: false, error: "Format tanggal atau waktu tidak valid" };
  }

  if (startDate >= endDate) {
    return { ok: false, error: "Waktu selesai harus lebih besar dari waktu mulai" };
  }

  const [doctor, branch] = await Promise.all([
    prisma.doctor.findFirst({
      where: {
        id: data.doctorId,
        organizationId,
        isActive: true,
      },
      select: { id: true },
    }),
    prisma.branch.findFirst({
      where: {
        id: data.branchId,
        organizationId,
        isActive: true,
      },
      select: { id: true },
    }),
  ]);

  if (!doctor) {
    return { ok: false, error: "Dokter tidak ditemukan atau bukan milik organisasi Anda" };
  }

  if (!branch) {
    return { ok: false, error: "Cabang tidak ditemukan atau bukan milik organisasi Anda" };
  }

  await prisma.scheduleBlock.create({
    data: {
      doctorId: data.doctorId,
      branchId: data.branchId,
      startAt: startDate,
      endAt: endDate,
      reason: data.reason?.trim() ? data.reason.trim() : null,
    },
  });

  revalidatePath("/schedule");

  return { ok: true };
}

export async function deleteScheduleBlock(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const organizationId = session.user.organizationId;

  if (!id) {
    return { ok: false, error: "ID blokir tidak valid" };
  }

  const block = await prisma.scheduleBlock.findFirst({
    where: {
      id,
      doctor: {
        organizationId,
      },
    },
    select: { id: true },
  });

  if (!block) {
    return { ok: false, error: "Data blokir jadwal tidak ditemukan atau bukan milik organisasi Anda" };
  }

  await prisma.scheduleBlock.delete({
    where: { id },
  });

  revalidatePath("/schedule");

  return { ok: true };
}
