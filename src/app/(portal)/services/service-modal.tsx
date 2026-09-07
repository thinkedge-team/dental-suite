"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Clock, DollarSign, FileText, Loader2, Pencil, Plus, X } from "lucide-react";

import { createService, updateService } from "@/lib/actions/services";

export interface ServiceModalData {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly durationMin: number;
  readonly description?: string | null;
  readonly isActive?: boolean;
}

interface ServiceModalProps {
  readonly isOpen: boolean;
  readonly serviceToEdit?: ServiceModalData | null;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function ServiceModal({
  isOpen,
  serviceToEdit,
  onClose,
  onSuccess,
}: ServiceModalProps) {
  const isEditing = Boolean(serviceToEdit);

  const [name, setName] = useState<string>(serviceToEdit?.name ?? "");
  const [price, setPrice] = useState<string>(
    serviceToEdit?.price !== undefined ? String(serviceToEdit.price) : "",
  );
  const [durationMin, setDurationMin] = useState<string>(
    serviceToEdit?.durationMin !== undefined ? String(serviceToEdit.durationMin) : "30",
  );
  const [description, setDescription] = useState<string>(
    serviceToEdit?.description ?? "",
  );
  const [isActive, setIsActive] = useState<boolean>(
    serviceToEdit?.isActive ?? true,
  );

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

  useEffect(() => {
    if (isOpen) {
      setName(serviceToEdit?.name ?? "");
      setPrice(
        serviceToEdit?.price !== undefined ? String(serviceToEdit.price) : "",
      );
      setDurationMin(
        serviceToEdit?.durationMin !== undefined
          ? String(serviceToEdit.durationMin)
          : "30",
      );
      setDescription(serviceToEdit?.description ?? "");
      setIsActive(serviceToEdit?.isActive ?? true);
      setError(null);
    }
  }, [isOpen, serviceToEdit]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama layanan wajib diisi.");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Harga layanan harus berupa angka valid (minimal 0).");
      return;
    }

    const numDuration = Number(durationMin);
    if (isNaN(numDuration) || numDuration < 1) {
      setError("Durasi layanan minimal 1 menit.");
      return;
    }

    startTransition(async () => {
      if (isEditing && serviceToEdit) {
        const res = await updateService(serviceToEdit.id, {
          name: trimmedName,
          price: numPrice,
          durationMin: Math.round(numDuration),
          description: description.trim() || undefined,
          isActive,
        });

        if (res.ok) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error ?? "Terjadi kesalahan saat memperbarui layanan.");
        }
      } else {
        const res = await createService({
          name: trimmedName,
          price: numPrice,
          durationMin: Math.round(numDuration),
          description: description.trim() || undefined,
        });

        if (res.ok) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error ?? "Terjadi kesalahan saat membuat layanan.");
        }
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl border border-border/70 bg-card p-6 shadow-xl transition-all"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEditing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            </div>
            <div>
              <h2 id="service-modal-title" className="text-base font-semibold text-foreground">
                {isEditing ? "Edit Layanan Medis" : "Tambah Layanan Baru"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Perbarui informasi dan tarif layanan klinik"
                  : "Tambahkan layanan ke katalog klinik dan publik"}
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

        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="service-name"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Nama Layanan <span className="text-destructive">*</span>
            </label>
            <input
              id="service-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Pembersihan Karang Gigi (Scaling)"
              className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="service-price"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Tarif (Rp) <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-muted-foreground">
                  Rp
                </span>
                <input
                  id="service-price"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="350000"
                  className="w-full rounded-xl border border-border/70 bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="service-duration"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Durasi (Menit) <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1.5">
                <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="service-duration"
                  type="number"
                  min="1"
                  step="5"
                  required
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  placeholder="30"
                  className="w-full rounded-xl border border-border/70 bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="service-description"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Deskripsi Layanan (Opsional)
            </label>
            <textarea
              id="service-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsikan prosedur, indikasi klinis, atau persiapan untuk pasien..."
              className="mt-1.5 w-full rounded-xl border border-border/70 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
              <input
                id="service-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="service-active" className="cursor-pointer text-xs font-medium text-foreground">
                Layanan aktif (tampil di portal booking publik dan katalog)
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
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
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Simpan Layanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
