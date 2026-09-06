"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  History,
  Package,
  PackagePlus,
  Pencil,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";

import {
  ApprovalRequestModal,
  ApprovalRequestModalPrefilledItem,
} from "../approvals/approval-request-modal";
import {
  ItemModal,
  ItemModalBranchOption,
  ItemModalEditData,
} from "./item-modal";
import { MutationModal, MutationModalItem } from "./mutation-modal";
import { StockLogDrawer, StockLogDrawerItem } from "./stock-log-drawer";

export interface InventoryTableRowData extends StockLogDrawerItem {
  readonly branchId: string;
  readonly branchName?: string;
  readonly createdAt: string | Date;
  readonly updatedAt: string | Date;
}

interface InventoryTableProps {
  readonly items: readonly InventoryTableRowData[];
  readonly branches?: readonly ItemModalBranchOption[];
  readonly currentBranchId?: string;
  readonly isDirector?: boolean;
}

const CATEGORY_TABS = [
  "Semua",
  "Anestesi & Farmasi",
  "Bahan Tambal & Restorasi",
  "Habis Pakai & Sterilisasi",
  "Ortodonti",
  "Instrumen Bedah",
] as const;

export function InventoryTable({
  items,
  branches = [],
  currentBranchId,
  isDirector = false,
}: InventoryTableProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal / Drawer state
  const [mutationItem, setMutationItem] = useState<MutationModalItem | null>(null);
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);

  const [editItem, setEditItem] = useState<ItemModalEditData | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [logDrawerItem, setLogDrawerItem] = useState<StockLogDrawerItem | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  const [procurementPrefill, setProcurementPrefill] = useState<ApprovalRequestModalPrefilledItem | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Filtered items computation
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      // 1. Category Tab Filter
      if (activeCategory !== "Semua" && item.category !== activeCategory) {
        return false;
      }

      // 2. Search query filter (name or sku)
      if (query.length > 0) {
        const matchName = item.name.toLowerCase().includes(query);
        const matchSku = item.sku ? item.sku.toLowerCase().includes(query) : false;
        if (!matchName && !matchSku) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeCategory, searchQuery]);

  // Handler helpers
  function handleOpenMutation(item: InventoryTableRowData) {
    setMutationItem({
      id: item.id,
      name: item.name,
      category: item.category,
      stock: item.stock,
      unit: item.unit,
      branchName: item.branchName,
    });
    setIsMutationModalOpen(true);
  }

  function handleOpenEdit(item: InventoryTableRowData) {
    setEditItem({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      minStock: item.minStock,
      unit: item.unit,
      branchId: item.branchId,
    });
    setIsItemModalOpen(true);
  }

  function handleOpenAdd() {
    setEditItem(null);
    setIsItemModalOpen(true);
  }

  function handleOpenLogs(item: InventoryTableRowData) {
    setLogDrawerItem(item);
    setIsLogDrawerOpen(true);
  }

  function handleOpenProcurement(item: InventoryTableRowData) {
    setProcurementPrefill({
      branchId: item.branchId,
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
    });
    setIsApprovalModalOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang atau kode SKU..."
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
          onClick={handleOpenAdd}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <PackagePlus className="size-4" />
          + Tambah Barang
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/70 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveCategory(tab)}
              className={`inline-flex shrink-0 items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nama & SKU</th>
                <th className="px-4 py-3">Kategori</th>
                {isDirector && <th className="px-4 py-3">Cabang</th>}
                <th className="px-4 py-3">Stok Saat Ini</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={isDirector ? 6 : 5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <Package className="mx-auto size-8 opacity-40 mb-2" />
                    <p className="text-sm font-medium text-foreground">Tidak ada barang inventaris</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {searchQuery
                        ? "Tidak ada item yang cocok dengan pencarian kata kunci tersebut."
                        : "Kategori ini belum memiliki data inventaris terdaftar."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock <= item.minStock;
                  const isSafe = item.stock > item.minStock;

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Name & SKU */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground leading-snug">
                          {item.name}
                        </div>
                        {item.sku ? (
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            SKU: {item.sku}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                            Tanpa SKU
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {item.category}
                        </span>
                      </td>

                      {/* Branch (if director) */}
                      {isDirector && (
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.branchName ?? "-"}
                        </td>
                      )}

                      {/* Stock Level */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-foreground">
                          {item.stock} {item.unit}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Min: {item.minStock} {item.unit}
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td className="px-4 py-3">
                        {isOutOfStock && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                            <XCircle className="size-3" />
                            Habis
                          </span>
                        )}
                        {isLowStock && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            <AlertTriangle className="size-3" />
                            Menipis
                          </span>
                        )}
                        {isSafe && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" />
                            Aman
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenProcurement(item)}
                            title="Ajukan Pengadaan Barang"
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                          >
                            <ShoppingCart className="size-3" />
                            <span>Pengadaan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenMutation(item)}
                            title="Catat Mutasi Stok"
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                          >
                            <ArrowUpDown className="size-3" />
                            <span>Catat Mutasi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenLogs(item)}
                            title="Lihat Riwayat Mutasi"
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                          >
                            <History className="size-3" />
                            <span>Riwayat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Data Barang"
                            className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="size-3" />
                            <span className="sr-only">Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Info */}
        <div className="border-t border-border bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Menampilkan {filteredItems.length} dari {items.length} barang inventaris</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" /> Habis: {items.filter(i => i.stock === 0).length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Menipis: {items.filter(i => i.stock > 0 && i.stock <= i.minStock).length}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Aman: {items.filter(i => i.stock > i.minStock).length}
            </span>
          </div>
        </div>
      </div>

      {/* Modals and Drawers */}
      <MutationModal
        item={mutationItem}
        isOpen={isMutationModalOpen}
        onClose={() => {
          setIsMutationModalOpen(false);
          setMutationItem(null);
        }}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        itemToEdit={editItem}
        branches={branches}
        defaultBranchId={currentBranchId}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditItem(null);
        }}
      />

      <StockLogDrawer
        item={logDrawerItem}
        isOpen={isLogDrawerOpen}
        onClose={() => {
          setIsLogDrawerOpen(false);
          setLogDrawerItem(null);
        }}
      />

      <ApprovalRequestModal
        isOpen={isApprovalModalOpen}
        branches={branches}
        inventoryItems={items.map((i) => ({
          id: i.id,
          name: i.name,
          sku: i.sku,
          branchId: i.branchId,
          stock: i.stock,
          minStock: i.minStock,
          unit: i.unit,
        }))}
        prefilledItem={procurementPrefill}
        defaultBranchId={currentBranchId}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setProcurementPrefill(null);
        }}
      />
    </div>
  );
}
