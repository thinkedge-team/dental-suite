"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, KeyRound, Loader2, UserCheck, X } from "lucide-react";

import { Role } from "@/generated/prisma";
import { createUser, updateUser } from "@/lib/actions/users";

export interface BranchOption {
  readonly id: string;
  readonly name: string;
}

export interface UserModalData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly branchId?: string | null;
  readonly isActive: boolean;
}

interface UserModalProps {
  readonly isOpen: boolean;
  readonly userToEdit?: UserModalData | null;
  readonly branches: readonly BranchOption[];
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

const ROLE_OPTIONS = [
  { value: Role.STAFF, label: "Staf Klinik (Front Office / Perawat)" },
  { value: Role.DOCTOR, label: "Dokter Gigi Praktik" },
  { value: Role.MANAGER, label: "Manajer Cabang Operasional" },
  { value: Role.DIRECTOR, label: "Direktur / Pimpinan Eksekutif" },
] as const;

function UserModalContent({
  userToEdit,
  branches,
  onClose,
  onSuccess,
}: Omit<UserModalProps, "isOpen">) {
  const isEditing = Boolean(userToEdit);

  const [name, setName] = useState<string>(userToEdit?.name ?? "");
  const [email, setEmail] = useState<string>(userToEdit?.email ?? "");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<Role>(userToEdit?.role ?? Role.STAFF);
  const [branchId, setBranchId] = useState<string>(userToEdit?.branchId ?? "");
  const [isActive, setIsActive] = useState<boolean>(userToEdit?.isActive ?? true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMessage("Nama pengguna minimal 2 karakter.");
      return;
    }

    if (!isEditing) {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setErrorMessage("Format email tidak valid.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Kata sandi awal minimal 6 karakter.");
        return;
      }
    } else if (password.length > 0 && password.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    startTransition(async () => {
      if (isEditing && userToEdit) {
        const res = await updateUser(userToEdit.id, {
          name: trimmedName,
          role,
          branchId: branchId || null,
          isActive,
          newPassword: password.trim().length > 0 ? password : undefined,
        });

        if (!res.ok) {
          setErrorMessage(res.error ?? "Gagal memperbarui pengguna.");
          return;
        }
      } else {
        const res = await createUser({
          name: trimmedName,
          email: email.trim().toLowerCase(),
          password,
          role,
          branchId: branchId || null,
        });

        if (!res.ok) {
          setErrorMessage(res.error ?? "Gagal menambahkan pengguna.");
          return;
        }
      }

      onSuccess?.();
      onClose();
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={isPending ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-7 z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 id="user-modal-title" className="text-base font-bold text-foreground">
                {isEditing ? "Edit Staf & Hak Akses" : "Tambah Pengguna Baru"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui informasi penugasan, cabang, atau kata sandi."
                  : "Daftarkan akun staf baru dan tentukan peran akses sistem."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-600 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="user-name" className="block text-xs font-semibold text-foreground mb-1.5">
              Nama Lengkap <span className="text-primary">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="user-name"
              type="text"
              required
              disabled={isPending}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rina Kartika, Amd.Kep"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block text-xs font-semibold text-foreground mb-1.5">
              Alamat Email Akun <span className="text-primary">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              required
              disabled={isEditing || isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@senyumsehat.com"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:bg-muted"
            />
            {isEditing && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Email merupakan identitas unik akun dan tidak dapat diubah.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-role" className="block text-xs font-semibold text-foreground mb-1.5">
                Peran & Hak Akses <span className="text-primary">*</span>
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={isPending}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="user-branch" className="block text-xs font-semibold text-foreground mb-1.5">
                Cabang Penugasan
              </label>
              <select
                id="user-branch"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Semua Cabang (Kantor Pusat)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    Cabang {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="user-password" className="block text-xs font-semibold text-foreground mb-1.5">
              {isEditing ? "Ganti Kata Sandi (Opsional)" : "Kata Sandi Akun *"}
            </label>
            <div className="relative">
              <input
                id="user-password"
                type="password"
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "Kosongkan jika sandi tidak diubah" : "Minimal 6 karakter"}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary pl-9"
              />
              <KeyRound className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            </div>
          </div>

          {isEditing && (
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isPending}
                  className="size-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-xs font-medium text-foreground">
                  Status Akun Aktif (Dapat masuk ke portal)
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Simpan Perubahan" : "Buat Akun Staf"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserModal(props: UserModalProps) {
  if (!props.isOpen) return null;
  return <UserModalContent key={props.userToEdit?.id ?? "new"} {...props} />;
}
