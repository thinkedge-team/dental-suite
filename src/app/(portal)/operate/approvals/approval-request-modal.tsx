"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Loader2, Package, Wrench, FileText, X } from "lucide-react";
import { submitApprovalRequest } from "@/lib/actions/approvals";
import type { ApprovalPayload, ProcurementPayload, MaintenancePayload, OtherPayload } from "@/lib/approvals/types";

export interface ApprovalRequestModalBranch {
  readonly id: string;
  readonly name: string;
}

export interface ApprovalRequestModalInventoryItem {
  readonly id: string;
  readonly name: string;
  readonly sku?: string | null;
  readonly branchId: string;
  readonly stock: number;
  readonly minStock: number;
  readonly unit: string;
}

export interface ApprovalRequestModalPrefilledItem {
  readonly branchId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly unit: string;
}

interface ApprovalRequestModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly branches: readonly ApprovalRequestModalBranch[];
  readonly inventoryItems?: readonly ApprovalRequestModalInventoryItem[];
  readonly prefilledItem?: ApprovalRequestModalPrefilledItem | null;
  readonly defaultBranchId?: string;
  readonly onSuccess?: () => void;
}

type TabType = "PROCUREMENT" | "MAINTENANCE" | "OTHER";

export function ApprovalRequestModal({
  isOpen,
  onClose,
  branches,
  inventoryItems = [],
  prefilledItem,
  defaultBranchId,
  onSuccess,
}: ApprovalRequestModalProps) {
  // Resolve initial tab & branch
  const initialBranchId = prefilledItem?.branchId ?? defaultBranchId ?? branches[0]?.id ?? "";
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialBranchId);
  const [activeTab, setActiveTab] = useState<TabType>("PROCUREMENT");

  // Tab 1: Procurement form state
  const [selectedItemId, setSelectedItemId] = useState<string>(prefilledItem?.itemId ?? "");
  const [customItemName, setCustomItemName] = useState<string>(prefilledItem?.itemName ?? "");
  const [procUnit, setProcUnit] = useState<string>(prefilledItem?.unit ?? "pcs");
  const [procQuantity, setProcQuantity] = useState<string>("1");
  const [procEstimatedCost, setProcEstimatedCost] = useState<string>("");
  const [procUrgency, setProcUrgency] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [procNotes, setProcNotes] = useState<string>("");

  // Tab 2: Maintenance form state
  const [maintTitle, setMaintTitle] = useState<string>("");
  const [maintEquipmentName, setMaintEquipmentName] = useState<string>("");
  const [maintUrgency, setMaintUrgency] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [maintEstimatedCost, setMaintEstimatedCost] = useState<string>("");
  const [maintDescription, setMaintDescription] = useState<string>("");

  // Tab 3: Other form state
  const [otherTitle, setOtherTitle] = useState<string>("");
  const [otherEstimatedCost, setOtherEstimatedCost] = useState<string>("");
  const [otherDescription, setOtherDescription] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [prevPrefilledItem, setPrevPrefilledItem] = useState(prefilledItem);
  if (prefilledItem !== prevPrefilledItem) {
    setPrevPrefilledItem(prefilledItem);
    if (prefilledItem) {
      setSelectedBranchId(prefilledItem.branchId);
      setSelectedItemId(prefilledItem.itemId);
      setCustomItemName(prefilledItem.itemName);
      setProcUnit(prefilledItem.unit);
      setActiveTab("PROCUREMENT");
    }
  }

  // Handle escape key
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

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    const timer = setTimeout(() => {
      window.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Filter inventory items for selected branch
  const branchInventoryItems = inventoryItems.filter(
    (item) => item.branchId === selectedBranchId
  );

  function handleInventoryItemSelect(itemId: string) {
    setSelectedItemId(itemId);
    if (itemId === "custom" || itemId === "") {
      // keep or clear custom
      return;
    }
    const found = branchInventoryItems.find((i) => i.id === itemId);
    if (found) {
      setCustomItemName(found.name);
      setProcUnit(found.unit);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedBranchId) {
      setError("Pilih cabang pengajuan terlebih dahulu.");
      return;
    }

    let payload: ApprovalPayload;

    if (activeTab === "PROCUREMENT") {
      const isCustom = selectedItemId === "custom" || !selectedItemId;
      const itemName = isCustom ? customItemName.trim() : (branchInventoryItems.find((i) => i.id === selectedItemId)?.name ?? customItemName.trim());
      const unit = procUnit.trim() || "pcs";
      const quantity = parseInt(procQuantity, 10);
      const estCost = procEstimatedCost.trim() ? parseFloat(procEstimatedCost) : undefined;

      if (!itemName) {
        setError("Nama barang pengadaan wajib diisi.");
        return;
      }
      if (Number.isNaN(quantity) || quantity <= 0) {
        setError("Jumlah barang harus berupa angka positif lebih dari 0.");
        return;
      }
      if (estCost !== undefined && (Number.isNaN(estCost) || estCost < 0)) {
        setError("Estimasi biaya harus berupa angka non-negatif.");
        return;
      }

      const selectedItem = !isCustom ? branchInventoryItems.find((i) => i.id === selectedItemId) : undefined;

      const procData: ProcurementPayload = {
        title: `Pengadaan: ${itemName} (${quantity} ${unit})`,
        itemId: !isCustom && selectedItemId ? selectedItemId : undefined,
        itemName,
        currentStock: selectedItem?.stock,
        minStock: selectedItem?.minStock,
        unit,
        quantity,
        estimatedCost: estCost,
        urgency: procUrgency,
        notes: procNotes.trim() || undefined,
      };

      payload = procData;
    } else if (activeTab === "MAINTENANCE") {
      const equipName = maintEquipmentName.trim();
      const desc = maintDescription.trim();
      const title = maintTitle.trim() || `Pemeliharaan: ${equipName}`;
      const estCost = maintEstimatedCost.trim() ? parseFloat(maintEstimatedCost) : undefined;

      if (!equipName) {
        setError("Nama alat / unit yang memerlukan perbaikan wajib diisi.");
        return;
      }
      if (!desc) {
        setError("Deskripsi kendala atau perbaikan wajib diisi.");
        return;
      }
      if (estCost !== undefined && (Number.isNaN(estCost) || estCost < 0)) {
        setError("Estimasi biaya harus berupa angka non-negatif.");
        return;
      }

      const maintData: MaintenancePayload = {
        title,
        equipmentName: equipName,
        urgency: maintUrgency,
        estimatedCost: estCost,
        description: desc,
      };

      payload = maintData;
    } else {
      const title = otherTitle.trim();
      const desc = otherDescription.trim();
      const estCost = otherEstimatedCost.trim() ? parseFloat(otherEstimatedCost) : undefined;

      if (!title) {
        setError("Judul pengajuan wajib diisi.");
        return;
      }
      if (!desc) {
        setError("Deskripsi pengajuan operasional wajib diisi.");
        return;
      }
      if (estCost !== undefined && (Number.isNaN(estCost) || estCost < 0)) {
        setError("Estimasi biaya harus berupa angka non-negatif.");
        return;
      }

      const otherData: OtherPayload = {
        title,
        estimatedCost: estCost,
        description: desc,
      };

      payload = otherData;
    }

    startTransition(async () => {
      const res = await submitApprovalRequest({
        branchId: selectedBranchId,
        type: activeTab,
        payload,
      });

      if (!res.ok) {
        setError(res.error ?? "Gagal mengajukan permohonan.");
        return;
      }

      onSuccess?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-request-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id="approval-request-modal-title" className="text-base font-bold text-foreground">
              Buat Pengajuan Persetujuan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kirim permohonan pengadaan barang, servis alat, atau kebutuhan operasional klinik.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-muted/30 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("PROCUREMENT");
              setError(null);
            }}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === "PROCUREMENT"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="size-3.5" />
            <span>Pengadaan Barang</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("MAINTENANCE");
              setError(null);
            }}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === "MAINTENANCE"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="size-3.5" />
            <span>Pemeliharaan Alat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("OTHER");
              setError(null);
            }}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === "OTHER"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Lainnya</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Branch Selector */}
          <div>
            <label htmlFor="approval-branch" className="block text-xs font-semibold text-foreground mb-1">
              Cabang Klinik <span className="text-destructive">*</span>
            </label>
            <select
              id="approval-branch"
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setSelectedItemId("");
              }}
              disabled={isPending || branches.length <= 1}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tab 1: Procurement Form */}
          {activeTab === "PROCUREMENT" && (
            <div className="space-y-3.5">
              <div>
                <label htmlFor="proc-item-select" className="block text-xs font-semibold text-foreground mb-1">
                  Pilih dari Inventaris Cabang (Opsional)
                </label>
                <select
                  id="proc-item-select"
                  value={selectedItemId}
                  onChange={(e) => handleInventoryItemSelect(e.target.value)}
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="">-- Barang Baru / Tidak Ada di List --</option>
                  {branchInventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stok: {item.stock} {item.unit}, Min: {item.minStock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="proc-item-name" className="block text-xs font-semibold text-foreground mb-1">
                  Nama Barang <span className="text-destructive">*</span>
                </label>
                <input
                  id="proc-item-name"
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="Contoh: Lidocaine HCl 2% Ampul"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="proc-quantity" className="block text-xs font-semibold text-foreground mb-1">
                    Jumlah Diminta <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="proc-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={procQuantity}
                    onChange={(e) => setProcQuantity(e.target.value)}
                    placeholder="Contoh: 30"
                    disabled={isPending}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div>
                  <label htmlFor="proc-unit" className="block text-xs font-semibold text-foreground mb-1">
                    Satuan <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="proc-unit"
                    type="text"
                    value={procUnit}
                    onChange={(e) => setProcUnit(e.target.value)}
                    placeholder="ampul / box / botol / pcs"
                    disabled={isPending}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="proc-cost" className="block text-xs font-semibold text-foreground mb-1">
                  Estimasi Biaya Total (Rp)
                </label>
                <input
                  id="proc-cost"
                  type="number"
                  min="0"
                  step="500"
                  value={procEstimatedCost}
                  onChange={(e) => setProcEstimatedCost(e.target.value)}
                  placeholder="Contoh: 450000"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tingkat Urgensi
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProcUrgency("NORMAL")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                      procUrgency === "NORMAL"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Normal (Rutin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProcUrgency("URGENT")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                      procUrgency === "URGENT"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Mendesak (Kritis)
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="proc-notes" className="block text-xs font-semibold text-foreground mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  id="proc-notes"
                  rows={2}
                  value={procNotes}
                  onChange={(e) => setProcNotes(e.target.value)}
                  placeholder="Keterangan keperluan tindakan atau supplier rujukan..."
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Maintenance Form */}
          {activeTab === "MAINTENANCE" && (
            <div className="space-y-3.5">
              <div>
                <label htmlFor="maint-title" className="block text-xs font-semibold text-foreground mb-1">
                  Judul Permohonan
                </label>
                <input
                  id="maint-title"
                  type="text"
                  value={maintTitle}
                  onChange={(e) => setMaintTitle(e.target.value)}
                  placeholder="Contoh: Perbaikan Selang Suction Dental Unit 2"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label htmlFor="maint-equipment" className="block text-xs font-semibold text-foreground mb-1">
                  Nama Alat / Unit <span className="text-destructive">*</span>
                </label>
                <input
                  id="maint-equipment"
                  type="text"
                  value={maintEquipmentName}
                  onChange={(e) => setMaintEquipmentName(e.target.value)}
                  placeholder="Contoh: Dental Unit Kursi 2 / Autoclave B"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tingkat Urgensi
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMaintUrgency("NORMAL")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                      maintUrgency === "NORMAL"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Normal (Servis Rutin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaintUrgency("URGENT")}
                    className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                      maintUrgency === "URGENT"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Mendesak (Alat Rusak/Macet)
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="maint-cost" className="block text-xs font-semibold text-foreground mb-1">
                  Estimasi Biaya Servis / Sparepart (Rp)
                </label>
                <input
                  id="maint-cost"
                  type="number"
                  min="0"
                  step="1000"
                  value={maintEstimatedCost}
                  onChange={(e) => setMaintEstimatedCost(e.target.value)}
                  placeholder="Contoh: 350000"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label htmlFor="maint-desc" className="block text-xs font-semibold text-foreground mb-1">
                  Deskripsi Kendala & Rincian <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="maint-desc"
                  rows={3}
                  value={maintDescription}
                  onChange={(e) => setMaintDescription(e.target.value)}
                  placeholder="Jelaskan kendala alat, gejala kerusakan, atau kebutuhan pergantian suku cadang..."
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Other Form */}
          {activeTab === "OTHER" && (
            <div className="space-y-3.5">
              <div>
                <label htmlFor="other-title" className="block text-xs font-semibold text-foreground mb-1">
                  Judul Pengajuan <span className="text-destructive">*</span>
                </label>
                <input
                  id="other-title"
                  type="text"
                  value={otherTitle}
                  onChange={(e) => setOtherTitle(e.target.value)}
                  placeholder="Contoh: Penggantian Lampu Ruang Tunggu"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label htmlFor="other-cost" className="block text-xs font-semibold text-foreground mb-1">
                  Estimasi Biaya (Rp)
                </label>
                <input
                  id="other-cost"
                  type="number"
                  min="0"
                  step="1000"
                  value={otherEstimatedCost}
                  onChange={(e) => setOtherEstimatedCost(e.target.value)}
                  placeholder="Contoh: 150000"
                  disabled={isPending}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label htmlFor="other-desc" className="block text-xs font-semibold text-foreground mb-1">
                  Deskripsi Pengajuan <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="other-desc"
                  rows={3}
                  value={otherDescription}
                  onChange={(e) => setOtherDescription(e.target.value)}
                  placeholder="Rincian kebutuhan operasional klinik yang diajukan..."
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-9 rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>Kirim Permohonan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
