"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function generateDoctorSlug(name: string): Promise<string> {
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

  return normalized || "doctor";
}

export interface CreateDoctorInput {
  name: string;
  title: string;
  specialty: string;
  sipNumber?: string;
  strNumber?: string;
  yearsExperience?: number;
  bio?: string;
  photoUrl?: string;
  branchIds: string[];
}

export interface UpdateDoctorInput {
  name: string;
  title: string;
  specialty: string;
  sipNumber?: string;
  strNumber?: string;
  yearsExperience?: number;
  bio?: string;
  photoUrl?: string;
  branchIds: string[];
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

async function resolveUniqueDoctorSlug(
  organizationId: string,
  baseSlug: string,
  excludeDoctorId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.doctor.findFirst({
      where: {
        organizationId,
        slug: candidate,
        ...(excludeDoctorId ? { id: { not: excludeDoctorId } } : {}),
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

export async function createDoctor(
  data: CreateDoctorInput,
  ctx?: AuthContext,
): Promise<{ ok: boolean; doctorId?: string; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isAllowed) {
    return {
      ok: false,
      error: "Hanya DIRECTOR atau SUPER_ADMIN yang dapat menambahkan dokter baru.",
    };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { ok: false, error: "Nama dokter wajib diisi." };
  }

  const trimmedTitle = data.title?.trim() || "";
  const trimmedSpecialty = data.specialty?.trim() || "";

  const branchIds = Array.isArray(data.branchIds)
    ? Array.from(new Set(data.branchIds.filter(Boolean)))
    : [];

  try {
    const baseSlug = await generateDoctorSlug(trimmedName);
    const slug = await resolveUniqueDoctorSlug(organizationId, baseSlug);

    const result = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: {
          organizationId,
          name: trimmedName,
          slug,
          title: trimmedTitle || null,
          specialty: trimmedSpecialty || null,
          sipNumber: data.sipNumber?.trim() || null,
          strNumber: data.strNumber?.trim() || null,
          yearsExperience:
            typeof data.yearsExperience === "number" && !isNaN(data.yearsExperience)
              ? Math.max(0, Math.round(data.yearsExperience))
              : null,
          bio: data.bio?.trim() || null,
          photoUrl: data.photoUrl?.trim() || null,
          isActive: true,
        },
        select: { id: true },
      });

      if (branchIds.length > 0) {
        await tx.branchDoctor.createMany({
          data: branchIds.map((branchId) => ({
            branchId,
            doctorId: doctor.id,
          })),
          skipDuplicates: true,
        });
      }

      return doctor;
    });

    revalidatePath("/doctors");
    revalidatePath("/dokter");
    revalidatePath("/schedule");
    revalidatePath("/book");

    return { ok: true, doctorId: result.id };
  } catch (err) {
    console.error("[createDoctor] Failed to create doctor:", err);
    return { ok: false, error: "Gagal menambahkan dokter baru. Silakan coba lagi." };
  }
}

export async function updateDoctor(
  id: string,
  data: UpdateDoctorInput,
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
      error: "Hanya DIRECTOR atau SUPER_ADMIN yang dapat memperbarui data dokter.",
    };
  }

  if (!id) {
    return { ok: false, error: "ID dokter tidak valid." };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return { ok: false, error: "Nama dokter wajib diisi." };
  }

  const trimmedTitle = data.title?.trim() || "";
  const trimmedSpecialty = data.specialty?.trim() || "";

  const branchIds = Array.isArray(data.branchIds)
    ? Array.from(new Set(data.branchIds.filter(Boolean)))
    : [];

  try {
    const existing = await prisma.doctor.findFirst({
      where: { id, organizationId },
      select: { id: true, name: true, slug: true },
    });

    if (!existing) {
      return { ok: false, error: "Dokter tidak ditemukan atau Anda tidak memiliki akses." };
    }

    let slug = existing.slug;
    if (existing.name !== trimmedName) {
      const baseSlug = await generateDoctorSlug(trimmedName);
      slug = await resolveUniqueDoctorSlug(organizationId, baseSlug, id);
    }

    await prisma.$transaction(async (tx) => {
      await tx.doctor.update({
        where: { id },
        data: {
          name: trimmedName,
          slug,
          title: trimmedTitle || null,
          specialty: trimmedSpecialty || null,
          sipNumber: data.sipNumber !== undefined ? (data.sipNumber?.trim() || null) : undefined,
          strNumber: data.strNumber !== undefined ? (data.strNumber?.trim() || null) : undefined,
          yearsExperience:
            data.yearsExperience !== undefined
              ? typeof data.yearsExperience === "number" && !isNaN(data.yearsExperience)
                ? Math.max(0, Math.round(data.yearsExperience))
                : null
              : undefined,
          bio: data.bio !== undefined ? (data.bio?.trim() || null) : undefined,
          photoUrl: data.photoUrl !== undefined ? (data.photoUrl?.trim() || null) : undefined,
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });

      await tx.branchDoctor.deleteMany({
        where: { doctorId: id },
      });

      if (branchIds.length > 0) {
        await tx.branchDoctor.createMany({
          data: branchIds.map((branchId) => ({
            branchId,
            doctorId: id,
          })),
          skipDuplicates: true,
        });
      }
    });

    revalidatePath("/doctors");
    revalidatePath("/dokter");
    revalidatePath("/schedule");
    revalidatePath("/book");

    return { ok: true };
  } catch (err) {
    console.error("[updateDoctor] Failed to update doctor:", err);
    return { ok: false, error: "Gagal memperbarui data dokter. Silakan coba lagi." };
  }
}
