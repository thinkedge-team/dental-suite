"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Building2, Loader2, Pencil, Plus, X } from "lucide-react";

import { createBranch, updateBranch } from "@/lib/actions/branches";

const DAYS_OF_WEEK = [
  { key: "senin", label: "Senin" },
  { key: "selasa", label: "Selasa" },
  { key: "rabu", label: "Rabu" },
  { key: "kamis", label: "Kamis" },
  { key: "jumat", label: "Jumat" },
  { key: "sabtu", label: "Sabtu" },
  { key: "minggu", label: "Minggu" },
] as const;

export interface BranchModalData {
  readonly id: string;
  readonly name: string;
  readonly address?: string | null;
  readonly city?: string | null;
  readonly province?: string | null;
  readonly whatsapp?: string | null;
  readonly googleMapsUrl?: string | null;
  readonly isActive?: boolean;
  readonly openingHours?: Record<string, string> | null;
}

interface BranchModalProps {
  readonly isOpen: boolean;
  readonly branchToEdit?: BranchModalData | null;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function BranchModal({
  isOpen,
  branchToEdit,
  onClose,
  onSuccess,
}: BranchModalProps) {
  const isEditing = Boolean(branchToEdit);

  const [name, setName] = useState<string>(branchToEdit?.name ?? "");
  const [city, setCity] = useState<string>(branchToEdit?.city ?? "");
  const [province, setProvince] = useState<string>(branchToEdit?.province ?? "");
  const [address, setAddress] = useState<string>(branchToEdit?.address ?? "");
  const [whatsapp, setWhatsapp] = useState<string>(branchToEdit?.whatsapp ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>(
    branchToEdit?.googleMapsUrl ?? "",
  );
  const [isActive, setIsActive] = useState<boolean>(
    branchToEdit?.isActive ?? true,
  );
  const [openingHours, setOpeningHours] = useState<Record<string, string>>(() => {
    const defaultHours: Record<string, string> = {
      senin: "09:00 - 21:00",
      selasa: "09:00 - 21:00",
      rabu: "09:00 - 21:00",
      kamis: "09:00 - 21:00",
      jumat: "09:00 - 21:00",
      sabtu: "09:00 - 21:00",
      minggu: "09:00 - 17:00",
    };
    if (branchToEdit?.openingHours && typeof branchToEdit.openingHours === "object") {
      return { ...defaultHours, ...branchToEdit.openingHours };
    }
    return defaultHours;
  });

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) {
    return null;
  }

  function handleHourChange(dayKey: string, value: string) {
    setOpeningHours((prev) => ({
      ...prev,
      [dayKey]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError("Nama cabang wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && branchToEdit) {
          const res = await updateBranch(branchToEdit.id, {
            name: cleanName,
            city: city.trim() || undefined,
            province: province.trim() || undefined,
            address: address.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            googleMapsUrl: googleMapsUrl.trim() || undefined,
            isActive,
            openingHours,
          });

          if (!res.ok) {
            setError(res.error || "Gagal memperbarui cabang.");
            return;
          }
        } else {
          const res = await createBranch({
            name: cleanName,
            city: city.trim() || undefined,
            province: province.trim() || undefined,
            address: address.trim() || undefined,
            whatsapp: whatsapp.trim() || undefined,
            googleMapsUrl: googleMapsUrl.trim() || undefined,
            openingHours,
          });

          if (!res.ok) {
            setError(res.error || "Gagal membuat cabang.");
            return;
          }
        }

        onSuccess?.();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-modal-title"
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {isEditing ? (
                <Pencil className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2
                id="branch-modal-title"
                className="text-lg font-bold text-foreground"
              >
                {isEditing ? "Edit Cabang" : "Tambah Cabang Baru"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Perbarui informasi dan jadwal operasional cabang klinik"
                  : "Daftarkan cabang baru ke jaringan klinik Anda"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="branch-name"
              className="text-xs font-semibold text-foreground"
            >
              Nama Cabang <span className="text-destructive">*</span>
            </label>
            <input
              id="branch-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Cabang Kelapa Gading"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="branch-city"
                className="text-xs font-semibold text-foreground"
              >
                Kota
              </label>
              <input
                id="branch-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jakarta Utara"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="branch-province"
                className="text-xs font-semibold text-foreground"
              >
                Provinsi
              </label>
              <input
                id="branch-province"
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Contoh: DKI Jakarta"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="branch-address"
              className="text-xs font-semibold text-foreground"
            >
              Alamat Lengkap
            </label>
            <textarea
              id="branch-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Boulevard Raya Blok LB3 No. 12"
              className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="branch-whatsapp"
                className="text-xs font-semibold text-foreground"
              >
                No. WhatsApp
              </label>
              <input
                id="branch-whatsapp"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="081234567890 atau 6281234567890"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="branch-maps"
                className="text-xs font-semibold text-foreground"
              >
                Google Maps URL
              </label>
              <input
                id="branch-maps"
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
              <div>
                <p className="text-xs font-bold text-foreground">Status Aktif Cabang</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Cabang nonaktif tidak akan muncul di opsi reservasi publik
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">
              Jam Operasional Cabang
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/70">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-16">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={openingHours[key] || ""}
                    onChange={(e) => handleHourChange(key, e.target.value)}
                    placeholder="09:00 - 21:00 / Tutup"
                    className="flex-1 h-8 px-2.5 rounded border border-border bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Buat Cabang
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
