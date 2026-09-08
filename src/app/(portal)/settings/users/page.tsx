import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UsersClient, UserRowData } from "./users-client";
import { BranchOption } from "./user-modal";

export default async function SettingsUsersPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { organizationId, role, id: currentUserId } = session.user;
  const isAllowed = role === "DIRECTOR" || role === "SUPER_ADMIN";

  if (!isAllowed) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
        <Users className="mx-auto size-10 text-muted-foreground opacity-40 mb-3" />
        <h2 className="text-base font-bold text-foreground">Akses Terbatas</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hanya Direktur yang memiliki wewenang untuk mengelola akun staf dan hak akses sistem.
        </p>
      </div>
    );
  }

  const [rawUsers, rawBranches] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.branch.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const users: UserRowData[] = rawUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    branchId: u.branchId,
    branchName: u.branch?.name ?? null,
    createdAt: u.createdAt.toISOString(),
  }));

  const branches: BranchOption[] = rawBranches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Manajemen Staf & Hak Akses
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Kelola akun staf, tetapkan cabang penugasan, dan atur peran hak akses operasional klinik.
        </p>
      </div>

      <UsersClient users={users} branches={branches} currentUserId={currentUserId} />
    </div>
  );
}
