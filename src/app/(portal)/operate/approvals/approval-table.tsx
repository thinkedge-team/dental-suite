"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Package,
  PlusCircle,
  Search,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  ApprovalRequestModal,
  ApprovalRequestModalBranch,
  ApprovalRequestModalInventoryItem,
} from "./approval-request-modal";
import {
  ApprovalDetailDrawer,
  ApprovalDetailDrawerItem,
} from "./approval-detail-drawer";
import {
  isProcurementPayload,
  isMaintenancePayload,
  isOtherPayload,
  type ProcurementPayload,
  type MaintenancePayload,
  type OtherPayload,
} from "@/lib/approvals/types";

export type ApprovalTableRowData = ApprovalDetailDrawerItem;

interface ApprovalTableProps {
  readonly items: readonly ApprovalTableRowData[];
  readonly branches: readonly ApprovalRequestModalBranch[];
  readonly inventoryItems?: readonly ApprovalRequestModalInventoryItem[];
  readonly currentBranchId?: string;
  readonly userRole: string;
  readonly userBranchId?: string | null;
}

const STATUS_TABS = [
  { id: "ALL", label: "Semua" },
  { id: "PENDING", label: "Menunggu Review" },
  { id: "APPROVED", label: "Disetujui" },
  { id: "REJECTED", label: "Ditolak" },
] as const;

const TYPE_TABS = [
  { id: "ALL", label: "Semua Tipe" },
  { id: "PROCUREMENT", label: "Pengadaan" },
  { id: "MAINTENANCE", label: "Pemeliharaan" },
  { id: "OTHER", label: "Lainnya" },
] as const;

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

function formatRupiah(amount?: number): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return "-";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ApprovalTable({
  items,
  branches,
  inventoryItems = [],
  currentBranchId,
  userRole,
  userBranchId,
}: ApprovalTableProps) {
  const [activeStatusTab, setActiveStatusTab] = useState<string>("ALL");
  const [activeTypeTab, setActiveTypeTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal / Drawer state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [selectedDrawerItem, setSelectedDrawerItem] = useState<ApprovalDetailDrawerItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Filtered rows computation
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      // 1. Status Filter
      if (activeStatusTab !== "ALL" && item.status !== activeStatusTab) {
        return false;
      }

      // 2. Type Filter
      if (activeTypeTab !== "ALL" && item.type !== activeTypeTab) {
        return false;
      }

      // 3. Search Filter (title, applicant name, branch name)
      if (query.length > 0) {
        const payload = item.payload;
        let itemTitle = "";
        if (item.type === "PROCUREMENT" && isProcurementPayload(payload)) {
          itemTitle = (payload as ProcurementPayload).title;
        } else if (item.type === "MAINTENANCE" && isMaintenancePayload(payload)) {
          itemTitle = (payload as MaintenancePayload).title;
        } else if (item.type === "OTHER" && isOtherPayload(payload)) {
          itemTitle = (payload as OtherPayload).title;
        }

        const applicantName = item.requestedBy.name || item.requestedBy.email || "";
        const branchName = item.branch.name || "";

        const matchTitle = itemTitle.toLowerCase().includes(query);
        const matchApplicant = applicantName.toLowerCase().includes(query);
        const matchBranch = branchName.toLowerCase().includes(query);

        if (!matchTitle && !matchApplicant && !matchBranch) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeStatusTab, activeTypeTab, searchQuery]);

  function handleOpenDetail(item: ApprovalTableRowData) {
    setSelectedDrawerItem(item);
    setIsDetailDrawerOpen(true);
  }

  function handleOpenNewRequest() {
    setIsRequestModalOpen(true);
  }

  // Check if current user can review selected item
  const isDirector = userRole === "DIRECTOR" || userRole === "SUPER_ADMIN";
  const canReviewCurrentItem = selectedDrawerItem
    ? isDirector || (userRole === "MANAGER" && Boolean(userBranchId) && userBranchId === selectedDrawerItem.branch.id)
    : false;

  return (
    <div className="space-y-4">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul pengajuan, pemohon, atau cabang..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Hapus
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenNewRequest}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          + Buat Pengajuan
        </button>
      </div>

      {/* Tabs Filter Bar (Status & Type) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatusTab(tab.id)}
                className={`inline-flex shrink-0 items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-muted/40 p-1">
          {TYPE_TABS.map((tab) => {
            const isActive = activeTypeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTypeTab(tab.id)}
                className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Judul & Waktu (WIB)</th>
                <th className="px-4 py-3">Pemohon & Cabang</th>
                <th className="px-4 py-3">Tipe Permohonan</th>
                <th className="px-4 py-3">Urgensi</th>
                <th className="px-4 py-3">Estimasi Biaya</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <FileText className="mx-auto size-8 opacity-40 mb-2" />
                    <p className="text-sm font-medium text-foreground">Tidak ada permohonan pengajuan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {searchQuery
                        ? "Tidak ada permohonan yang sesuai dengan filter pencarian."
                        : "Belum ada permohonan persetujuan terdaftar pada filter ini."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const payload = item.payload;
                  let itemTitle = `Pengajuan #${item.id.slice(0, 8)}`;
                  let urgency: "NORMAL" | "URGENT" = "NORMAL";
                  let estCost: number | undefined = undefined;

                  if (item.type === "PROCUREMENT" && isProcurementPayload(payload)) {
                    const proc = payload as ProcurementPayload;
                    itemTitle = proc.title;
                    urgency = proc.urgency;
                    estCost = proc.estimatedCost;
                  } else if (item.type === "MAINTENANCE" && isMaintenancePayload(payload)) {
                    const maint = payload as MaintenancePayload;
                    itemTitle = maint.title;
                    urgency = maint.urgency;
                    estCost = maint.estimatedCost;
                  } else if (item.type === "OTHER" && isOtherPayload(payload)) {
                    const other = payload as OtherPayload;
                    itemTitle = other.title;
                    estCost = other.estimatedCost;
                  }

                  const isUrgent = urgency === "URGENT";

                  return (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      {/* Judul & Waktu */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground leading-snug">
                          {itemTitle}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {formatWIB(item.createdAt)}
                        </div>
                      </td>

                      {/* Pemohon & Cabang */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {item.requestedBy.name || item.requestedBy.email || "Staf"}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {item.branch.name} · <span className="font-mono">{item.requestedBy.role}</span>
                        </div>
                      </td>

                      {/* Tipe Permohonan */}
                      <td className="px-4 py-3">
                        {item.type === "PROCUREMENT" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                            <Package className="size-3" />
                            Pengadaan
                          </span>
                        )}
                        {item.type === "MAINTENANCE" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                            <Wrench className="size-3" />
                            Pemeliharaan
                          </span>
                        )}
                        {item.type === "OTHER" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:text-purple-300">
                            <FileText className="size-3" />
                            Lainnya
                          </span>
                        )}
                      </td>

                      {/* Urgensi */}
                      <td className="px-4 py-3">
                        {isUrgent ? (
                          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            Mendesak
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-muted-foreground">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Estimasi Biaya */}
                      <td className="px-4 py-3 font-mono text-xs">
                        {estCost ? formatRupiah(estCost) : "-"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {item.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            <Clock className="size-3" />
                            Menunggu
                          </span>
                        )}
                        {item.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" />
                            Disetujui
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                            <XCircle className="size-3" />
                            Ditolak
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                        >
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Menampilkan {filteredItems.length} dari {items.length} permohonan</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Menunggu: {items.filter(i => i.status === "PENDING").length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Disetujui: {items.filter(i => i.status === "APPROVED").length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" /> Ditolak: {items.filter(i => i.status === "REJECTED").length}
            </span>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ApprovalRequestModal
        isOpen={isRequestModalOpen}
        branches={branches}
        inventoryItems={inventoryItems}
        defaultBranchId={currentBranchId}
        onClose={() => setIsRequestModalOpen(false)}
      />

      <ApprovalDetailDrawer
        item={selectedDrawerItem}
        isOpen={isDetailDrawerOpen}
        canReview={canReviewCurrentItem}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedDrawerItem(null);
        }}
      />
    </div>
  );
}
