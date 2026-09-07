"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface UpdateOrganizationProfileInput {
  name: string;
  primaryColor?: string;
  logoUrl?: string;
}

interface AuthContext {
  session: {
    user: {
      id: string;
      organizationId: string;
      role: string;
      branchId?: string | null;
    };
  };
}

export async function updateOrganizationProfile(
  data: UpdateOrganizationProfileInput,
  ctx?: AuthContext,
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isAllowed) {
    return {
      ok: false,
      error: "Hanya DIRECTOR atau SUPER_ADMIN yang dapat mengubah profil organisasi.",
    };
  }

  const cleanName = data.name ? data.name.trim() : "";
  if (cleanName.length < 2) {
    return {
      ok: false,
      error: "Nama klinik minimal terdiri dari 2 karakter.",
    };
  }

  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: cleanName,
        primaryColor: data.primaryColor?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
      },
    });

    revalidatePath("/settings/organization");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui profil organisasi.",
    };
  }
}
