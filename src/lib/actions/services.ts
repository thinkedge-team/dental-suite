"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function generateServiceSlug(name: string): Promise<string> {
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

  return normalized || "service";
}

export interface CreateServiceInput {
  name: string;
  price: number;
  durationMin: number;
  description?: string;
}

export interface UpdateServiceInput {
  name: string;
  price: number;
  durationMin: number;
  description?: string;
  isActive?: boolean;
}

interface AuthContext {
  session: {
    user: {
      id: string;
      organizationId: string;
      role: string;
    };
  };
}

async function resolveUniqueServiceSlug(
  organizationId: string,
  baseSlug: string,
  excludeServiceId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.service.findFirst({
      where: {
        organizationId,
        slug: candidate,
        ...(excludeServiceId ? { id: { not: excludeServiceId } } : {}),
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

export async function createService(
  data: CreateServiceInput,
  ctx?: AuthContext,
): Promise<{ ok: boolean; serviceId?: string; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN" || role === "MANAGER";

  if (!isAllowed) {
    return {
      ok: false,
      error: "Hanya DIRECTOR, SUPER_ADMIN, atau MANAGER yang dapat membuat layanan baru.",
    };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { ok: false, error: "Nama layanan wajib diisi." };
  }

  if (typeof data.price !== "number" || isNaN(data.price) || data.price < 0) {
    return { ok: false, error: "Harga layanan harus berupa angka positif atau nol." };
  }

  if (typeof data.durationMin !== "number" || isNaN(data.durationMin) || data.durationMin < 1) {
    return { ok: false, error: "Durasi layanan minimal 1 menit." };
  }

  try {
    const baseSlug = await generateServiceSlug(trimmedName);
    const slug = await resolveUniqueServiceSlug(organizationId, baseSlug);

    const service = await prisma.service.create({
      data: {
        organizationId,
        name: trimmedName,
        slug,
        price: data.price,
        durationMin: Math.round(data.durationMin),
        description: data.description?.trim() || null,
        isActive: true,
      },
      select: { id: true },
    });

    revalidatePath("/services");
    revalidatePath("/layanan");
    revalidatePath("/book");

    return { ok: true, serviceId: service.id };
  } catch (err) {
    console.error("[createService] Failed to create service:", err);
    return { ok: false, error: "Gagal membuat layanan baru. Silakan coba lagi." };
  }
}

export async function updateService(
  id: string,
  data: UpdateServiceInput,
  ctx?: AuthContext,
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN" || role === "MANAGER";

  if (!isAllowed) {
    return {
      ok: false,
      error: "Hanya DIRECTOR, SUPER_ADMIN, atau MANAGER yang dapat memperbarui layanan.",
    };
  }

  if (!id) {
    return { ok: false, error: "ID layanan tidak valid." };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { ok: false, error: "Nama layanan wajib diisi." };
  }

  if (typeof data.price !== "number" || isNaN(data.price) || data.price < 0) {
    return { ok: false, error: "Harga layanan harus berupa angka positif atau nol." };
  }

  if (typeof data.durationMin !== "number" || isNaN(data.durationMin) || data.durationMin < 1) {
    return { ok: false, error: "Durasi layanan minimal 1 menit." };
  }

  try {
    const existing = await prisma.service.findFirst({
      where: { id, organizationId },
      select: { id: true, name: true, slug: true },
    });

    if (!existing) {
      return { ok: false, error: "Layanan tidak ditemukan atau Anda tidak memiliki akses." };
    }

    let slug = existing.slug;
    if (existing.name !== trimmedName) {
      const baseSlug = await generateServiceSlug(trimmedName);
      slug = await resolveUniqueServiceSlug(organizationId, baseSlug, id);
    }

    await prisma.service.update({
      where: { id },
      data: {
        name: trimmedName,
        slug,
        price: data.price,
        durationMin: Math.round(data.durationMin),
        description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    revalidatePath("/services");
    revalidatePath("/layanan");
    revalidatePath("/book");

    return { ok: true };
  } catch (err) {
    console.error("[updateService] Failed to update service:", err);
    return { ok: false, error: "Gagal memperbarui layanan. Silakan coba lagi." };
  }
}
