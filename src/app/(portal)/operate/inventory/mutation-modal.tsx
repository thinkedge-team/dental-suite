"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Check, Loader2, RefreshCw, X } from "lucide-react";

import { calculateNewStock, recordStockMutation } from "@/lib/actions/inventory";

export interface MutationModalItem {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly stock: number;
  readonly unit: string;
  readonly branchName?: string;
}

interface MutationModalProps {
  readonly item: MutationModalItem | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

type MutationType = "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";

const MUTATION_OPTIONS: {
  readonly type: MutationType;
  readonly label: string;
  readonly description: string;
  readonly colorCls: string;
}[] = [
  {
    type: "USAGE",
    label: "Pemakaian Tindakan",
    description: "Pengurangan stok untuk tindakan pasien",
    colorCls: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    type: "RESTOCK",
    label: "Restok Masuk",
    description: "Penambahan barang dari supplier/gudang",
    colorCls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    type: "ADJUSTMENT",
    label: "Koreksi Opname",
    description: "Penyesuaian ke jumlah fisik aktual",
    colorCls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    type: "DAMAGED",
    label: "Rusak / Kadaluwarsa",
    description: "Barang cacat, pecah, atau expired",
    colorCls: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
];

export function MutationModal({ item, isOpen, onClose, onSuccess }: MutationModalProps) {
  const [type, setType] = useState<MutationType>("USAGE");
  const [quantityStr, setQuantityStr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) {
    return null;
  }

  const parsedQty = parseInt(quantityStr, 10);
  const isQtyValidNumber = !Number.isNaN(parsedQty) && parsedQty > 0;
  const preview = isQtyValidNumber
    ? calculateNewStock(item.stock, type, parsedQty)
    : { valid: false, newStock: item.stock, delta: 0, error: undefined };

  function handleTypeChange(nextType: MutationType) {
    setType(nextType);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!item) {
      setError("Item inventaris tidak ditemukan.");
      return;
    }

    const currentItem = item;

    if (!isQtyValidNumber) {
      setError("Jumlah mutasi harus bilangan bulat positif lebih dari 0.");
      return;
    }

    if (!preview.valid) {
      setError(preview.error ?? "Jumlah mutasi tidak valid.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await recordStockMutation({
          itemId: currentItem.id,
          type,
          quantity: parsedQty,
          notes: notes.trim() || undefined,
        });

        if (!res.ok) {
          setError(res.error ?? "Gagal mencatat mutasi stok.");
          return;
        }

        onSuccess?.();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses mutasi.");
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mutation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 space-y-1 pr-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Mutasi Stok Medis
          </p>
          <h2 id="mutation-modal-title" className="text-xl font-bold tracking-tight text-foreground">
            {item.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
              {item.category}
            </span>
            <span>·</span>
            <span>
              Stok Saat Ini:{" "}
              <strong className="text-foreground">
                {item.stock} {item.unit}
              </strong>
            </span>
            {item.branchName && (
              <>
                <span>·</span>
                <span>{item.branchName}</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tipe Mutasi <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MUTATION_OPTIONS.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleTypeChange(opt.type)}
                    className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? `${opt.colorCls} border-current ring-1 ring-current font-medium`
                        : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                      {isSelected && <Check className="size-3.5 text-current" />}
                    </div>
                    <span className="text-[11px] leading-tight text-muted-foreground mt-0.5">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mutation-quantity" className="text-xs font-semibold text-foreground">
              {type === "ADJUSTMENT"
                ? "Jumlah Stok Aktual (Hasil Opname)"
                : "Jumlah Mutasi"}{" "}
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="mutation-quantity"
                type="number"
                min={1}
                step={1}
                required
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                placeholder={type === "ADJUSTMENT" ? "Contoh: 25" : "Contoh: 5"}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 pr-14 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              <span className="absolute right-3 top-2.5 text-xs font-medium text-muted-foreground pointer-events-none">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Dynamic Preview Box */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Stok Sebelumnya:</span>
              <span className="font-medium text-foreground">
                {item.stock} {item.unit}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-muted-foreground">Perubahan (Delta):</span>
              <span
                className={`font-semibold inline-flex items-center gap-1 ${
                  preview.delta > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : preview.delta < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
                }`}
              >
                {preview.delta > 0 ? (
                  <>
                    <ArrowUp className="size-3" /> +{preview.delta} {item.unit}
                  </>
                ) : preview.delta < 0 ? (
                  <>
                    <ArrowDown className="size-3" /> {preview.delta} {item.unit}
                  </>
                ) : (
                  `0 ${item.unit}`
                )}
              </span>
            </div>
            <div className="my-2 border-t border-border/60" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Estimasi Stok Baru:</span>
              <span
                className={`text-base font-bold ${
                  !isQtyValidNumber
                    ? "text-muted-foreground"
                    : preview.newStock < 0
                    ? "text-destructive"
                    : "text-primary"
                }`}
              >
                {isQtyValidNumber ? `${preview.newStock} ${item.unit}` : "-"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mutation-notes" className="text-xs font-semibold text-foreground">
              Catatan / Keterangan <span className="text-muted-foreground font-normal">(Opsional)</span>
            </label>
            <textarea
              id="mutation-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pemakaian tindakan scaling gigi pasien Tn. Budi"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 rounded-lg border border-border px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || !isQtyValidNumber || !preview.valid}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" />
                  Simpan Mutasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
