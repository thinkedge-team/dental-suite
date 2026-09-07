"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Loader2, Pencil, Plus, X } from "lucide-react";

import { createDoctor, updateDoctor } from "@/lib/actions/doctors";

export interface BranchOption {
  readonly id: string;
  readonly name: string;
}

export interface DoctorModalData {
  readonly id: string;
  readonly name: string;
  readonly title?: string | null;
  readonly specialty?: string | null;
  readonly sipNumber?: string | null;
  readonly strNumber?: string | null;
  readonly yearsExperience?: number | null;
  readonly bio?: string | null;
  readonly photoUrl?: string | null;
  readonly branchIds: string[];
  readonly isActive?: boolean;
}

interface DoctorModalProps {
  readonly isOpen: boolean;
  readonly doctorToEdit?: DoctorModalData | null;
  readonly branches: BranchOption[];
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function DoctorModal({
  isOpen,
  doctorToEdit,
  branches,
  onClose,
  onSuccess,
}: DoctorModalProps) {
  const isEditing = Boolean(doctorToEdit);

  const [name, setName] = useState<string>(doctorToEdit?.name ?? "");
  const [title, setTitle] = useState<string>(doctorToEdit?.title ?? "drg.");
  const [specialty, setSpecialty] = useState<string>(doctorToEdit?.specialty ?? "Dokter Gigi Umum");
  const [sipNumber, setSipNumber] = useState<string>(doctorToEdit?.sipNumber ?? "");
  const [strNumber, setStrNumber] = useState<string>(doctorToEdit?.strNumber ?? "");
  const [yearsExperience, setYearsExperience] = useState<string>(
    doctorToEdit?.yearsExperience !== null && doctorToEdit?.yearsExperience !== undefined
      ? String(doctorToEdit.yearsExperience)
      : "",
  );
  const [bio, setBio] = useState<string>(doctorToEdit?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState<string>(doctorToEdit?.photoUrl ?? "");
  const [branchIds, setBranchIds] = useState<string[]>(doctorToEdit?.branchIds ?? []);
  const [isActive, setIsActive] = useState<boolean>(doctorToEdit?.isActive ?? true);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const modalRef = useRef<HTMLDivElement>(null);

  const [prevDoctorToEdit, setPrevDoctorToEdit] = useState(doctorToEdit);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (doctorToEdit !== prevDoctorToEdit || isOpen !== prevIsOpen) {
    setPrevDoctorToEdit(doctorToEdit);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setName(doctorToEdit?.name ?? "");
      setTitle(doctorToEdit?.title ?? "drg.");
      setSpecialty(doctorToEdit?.specialty ?? "Dokter Gigi Umum");
      setSipNumber(doctorToEdit?.sipNumber ?? "");
      setStrNumber(doctorToEdit?.strNumber ?? "");
      setYearsExperience(
        doctorToEdit?.yearsExperience !== null && doctorToEdit?.yearsExperience !== undefined
          ? String(doctorToEdit.yearsExperience)
          : "",
      );
      setBio(doctorToEdit?.bio ?? "");
      setPhotoUrl(doctorToEdit?.photoUrl ?? "");
      setBranchIds(doctorToEdit?.branchIds ?? []);
      setIsActive(doctorToEdit?.isActive ?? true);
      setError(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function toggleBranch(branchId: string) {
    setBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama dokter wajib diisi.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedSpecialty = specialty.trim();

    const parsedExp = yearsExperience.trim() !== "" ? Number(yearsExperience) : undefined;
    if (parsedExp !== undefined && (isNaN(parsedExp) || parsedExp < 0)) {
      setError("Tahun pengalaman harus berupa angka positif.");
      return;
    }

    startTransition(async () => {
      if (isEditing && doctorToEdit) {
        const res = await updateDoctor(doctorToEdit.id, {
          name: trimmedName,
          title: trimmedTitle,
          specialty: trimmedSpecialty,
          sipNumber: sipNumber.trim() || undefined,
          strNumber: strNumber.trim() || undefined,
          yearsExperience: parsedExp,
          bio: bio.trim() || undefined,
          photoUrl: photoUrl.trim() || undefined,
          branchIds,
          isActive,
        });

        if (res.ok) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error ?? "Terjadi kesalahan saat memperbarui data dokter.");
        }
      } else {
        const res = await createDoctor({
          name: trimmedName,
          title: trimmedTitle,
          specialty: trimmedSpecialty,
          sipNumber: sipNumber.trim() || undefined,
          strNumber: strNumber.trim() || undefined,
          yearsExperience: parsedExp,
          bio: bio.trim() || undefined,
          photoUrl: photoUrl.trim() || undefined,
          branchIds,
        });

        if (res.ok) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error ?? "Terjadi kesalahan saat menambahkan dokter.");
        }
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border/70 bg-card shadow-xl transition-all my-8"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEditing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            </div>
            <div>
              <h2 id="doctor-modal-title" className="text-base font-semibold text-foreground">
                {isEditing ? "Edit Profil Dokter" : "Tambah Dokter Baru"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui informasi klinis, lisensi praktik, dan penugasan cabang"
                  : "Daftarkan dokter ke sistem klinik dan publikasikan ke portal reservasi"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 pt-4">
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="doctor-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="doctor-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Gelar / Awalan
                </label>
                <input
                  id="doctor-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="drg. / Dr. drg."
                  className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="doctor-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <input
                  id="doctor-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="cth. Anisa Rahmawati, Sp.KG"
                  className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="doctor-specialty"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Spesialisasi
                </label>
                <input
                  id="doctor-specialty"
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="cth. Konservasi Gigi (Sp.KG) / Ortodonti"
                  className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-exp"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Pengalaman (Tahun)
                </label>
                <input
                  id="doctor-exp"
                  type="number"
                  min="0"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="8"
                  className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="doctor-sip"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Nomor SIP (Surat Izin Praktik)
                </label>
                <input
                  id="doctor-sip"
                  type="text"
                  value={sipNumber}
                  onChange={(e) => setSipNumber(e.target.value)}
                  placeholder="503/SIP-DG/012/DPMPTSP"
                  className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="doctor-str"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Nomor STR (Surat Tanda Registrasi)
                </label>
                <input
                  id="doctor-str"
                  type="text"
                  value={strNumber}
                  onChange={(e) => setStrNumber(e.target.value)}
                  placeholder="31.2.1.100.1.22.123456"
                  className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="doctor-photo"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                URL Foto Profil (Opsional)
              </label>
              <input
                id="doctor-photo"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="doctor-bio"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Biografi Singkat (Opsional)
              </label>
              <textarea
                id="doctor-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Lulusan FKG Universitas Indonesia dengan sertifikasi keahlian dalam..."
                className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Branch Assignment Section */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Penugasan Cabang Klinik
              </label>
              {branches.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  Belum ada cabang terdaftar. Buat cabang terlebih dahulu di menu Cabang.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/20 p-3 max-h-40 overflow-y-auto">
                  {branches.map((branch) => {
                    const isChecked = branchIds.includes(branch.id);
                    return (
                      <label
                        key={branch.id}
                        className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                          isChecked
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border/60 bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBranch(branch.id)}
                          className="size-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="truncate">{branch.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                <input
                  id="doctor-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="doctor-active" className="cursor-pointer text-xs font-medium text-foreground">
                  Dokter aktif (dapat dipilih untuk jadwal praktik dan reservasi)
                </label>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border/50 bg-card">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border/70 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="doctor-form"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Simpan Perubahan" : "Simpan Dokter"}
          </button>
        </div>
      </div>
    </div>
  );
}
