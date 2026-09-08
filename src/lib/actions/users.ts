"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  branchId?: string | null;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  role?: Role;
  branchId?: string | null;
  isActive?: boolean;
  newPassword?: string;
}

export interface UserAuthContext {
  session: {
    user: {
      id: string;
      organizationId: string;
      role: string;
      branchId?: string | null;
    };
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(
  data: CreateUserInput,
  ctx?: UserAuthContext,
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role: actorRole, branchId: actorBranchId } = session.user;
  const isDirector = actorRole === "DIRECTOR" || actorRole === "SUPER_ADMIN";
  const isManager = actorRole === "MANAGER";

  if (!isDirector && !isManager) {
    return { ok: false, error: "Hanya Direktur atau Manajer yang dapat menambah staf." };
  }

  if (isManager && data.role !== Role.STAFF) {
    return { ok: false, error: "Manajer hanya dapat mendaftarkan pengguna dengan peran Staf." };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { ok: false, error: "Nama staf minimal 2 karakter." };
  }

  const cleanEmail = data.email?.trim().toLowerCase();
  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return { ok: false, error: "Format alamat email tidak valid." };
  }

  if (!data.password || data.password.length < 6) {
    return { ok: false, error: "Kata sandi minimal 6 karakter." };
  }

  const targetBranchId = isManager ? actorBranchId : (data.branchId ?? null);

  if (targetBranchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: targetBranchId, organizationId },
      select: { id: true },
    });
    if (!branch) {
      return { ok: false, error: "Cabang tidak valid dalam organisasi ini." };
    }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existing) {
      return { ok: false, error: "Email sudah terdaftar dalam sistem." };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        organizationId,
        branchId: targetBranchId,
        name: trimmedName,
        email: cleanEmail,
        passwordHash,
        role: data.role,
        isActive: true,
      },
      select: { id: true },
    });

    revalidatePath("/settings/users");
    return { ok: true, userId: user.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal membuat pengguna baru.",
    };
  }
}

export async function updateUser(
  id: string,
  data: Omit<UpdateUserInput, "id">,
  ctx?: UserAuthContext,
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role: actorRole, branchId: actorBranchId, id: actorId } = session.user;
  const isDirector = actorRole === "DIRECTOR" || actorRole === "SUPER_ADMIN";
  const isManager = actorRole === "MANAGER";

  if (!isDirector && !isManager) {
    return { ok: false, error: "Akses ditolak." };
  }

  try {
    const targetUser = await prisma.user.findFirst({
      where: { id, organizationId },
      select: { id: true, role: true, branchId: true, isActive: true },
    });

    if (!targetUser) {
      return { ok: false, error: "Pengguna tidak ditemukan." };
    }

    if (isManager) {
      if (targetUser.role !== Role.STAFF || targetUser.branchId !== actorBranchId) {
        return { ok: false, error: "Manajer hanya dapat mengelola staf pada cabangnya sendiri." };
      }
      if (data.role && data.role !== Role.STAFF) {
        return { ok: false, error: "Manajer tidak dapat mengubah peran di luar Staf." };
      }
    }

    if (targetUser.id === actorId && data.isActive === false) {
      return { ok: false, error: "Tidak dapat menonaktifkan akun sendiri." };
    }

    if (targetUser.role === Role.DIRECTOR && (data.isActive === false || (data.role && data.role !== Role.DIRECTOR))) {
      const activeDirectors = await prisma.user.count({
        where: {
          organizationId,
          role: Role.DIRECTOR,
          isActive: true,
        },
      });

      if (activeDirectors <= 1) {
        return { ok: false, error: "Organisasi harus memiliki minimal satu Direktur aktif." };
      }
    }

    const updateData: {
      name?: string;
      role?: Role;
      branchId?: string | null;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (trimmedName.length < 2) {
        return { ok: false, error: "Nama staf minimal 2 karakter." };
      }
      updateData.name = trimmedName;
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    if (data.branchId !== undefined) {
      if (data.branchId) {
        const branch = await prisma.branch.findFirst({
          where: { id: data.branchId, organizationId },
          select: { id: true },
        });
        if (!branch) {
          return { ok: false, error: "Cabang tidak valid." };
        }
      }
      updateData.branchId = data.branchId;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    if (data.newPassword !== undefined && data.newPassword.trim().length > 0) {
      if (data.newPassword.length < 6) {
        return { ok: false, error: "Kata sandi baru minimal 6 karakter." };
      }
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/settings/users");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui data pengguna.",
    };
  }
}

export async function toggleUserActive(
  id: string,
  ctx?: UserAuthContext,
): Promise<{ ok: boolean; error?: string }> {
  const session = ctx?.session ?? (await auth());

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findFirst({
    where: { id, organizationId: session.user.organizationId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    return { ok: false, error: "Pengguna tidak ditemukan." };
  }

  return updateUser(id, { isActive: !user.isActive }, ctx);
}
