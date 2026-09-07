import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWibMonthStart } from "@/lib/appointments/day-bounds";
import { getActiveBranchId } from "@/lib/branch-context";
import { ApprovalTable } from "./approval-table";

interface ApprovalsPageProps {
  searchParams: Promise<{
    branch?: string;
  }>;
}

export default async function ApprovalsPage({ searchParams }: ApprovalsPageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { branch } = await searchParams;
  const organizationId = session.user.organizationId;
  const role = session.user.role ?? "STAFF";
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
            Klinik <span className="font-semibold text-foreground">{org?.name ?? "Anda"}</span> belum mengaktifkan modul OPERATE (Inventaris Medis, Persetujuan & Jadwal Shift).
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

  // 3. Resolve branch scoping
  const activeBranchId = await getActiveBranchId(branch, userBranchId, isDirector);

  // 4. Query approval requests with relations
  const approvalWhereClause = {
    organizationId,
    ...(activeBranchId ? { branchId: activeBranchId } : {}),
  };

  const [rawRequests, inventoryItems] = await Promise.all([
    prisma.approvalRequest.findMany({
      where: approvalWhereClause,
      select: {
        id: true,
        type: true,
        status: true,
        payload: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true,
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.inventoryItem.findMany({
      where: {
        branch: {
          organizationId,
          isActive: true,
          ...(activeBranchId ? { id: activeBranchId } : {}),
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        branchId: true,
        stock: true,
        minStock: true,
        unit: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  // 5. Compute KPI Metrics using getWibMonthStart
  const startOfMonth = getWibMonthStart();

  const pendingCount = rawRequests.filter((r) => r.status === "PENDING").length;
  const approvedThisMonthCount = rawRequests.filter(
    (r) => r.status === "APPROVED" && r.createdAt >= startOfMonth
  ).length;
  const rejectedThisMonthCount = rawRequests.filter(
    (r) => r.status === "REJECTED" && r.createdAt >= startOfMonth
  ).length;
  const totalRequestsCount = rawRequests.length;

  const currentEffectiveBranchId = activeBranchId ?? branches[0]?.id;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Branch Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Persetujuan & Request Operasional
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pengajuan dan persetujuan pengadaan barang, pemeliharaan alat, serta kebutuhan operasional lainnya.
          </p>
        </div>

        {activeBranchId && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground">
            <Building2 className="size-3.5 text-primary" />
            <span>Cabang {branches.find((b) => b.id === activeBranchId)?.name ?? activeBranchId}</span>
          </div>
        )}
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Menunggu Review */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menunggu Review
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Perlu ditinjau
          </p>
        </div>

        {/* Disetujui Bulan Ini */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Disetujui Bulan Ini
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {approvedThisMonthCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Disetujui pada bulan berjalan
          </p>
        </div>

        {/* Ditolak Bulan Ini */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ditolak Bulan Ini
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {rejectedThisMonthCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Ditolak pada bulan berjalan
          </p>
        </div>

        {/* Total Pengajuan */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Pengajuan
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {totalRequestsCount}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Seluruh riwayat pengajuan
          </p>
        </div>
      </div>

      {/* Main Approvals Table */}
      <ApprovalTable
        items={rawRequests}
        branches={branches}
        inventoryItems={inventoryItems}
        currentBranchId={currentEffectiveBranchId}
        userRole={role}
        userBranchId={userBranchId}
      />
    </div>
  );
}
