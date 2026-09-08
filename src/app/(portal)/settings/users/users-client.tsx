"use client";

import { useState, useTransition } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Power,
  Search,
  Shield,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  XCircle,
} from "lucide-react";

import { Role } from "@/generated/prisma";
import { toggleUserActive } from "@/lib/actions/users";
import { UserModal, UserModalData, BranchOption } from "./user-modal";

export interface UserRowData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly isActive: boolean;
  readonly branchId: string | null;
  readonly branchName: string | null;
  readonly createdAt: string;
}

interface UsersClientProps {
  readonly users: readonly UserRowData[];
  readonly branches: readonly BranchOption[];
  readonly currentUserId: string;
}

function getRoleBadge(role: Role) {
  switch (role) {
    case Role.SUPER_ADMIN:
    case Role.DIRECTOR:
      return {
        label: "Direktur",
        icon: ShieldCheck,
        className: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
      };
    case Role.MANAGER:
      return {
        label: "Manajer Cabang",
        icon: Shield,
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
      };
    case Role.DOCTOR:
      return {
        label: "Dokter Gigi",
        icon: Stethoscope,
        className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
      };
    case Role.STAFF:
    default:
      return {
        label: "Staf Klinik",
        icon: User,
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
      };
  }
}

export function UsersClient({ users, branches, currentUserId }: UsersClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModalData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");

  const [isPending, startTransition] = useTransition();
  const [activeToggleId, setActiveToggleId] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery.trim().length === 0 ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    const matchesBranch =
      branchFilter === "ALL" ||
      (branchFilter === "CENTRAL" ? u.branchId === null : u.branchId === branchFilter);

    return matchesSearch && matchesRole && matchesBranch;
  });

  function handleOpenCreate() {
    setSelectedUser(null);
    setModalOpen(true);
  }

  function handleOpenEdit(user: UserRowData) {
    setSelectedUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      isActive: user.isActive,
    });
    setModalOpen(true);
  }

  function handleToggleActive(userId: string) {
    if (userId === currentUserId) return;
    setActiveToggleId(userId);
    startTransition(async () => {
      await toggleUserActive(userId);
      setActiveToggleId(null);
    });
  }

  const totalCount = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const leadershipCount = users.filter(
    (u) => u.role === Role.DIRECTOR || u.role === Role.SUPER_ADMIN || u.role === Role.MANAGER,
  ).length;
  const clinicalStaffCount = users.filter(
    (u) => u.role === Role.DOCTOR || u.role === Role.STAFF,
  ).length;

  return (
    <div className="space-y-6">
      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground block">Total Pengguna</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalCount}</span>
            <span className="text-xs text-muted-foreground">akun terdaftar</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground block">Direktur & Manajer</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{leadershipCount}</span>
            <span className="text-xs text-muted-foreground">pimpinan</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground block">Dokter & Staf</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{clinicalStaffCount}</span>
            <span className="text-xs text-muted-foreground">operasional</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground block">Status Akses</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{activeCount}</span>
            <span className="text-xs text-muted-foreground">aktif dari {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, and Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email staf..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Semua Peran</option>
              <option value={Role.DIRECTOR}>Direktur</option>
              <option value={Role.MANAGER}>Manajer</option>
              <option value={Role.DOCTOR}>Dokter</option>
              <option value={Role.STAFF}>Staf</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">Semua Cabang</option>
              <option value="CENTRAL">Kantor Pusat</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  Cabang {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 select-none"
        >
          <Plus className="size-3.5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Nama & Email
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Peran Akses
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Cabang Penugasan
                </th>
                <th scope="col" className="px-5 py-3 font-semibold text-center">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 font-semibold text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Users className="mx-auto size-8 opacity-40 mb-2" />
                    <p className="font-semibold text-foreground">Tidak ada staf yang sesuai</p>
                    <p className="text-[11px] mt-0.5">Coba ubah kata kunci pencarian atau filter peran.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  const isCurrent = user.id === currentUserId;
                  const isToggling = activeToggleId === user.id && isPending;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground uppercase">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${roleBadge.className}`}
                        >
                          <RoleIcon className="size-3" />
                          <span>{roleBadge.label}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-foreground font-medium">
                        {user.branchName ? (
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Building2 className="size-3.5 text-muted-foreground" />
                            <span>Cabang {user.branchName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Semua Cabang (Pusat)</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-2.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            <XCircle className="size-2.5" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
                          >
                            <Pencil className="size-3" />
                            <span>Edit</span>
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user.id)}
                              disabled={isToggling}
                              title={user.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                                user.isActive
                                  ? "border-red-500/20 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                                  : "border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Power className="size-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        isOpen={modalOpen}
        userToEdit={selectedUser}
        branches={branches}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
