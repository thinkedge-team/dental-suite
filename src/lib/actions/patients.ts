"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface PatientAuthContext {
  session: {
    user: {
      id: string;
      organizationId: string;
      role: string;
    };
  };
}

export async function anonymizePatient(
  patientId: string,
  ctx?: PatientAuthContext,
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN" || role === "MANAGER";

  if (!isAllowed) {
    return { ok: false, error: "Hanya Direktur atau Manajer yang dapat menghapus data pasien." };
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        organizationId,
        deletedAt: null,
      },
      select: { id: true, name: true },
    });

    if (!patient) {
      return { ok: false, error: "Data pasien tidak ditemukan atau sudah dihapus." };
    }

    const now = new Date();
    const anonymizedPhone = `080000000000-${patient.id.slice(-6)}`;

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        name: `Pasien Anonim #${patient.id.slice(-4)}`,
        phone: anonymizedPhone,
        email: null,
        dob: null,
        notes: `Data identitas pribadi dihapus atas permintaan hak privasi UU PDP No. 27/2022 pada ${now.toISOString()}. Rekam transaksi klinis dipertahankan sesuai Permenkes No. 269/2008.`,
        deletedAt: now,
      },
    });

    revalidatePath("/patients");
    revalidatePath(`/patients/${patientId}`);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memproses penghapusan data pasien.",
    };
  }
}
