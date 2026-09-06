"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Loader2, PackagePlus, Pencil, X } from "lucide-react";

import { createInventoryItem, updateInventoryItem } from "@/lib/actions/inventory";

export const STANDARD_INVENTORY_CATEGORIES = [
  "Anestesi & Farmasi",
  "Bahan Tambal & Restorasi",
  "Habis Pakai & Sterilisasi",
  "Ortodonti",
  "Instrumen Bedah",
  "Umum",
] as const;

export type StandardInventoryCategory = (typeof STANDARD_INVENTORY_CATEGORIES)[number];

export interface ItemModalEditData {
  readonly id: string;
  readonly name: string;
  readonly sku?: string | null;
  readonly category: string;
  readonly stock: number;
  readonly minStock: number;
  readonly unit: string;
  readonly branchId?: string;
}

export interface ItemModalBranchOption {
  readonly id: string;
  readonly name: string;
}

interface ItemModalProps {
  readonly isOpen: boolean;
  readonly itemToEdit?: ItemModalEditData | null;
  readonly branches: readonly ItemModalBranchOption[];
  readonly defaultBranchId?: string;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

export function ItemModal({
  isOpen,
  itemToEdit,
  branches,
  defaultBranchId,
  onClose,
  onSuccess,
}: ItemModalProps) {
  const isEditing = Boolean(itemToEdit);

  const [name, setName] = useState<string>(itemToEdit?.name ?? "");
  const [sku, setSku] = useState<string>(itemToEdit?.sku ?? "");
  const [category, setCategory] = useState<string>(
    itemToEdit?.category ?? STANDARD_INVENTORY_CATEGORIES[0],
  );
  const [branchId, setBranchId] = useState<string>(
    itemToEdit?.branchId ?? defaultBranchId ?? branches[0]?.id ?? "",
  );
  const [initialStockStr, setInitialStockStr] = useState<string>(
    itemToEdit?.stock !== undefined ? String(itemToEdit.stock) : "0",
  );
  const [minStockStr, setMinStockStr] = useState<string>(
    itemToEdit?.minStock !== undefined ? String(itemToEdit.minStock) : "10",
  );
  const [unit, setUnit] = useState<string>(itemToEdit?.unit ?? "pcs");
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

  if (!isOpen) {
    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Nama barang minimal 2 karakter.");
      return;
    }

    const parsedMinStock = parseInt(minStockStr, 10);
    if (Number.isNaN(parsedMinStock) || parsedMinStock < 0) {
      setError("Batas minimum stok harus berupa angka 0 atau lebih.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && itemToEdit) {
          const res = await updateInventoryItem(itemToEdit.id, {
            name: cleanName,
            sku: sku.trim() || undefined,
            category: category.trim() || "Umum",
            minStock: parsedMinStock,
            unit: unit.trim() || "pcs",
          });

          if (!res.ok) {
            setError(res.error ?? "Gagal memperbarui item inventaris.");
            return;
          }
        } else {
          const targetBranchId = branchId || defaultBranchId || branches[0]?.id;
          if (!targetBranchId) {
            setError("Silakan pilih cabang untuk barang ini.");
            return;
          }

          const parsedInitialStock = parseInt(initialStockStr, 10);
          if (Number.isNaN(parsedInitialStock) || parsedInitialStock < 0) {
            setError("Stok awal harus berupa angka 0 atau lebih.");
            return;
          }

          const res = await createInventoryItem({
            branchId: targetBranchId,
            name: cleanName,
            sku: sku.trim() || undefined,
            category: category.trim() || "Umum",
            stock: parsedInitialStock,
            minStock: parsedMinStock,
            unit: unit.trim() || "pcs",
          });

          if (!res.ok) {
            setError(res.error ?? "Gagal menambahkan item inventaris.");
            return;
          }
        }

        onSuccess?.();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan barang.");
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
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
            {isEditing ? "Perbarui Barang" : "Katalog Inventaris"}
          </p>
          <h2 id="item-modal-title" className="text-xl font-bold tracking-tight text-foreground">
            {isEditing ? `Edit: ${itemToEdit?.name}` : "Tambah Barang Baru"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Ubah data katalog medis. Catatan: Untuk mengubah kuantitas stok saat ini, gunakan menu Catat Mutasi."
              : "Daftarkan barang medis konsumabel atau instrumen ke sistem inventaris."}
          </p>
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
          {!isEditing && branches.length > 1 && (
            <div className="space-y-1.5">
              <label htmlFor="item-branch" className="text-xs font-semibold text-foreground">
                Cabang <span className="text-destructive">*</span>
              </label>
              <select
                id="item-branch"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="item-name" className="text-xs font-semibold text-foreground">
              Nama Barang Medis <span className="text-destructive">*</span>
            </label>
            <input
              id="item-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Lidocaine HCl 2% + Epinephrine"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="item-category" className="text-xs font-semibold text-foreground">
                Kategori <span className="text-destructive">*</span>
              </label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {STANDARD_INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="item-sku" className="text-xs font-semibold text-foreground">
                Kode SKU / Barcode <span className="text-muted-foreground font-normal">(Opsional)</span>
              </label>
              <input
                id="item-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Contoh: MED-LIDO-01"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="item-unit" className="text-xs font-semibold text-foreground">
                Satuan Barang <span className="text-destructive">*</span>
              </label>
              <input
                id="item-unit"
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="pcs / ampul / box / tube"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="item-min-stock" className="text-xs font-semibold text-foreground">
                Minimum Stok (Peringatan) <span className="text-destructive">*</span>
              </label>
              <input
                id="item-min-stock"
                type="number"
                min={0}
                required
                value={minStockStr}
                onChange={(e) => setMinStockStr(e.target.value)}
                placeholder="10"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-1.5 rounded-xl border border-border/80 bg-muted/30 p-3.5">
              <label htmlFor="item-initial-stock" className="text-xs font-semibold text-foreground">
                Stok Awal Saat Ini <span className="text-destructive">*</span>
              </label>
              <input
                id="item-initial-stock"
                type="number"
                min={0}
                required
                value={initialStockStr}
                onChange={(e) => setInitialStockStr(e.target.value)}
                placeholder="0"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              <p className="text-[11px] text-muted-foreground">
                Jika diisi &gt; 0, sistem otomatis mencatat log awal restok ke kartu stok.
              </p>
            </div>
          )}

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
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                <>
                  <Pencil className="size-3.5" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <PackagePlus className="size-3.5" />
                  Tambah Barang
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
