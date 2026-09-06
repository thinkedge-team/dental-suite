"use client";

import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  History,
  Info,
  RefreshCw,
  User,
  X,
} from "lucide-react";

export type InventoryLogType = "USAGE" | "RESTOCK" | "ADJUSTMENT" | "DAMAGED";

export interface StockLogEntry {
  readonly id: string;
  readonly type: InventoryLogType;
  readonly quantity: number;
  readonly previousStock: number;
  readonly currentStock: number;
  readonly notes?: string | null;
  readonly createdAt: string | Date;
  readonly user: {
    readonly name?: string | null;
    readonly email?: string | null;
  };
}

export interface StockLogDrawerItem {
  readonly id: string;
  readonly name: string;
  readonly sku?: string | null;
  readonly category: string;
  readonly stock: number;
  readonly minStock: number;
  readonly unit: string;
  readonly logs?: readonly StockLogEntry[];
}

interface StockLogDrawerProps {
  readonly item: StockLogDrawerItem | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function formatWIB(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date) + " WIB";
}

const TYPE_CONFIG: Record<
  InventoryLogType,
  {
    label: string;
    badgeCls: string;
    icon: typeof ArrowUpRight;
  }
> = {
  RESTOCK: {
    label: "Restok Masuk",
    badgeCls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    icon: ArrowUpRight,
  },
  USAGE: {
    label: "Pemakaian Tindakan",
    badgeCls: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    icon: ArrowDownRight,
  },
  ADJUSTMENT: {
    label: "Koreksi Opname",
    badgeCls: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    icon: RefreshCw,
  },
  DAMAGED: {
    label: "Rusak / Expired",
    badgeCls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    icon: AlertTriangle,
  },
};

export function StockLogDrawer({ item, isOpen, onClose }: StockLogDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

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

  const logs = item.logs ?? [];
  const isLowStock = item.stock <= item.minStock && item.stock > 0;
  const isOutOfStock = item.stock === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          className="relative w-screen max-w-md border-l border-border bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <History className="size-4" />
              </div>
              <div>
                <h2 id="drawer-title" className="text-base font-bold text-foreground leading-tight">
                  Riwayat Mutasi Stok
                </h2>
                <p className="text-[11px] text-muted-foreground">Kartu stok audit trail immutable</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup drawer"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Item Summary Card */}
          <div className="border-b border-border bg-muted/30 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-foreground leading-snug">{item.name}</h3>
                {item.sku && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                )}
              </div>

              {/* Current Stock Pill */}
              <div
                className={`flex flex-col items-end shrink-0 rounded-xl border px-3 py-1.5 ${
                  isOutOfStock
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : isLowStock
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {isOutOfStock ? "Habis" : isLowStock ? "Menipis" : "Stok Aman"}
                </span>
                <span className="text-base font-extrabold leading-tight">
                  {item.stock} {item.unit}
                </span>
                <span className="text-[10px] text-muted-foreground">Min: {item.minStock}</span>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Info className="size-8 opacity-40 mb-2" />
                <p className="text-sm font-medium text-foreground">Belum ada riwayat mutasi</p>
                <p className="text-xs max-w-xs mt-1">
                  Mutasi stok pemakaian, restok, opname, atau kerusakan akan tercatat otomatis di sini.
                </p>
              </div>
            ) : (
              logs.map((log) => {
                const config = TYPE_CONFIG[log.type] ?? {
                  label: log.type,
                  badgeCls: "bg-muted text-foreground border-border",
                  icon: History,
                };
                const IconComponent = config.icon;
                const isPositive = log.quantity > 0;
                const isNegative = log.quantity < 0;

                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-colors hover:border-border"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${config.badgeCls}`}
                      >
                        <IconComponent className="size-3" />
                        {config.label}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isNegative
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isPositive ? `+${log.quantity}` : `${log.quantity}`} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground py-1 border-t border-border/50">
                      <span>Perubahan Stok:</span>
                      <span className="font-mono font-medium text-foreground">
                        {log.previousStock} → {log.currentStock} {item.unit}
                      </span>
                    </div>

                    {log.notes && (
                      <div className="mt-2 rounded-lg bg-muted/40 p-2 text-xs text-foreground">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-0.5">
                          Keterangan
                        </span>
                        {log.notes}
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="size-3" />
                        <span className="font-medium text-foreground">
                          {log.user.name || log.user.email || "Petugas"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{formatWIB(log.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
