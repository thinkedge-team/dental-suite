"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppointmentStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function checkInAppointment(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.appointment.update({
    where: { id, organizationId: session.user.organizationId },
    data: {
      status: AppointmentStatus.CHECKED_IN,
      checkInAt: new Date(),
    },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
}

export async function completeAppointment(id: string, notes?: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const appointment = await prisma.appointment.findFirst({
    where: { id, organizationId: session.user.organizationId },
    select: { patientId: true, branchId: true, doctorId: true, organizationId: true },
  });

  if (!appointment) {
    throw new Error("Unauthorized");
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id, organizationId: session.user.organizationId },
      data: { status: AppointmentStatus.COMPLETED },
    });

    if (appointment.patientId !== null) {
      await tx.visit.upsert({
        where: { appointmentId: id },
        create: {
          organizationId: session.user.organizationId,
          patientId: appointment.patientId,
          appointmentId: id,
          branchId: appointment.branchId,
          doctorId: appointment.doctorId,
          notes: notes ?? null,
          createdAt: new Date(),
        },
        update: { notes: notes ?? null },
      });
    }
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
}

export async function cancelAppointment(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.appointment.update({
    where: { id, organizationId: session.user.organizationId },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
}

export async function createAppointment(data: {
  patientName: string;
  patientPhone: string;
  doctorId?: string;
  branchId: string;
  scheduledAt: Date;
  service?: string;
  walkin?: boolean;
}): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const branch = await prisma.branch.findFirst({
    where: { id: data.branchId, organizationId: session.user.organizationId, isActive: true },
    select: { id: true },
  });
  if (!branch) throw new Error("Cabang tidak valid atau bukan milik organisasi Anda");

  if (data.scheduledAt <= new Date()) throw new Error("Jadwal harus di masa mendatang");

  const patient = await prisma.patient.upsert({
    where: { organizationId_phone: { organizationId: session.user.organizationId, phone: data.patientPhone } },
    update: {},
    create: { organizationId: session.user.organizationId, name: data.patientName, phone: data.patientPhone },
  });

  await prisma.appointment.create({
    data: {
      organizationId: session.user.organizationId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientId: patient.id,
      doctorId: data.doctorId ?? null,
      branchId: data.branchId,
      scheduledAt: data.scheduledAt,
      service: data.service ?? null,
      walkin: data.walkin ?? false,
      status: AppointmentStatus.CONFIRMED,
    },
  });

  revalidatePath("/appointments");
  redirect("/appointments");
}
