"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updatePatientNotes(
  patientId: string,
  notes: string,
  ctx?: { session: { user: { organizationId: string; role: string } } }
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId } = session.user;

  // Confirm patient exists and belongs to user's organization
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!patient) {
    return { ok: false, error: "Pasien tidak ditemukan." };
  }

  // Update notes: trim to empty string becomes null, otherwise trimmed value
  const trimmedNotes = notes.trim();
  const notesToStore = trimmedNotes === "" ? null : trimmedNotes;

  try {
    await prisma.patient.update({
      where: { id: patientId },
      data: { notes: notesToStore },
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath("/patients");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui catatan pasien.",
    };
  }
}