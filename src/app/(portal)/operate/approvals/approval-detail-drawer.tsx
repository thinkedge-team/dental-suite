"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Package,
  ShieldCheck,
  User,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { reviewApprovalRequest, fulfillProcurementToStock } from "@/lib/actions/approvals";
import {
  isProcurementPayload,
  isMaintenancePayload,
  isOtherPayload,
  type ProcurementPayload,
  type MaintenancePayload,
  type OtherPayload,
} from "@/lib/approvals/types";

export interface ApprovalDetailDrawerItem {
  readonly id: string;
  readonly type: "PROCUREMENT" | "MAINTENANCE" | "OTHER";
  readonly status: "PENDING" | "APPROVED" | "REJECTED";
  readonly payload: unknown;
  readonly reviewNote?: string | null;
  readonly createdAt: string | Date;
  readonly updatedAt: string | Date;
  readonly requestedBy: {
    readonly id: string;
    readonly name: string | null;
    readonly email?: string | null;
    readonly role: string;
  };
  readonly branch: {
    readonly id: string;
    readonly name: string;
  };
}

interface ApprovalDetailDrawerProps {
  readonly item: ApprovalDetailDrawerItem | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly canReview?: boolean;
  readonly onSuccess?: () => void;
}

function formatWIB(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB"
  );
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApprovalDetailDrawer({
  item,
  isOpen,
  onClose,
  canReview = false,
  onSuccess,
}: ApprovalDetailDrawerProps) {
  const [reviewNote, setReviewNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & click outside
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

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
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

  if (!isOpen || !item) {
    return null;
  }

  const payload = item.payload;
  const isProc = item.type === "PROCUREMENT" && isProcurementPayload(payload);
  const isMaint = item.type === "MAINTENANCE" && isMaintenancePayload(payload);
  const isOther = item.type === "OTHER" && isOtherPayload(payload);

  const procPayload = isProc ? (payload as ProcurementPayload) : null;
  const maintPayload = isMaint ? (payload as MaintenancePayload) : null;
  const otherPayload = isOther ? (payload as OtherPayload) : null;

  const title =
    procPayload?.title ||
    maintPayload?.title ||
    otherPayload?.title ||
    `Permohonan #${item.id.slice(0, 8)}`;

  const urgency =
    procPayload?.urgency ||
    maintPayload?.urgency ||
    "NORMAL";

  const isUrgent = urgency === "URGENT";
  const isPendingStatus = item.status === "PENDING";
  const isApprovedStatus = item.status === "APPROVED";
  const isRejectedStatus = item.status === "REJECTED";

  const isFulfilled = Boolean(procPayload?.fulfilledAt);

  function handleReviewAction(status: "APPROVED" | "REJECTED") {
    if (!item) return;
    setError(null);

    startTransition(async () => {
      const res = await reviewApprovalRequest({
        requestId: item.id,
        status,
        reviewNote: reviewNote.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error ?? "Gagal memproses review permohonan.");
        return;
      }

      onSuccess?.();
      onClose();
    });
  }

  function handleFulfillStock() {
    if (!item) return;
    setError(null);

    startTransition(async () => {
      const res = await fulfillProcurementToStock({
        requestId: item.id,
      });

      if (!res.ok) {
        setError(res.error ?? "Gagal memproses barang ke inventaris.");
        return;
      }

      onSuccess?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-drawer-title"
        className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="border-b border-border p-6 bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type Badge */}
                {item.type === "PROCUREMENT" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    <Package className="size-3" />
                    Pengadaan
                  </span>
                )}
                {item.type === "MAINTENANCE" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Wrench className="size-3" />
                    Pemeliharaan
                  </span>
                )}
                {item.type === "OTHER" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                    <FileText className="size-3" />
                    Lainnya
                  </span>
                )}

                {/* Status Pill */}
                {isPendingStatus && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Clock className="size-3" />
                    Menunggu Review
                  </span>
                )}
                {isApprovedStatus && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="size-3" />
                    Disetujui
                  </span>
                )}
                {isRejectedStatus && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    <XCircle className="size-3" />
                    Ditolak
                  </span>
                )}

                {/* Urgency Badge */}
                {isUrgent && (
                  <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Mendesak
                  </span>
                )}
              </div>

              <h2 id="approval-drawer-title" className="text-lg font-bold text-foreground truncate">
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Metadata Card */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5" />
                Pemohon:
              </span>
              <span className="font-semibold text-foreground">
                {item.requestedBy.name || item.requestedBy.email || "Staf"} · {item.requestedBy.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                Cabang:
              </span>
              <span className="font-medium text-foreground">{item.branch.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Waktu Pengajuan:
              </span>
              <span className="font-mono text-foreground">{formatWIB(item.createdAt)}</span>
            </div>
          </div>

          {/* Type-Specific Content */}
          {isProc && procPayload && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rincian Pengadaan Barang
              </h3>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Nama Barang</span>
                  <span className="font-semibold text-foreground">{procPayload.itemName}</span>
                </div>

                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Jumlah Diminta</span>
                  <span className="font-mono font-bold text-foreground">
                    {procPayload.quantity} {procPayload.unit}
                  </span>
                </div>

                {procPayload.currentStock !== undefined && (
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Stok Saat Ini</span>
                    <span className="font-mono text-muted-foreground">
                      {procPayload.currentStock} {procPayload.unit}
                    </span>
                  </div>
                )}

                {procPayload.estimatedCost !== undefined && (
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Estimasi Biaya</span>
                    <span className="font-mono font-bold text-primary">
                      {formatRupiah(procPayload.estimatedCost)}
                    </span>
                  </div>
                )}

                {procPayload.notes && (
                  <div className="space-y-1 pt-1">
                    <span className="text-muted-foreground">Catatan Pemohon:</span>
                    <p className="rounded-lg bg-muted/40 p-2.5 text-foreground leading-relaxed">
                      {procPayload.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Stock Fulfillment Status Banner */}
              {isApprovedStatus && isFulfilled && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-semibold">Stok Sudah Diterima ke Inventaris</p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Diproses pada: {formatWIB(procPayload.fulfilledAt!)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isMaint && maintPayload && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rincian Pemeliharaan Alat
              </h3>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Nama Alat / Unit</span>
                  <span className="font-semibold text-foreground">{maintPayload.equipmentName}</span>
                </div>

                {maintPayload.estimatedCost !== undefined && (
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Estimasi Biaya Servis</span>
                    <span className="font-mono font-bold text-primary">
                      {formatRupiah(maintPayload.estimatedCost)}
                    </span>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <span className="text-muted-foreground">Deskripsi Kendala:</span>
                  <p className="rounded-lg bg-muted/40 p-2.5 text-foreground leading-relaxed whitespace-pre-line">
                    {maintPayload.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isOther && otherPayload && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rincian Permohonan Operasional
              </h3>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3 text-xs">
                {otherPayload.estimatedCost !== undefined && (
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Estimasi Biaya</span>
                    <span className="font-mono font-bold text-primary">
                      {formatRupiah(otherPayload.estimatedCost)}
                    </span>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <span className="text-muted-foreground">Deskripsi Kebutuhan:</span>
                  <p className="rounded-lg bg-muted/40 p-2.5 text-foreground leading-relaxed whitespace-pre-line">
                    {otherPayload.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Decision Notes (if resolved) */}
          {!isPendingStatus && item.reviewNote && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Catatan Review / Keputusan
              </h3>
              <div className="rounded-xl border border-border bg-card p-3.5 text-xs leading-relaxed text-foreground">
                {item.reviewNote}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="border-t border-border bg-muted/30 p-4 space-y-3">
          {/* Action Set 1: Pending & Can Review (Approve / Reject) */}
          {isPendingStatus && canReview && (
            <div className="space-y-3">
              <div>
                <label htmlFor="review-note-input" className="block text-xs font-semibold text-foreground mb-1">
                  Catatan Keputusan (Opsional)
                </label>
                <textarea
                  id="review-note-input"
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Tambahkan instruksi supplier, nomor persetujuan, atau alasan penolakan..."
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground shadow-xs outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction("REJECTED")}
                  disabled={isPending}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-semibold text-destructive shadow-xs transition-colors hover:bg-destructive/20 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-4" />}
                  <span>Tolak Permohonan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction("APPROVED")}
                  disabled={isPending}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  <span>Setujui Permohonan</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Set 2: Approved Procurement with Unfulfilled Stock */}
          {isApprovedStatus && item.type === "PROCUREMENT" && !isFulfilled && (
            <button
              type="button"
              onClick={handleFulfillStock}
              disabled={isPending}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Package className="size-4" />}
              <span>Terima Barang ke Inventaris</span>
            </button>
          )}

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
