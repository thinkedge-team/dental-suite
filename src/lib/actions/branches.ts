"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function generateBranchSlug(name: string): Promise<string> {
  const normalized = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2014\u2013_.]+/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "branch";
}

interface CreateBranchInput {
  name: string;
  address?: string;
  city?: string;
  province?: string;
  whatsapp?: string;
  openingHours?: Record<string, string>;
  googleMapsUrl?: string;
}

interface UpdateBranchInput {
  name: string;
  address?: string;
  city?: string;
  province?: string;
  whatsapp?: string;
  openingHours?: Record<string, string>;
  googleMapsUrl?: string;
  isActive?: boolean;
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

async function resolveUniqueSlug(
  organizationId: string,
  baseSlug: string,
  excludeBranchId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.branch.findFirst({
      where: {
        organizationId,
        slug: candidate,
        ...(excludeBranchId ? { id: { not: excludeBranchId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

export async function createBranch(
  data: CreateBranchInput,
  ctx?: AuthContext,
): Promise<{ ok: boolean; branchId?: string; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isAllowed) {
    return { ok: false, error: "Hanya DIRECTOR atau SUPER_ADMIN yang dapat membuat cabang baru." };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { ok: false, error: "Nama cabang wajib diisi." };
  }

  try {
    const baseSlug = await generateBranchSlug(trimmedName);
    const uniqueSlug = await resolveUniqueSlug(organizationId, baseSlug);

    const branch = await prisma.branch.create({
      data: {
        organizationId,
        name: trimmedName,
        slug: uniqueSlug,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        province: data.province?.trim() || null,
        whatsapp: data.whatsapp?.trim() || null,
        openingHours: data.openingHours ?? undefined,
        googleMapsUrl: data.googleMapsUrl?.trim() || null,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/branches");
    revalidatePath("/lokasi");
    revalidatePath("/book");

    return { ok: true, branchId: branch.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal membuat cabang baru.",
    };
  }
}

export async function updateBranch(
  id: string,
  data: UpdateBranchInput,
  ctx?: AuthContext,
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;

  const existingBranch = await prisma.branch.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!existingBranch) {
    return { ok: false, error: "Cabang tidak ditemukan." };
  }

  const isDirectorOrAdmin = role === "DIRECTOR" || role === "SUPER_ADMIN";
  const isAssignedManager = role === "MANAGER" && userBranchId === id;

  if (!isDirectorOrAdmin && !isAssignedManager) {
    return {
      ok: false,
      error: "Anda tidak memiliki wewenang untuk mengubah data cabang ini.",
    };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { ok: false, error: "Nama cabang tidak boleh kosong." };
  }

  try {
    let finalSlug = existingBranch.slug;
    if (trimmedName !== existingBranch.name) {
      const baseSlug = await generateBranchSlug(trimmedName);
      finalSlug = await resolveUniqueSlug(organizationId, baseSlug, id);
    }

    await prisma.branch.update({
      where: { id },
      data: {
        name: trimmedName,
        slug: finalSlug,
        address: data.address !== undefined ? data.address.trim() || null : undefined,
        city: data.city !== undefined ? data.city.trim() || null : undefined,
        province: data.province !== undefined ? data.province.trim() || null : undefined,
        whatsapp: data.whatsapp !== undefined ? data.whatsapp.trim() || null : undefined,
        openingHours: data.openingHours !== undefined ? data.openingHours : undefined,
        googleMapsUrl: data.googleMapsUrl !== undefined ? data.googleMapsUrl.trim() || null : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    revalidatePath("/branches");
    revalidatePath("/lokasi");
    revalidatePath("/book");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui data cabang.",
    };
  }
}
