"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface UpdateUserProfileInput {
  name: string;
}

export interface ChangeUserPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface AuthContext {
  session?: {
    user?: {
      id?: string;
      organizationId?: string;
      role?: string;
      [key: string]: unknown;
    };
  } | null;
}

export async function updateUserProfile(
  data: UpdateUserProfileInput,
  ctx?: AuthContext
): Promise<ActionResult> {
  const session = ctx ? ctx.session : await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Tidak terautentikasi." };
  }

  const cleanName = data?.name?.trim();
  if (!cleanName || cleanName.length < 2) {
    return { ok: false, error: "Nama minimal 2 karakter." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: cleanName },
  });

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");

  return { ok: true };
}

export async function changeUserPassword(
  data: ChangeUserPasswordInput,
  ctx?: AuthContext
): Promise<ActionResult> {
  const session = ctx ? ctx.session : await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Tidak terautentikasi." };
  }

  if (!data?.currentPassword) {
    return { ok: false, error: "Password saat ini wajib diisi." };
  }

  if (!data?.newPassword || data.newPassword.length < 8) {
    return { ok: false, error: "Password baru minimal 8 karakter." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return { ok: false, error: "Pengguna tidak ditemukan." };
  }

  const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isMatch) {
    return { ok: false, error: "Password saat ini salah." };
  }

  const newHash = await bcrypt.hash(data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  });

  return { ok: true };
}
