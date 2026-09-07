import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Lock,
  Package,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWibDayBounds } from "@/lib/appointments/day-bounds";
import { getActiveBranchId } from "@/lib/branch-context";
import {
  InventoryTable,
  InventoryTableRowData,
} from "./inventory-table";
import { InventoryLogType } from "./stock-log-drawer";

interface InventoryPageProps {
  searchParams: Promise<{
    branch?: string;
  }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { branch } = await searchParams;
  const organizationId = session.user.organizationId;
  const role = session.user.role;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";
  const userBranchId = session.user.branchId;

  // 1. Verify moduleOperate permission on Organization
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { moduleOperate: true, name: true },
  });

  if (!org?.moduleOperate) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lock className="size-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Akses Modul OPERATE Terkunci
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Klinik <span className="font-semibold text-foreground">{org?.name ?? "Anda"}</span> belum mengaktifkan modul OPERATE (Inventaris Medis & Jadwal Shift).
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Kembali ke Dashboard
            </Link>
            {isDirector && (
              <Link
                href="/settings/organization"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Kelola Modul
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch active branches for this organization
  const branches = await prisma.branch.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // 3. Determine active branch filter
  const selectedBranchId = await getActiveBranchId(branch, userBranchId, isDirector);
  const activeBranchFilter = selectedBranchId
    ? { id: selectedBranchId, organizationId, isActive: true }
    : { organizationId, isActive: true };

  // 4. Query inventory items with recent logs and branch relation
  const now = new Date();
  const { start: startOfToday, end: endOfToday } = getWibDayBounds(now);

  const [items, todayMutationsCount] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: {
        branch: activeBranchFilter,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        logs: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.inventoryLog.count({
      where: {
        item: {
          branch: activeBranchFilter,
        },
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),
  ]);

  // 5. Compute KPI Metrics
  const totalItemsCount = items.length;
  const lowStockCount = items.filter(
    (item) => item.stock > 0 && item.stock <= item.minStock
  ).length;
  const outOfStockCount = items.filter((item) => item.stock === 0).length;

  // 6. Map to table row interface
  const tableItems: InventoryTableRowData[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    stock: item.stock,
    minStock: item.minStock,
    unit: item.unit,
    branchId: item.branchId,
    branchName: item.branch?.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    logs: item.logs.map((log) => ({
      id: log.id,
      type: log.type as InventoryLogType,
      quantity: log.quantity,
      previousStock: log.previousStock,
      currentStock: log.currentStock,
      notes: log.notes,
      createdAt: log.createdAt,
      user: {
        name: log.user?.name,
        email: log.user?.email,
      },
    })),
  }));

  const currentEffectiveBranchId =
    selectedBranchId ?? userBranchId ?? branches[0]?.id;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Branch Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventaris Medis
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola stok obat, bahan medis habis pakai, dan pantau mutasi secara real-time.
          </p>
        </div>

        {/* Branch Filter for Director / Multi-branch */}
        {isDirector && branches.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-2xs">
            <Link
              href="/operate/inventory"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                !selectedBranchId
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Semua Cabang</span>
            </Link>
            {branches.map((b) => {
              const isActive = selectedBranchId === b.id;
              return (
                <Link
                  key={b.id}
                  href={`/operate/inventory?branch=${b.id}`}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{b.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Items */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Barang
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {totalItemsCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Item terdaftar aktif
          </p>
        </div>

        {/* Low Stock */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Stok Menipis
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lowStockCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Perlu restock segera
          </p>
        </div>

        {/* Out of Stock */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Stok Habis
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {outOfStockCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Stok bernilai 0
          </p>
        </div>

        {/* Mutations Today */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Mutasi Hari Ini
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpDown className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {todayMutationsCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Log pergerakan stok
          </p>
        </div>
      </div>

      {/* Main Inventory Table */}
      <InventoryTable
        items={tableItems}
        branches={branches}
        currentBranchId={currentEffectiveBranchId}
        isDirector={isDirector}
      />
    </div>
  );
}
