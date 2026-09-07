import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileSpreadsheet,
  CalendarDays,
  Receipt,
  Package,
  Lock,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveBranchId } from "@/lib/branch-context";
import { ReportCard } from "./report-card";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;
  const role = session.user.role;
  const isDirectorOrSuperAdmin = role === "DIRECTOR" || role === "SUPER_ADMIN";
  const userBranchId = session.user.branchId;

  // 1. Verify moduleIntelligence on Organization
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { moduleIntelligence: true, name: true },
  });

  if (!org?.moduleIntelligence) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lock className="size-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Akses Modul INTELLIGENCE Terkunci
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Klinik <span className="font-semibold text-foreground">{org?.name ?? "Anda"}</span> belum mengaktifkan modul INTELLIGENCE (Laporan & Ekspor CSV).
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Kembali ke Dashboard
            </Link>
            {isDirectorOrSuperAdmin && (
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

  // 2. Query active branches for the organization
  const branches = await prisma.branch.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Query user's branch name if not director/superadmin
  let userBranchName: string | null = null;
  if (userBranchId) {
    const userBranch = await prisma.branch.findUnique({
      where: { id: userBranchId },
      select: { name: true },
    });
    userBranchName = userBranch?.name ?? null;
  }

  const activeBranchId = await getActiveBranchId(undefined, userBranchId, isDirectorOrSuperAdmin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <FileSpreadsheet className="size-6 text-primary" />
          Pusat Laporan & Ekspor CSV
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ekspor data operasional dan klinis dalam format CSV kompatibel Excel (UTF-8 BOM)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Report Card 1: Janji Temu */}
        <ReportCard
          type="appointments"
          title="Laporan Janji Temu Pasien"
          description="Reservasi, status kehadiran, dokter penanggung jawab, jadwal praktik, dan catatan janji temu pasien."
          icon={CalendarDays}
          branches={branches}
          isDirectorOrSuperAdmin={isDirectorOrSuperAdmin}
          userBranchName={userBranchName}
          userBranchId={userBranchId}
          initialBranchId={activeBranchId}
        />

        {/* Report Card 2: Kunjungan & Pendapatan */}
        <ReportCard
          type="visits"
          title="Laporan Kunjungan & Pendapatan"
          description="Data transaksi billing, metode pembayaran, omzet tindakan medis per layanan, dan rekam tindakan dokter."
          icon={Receipt}
          branches={branches}
          isDirectorOrSuperAdmin={isDirectorOrSuperAdmin}
          userBranchName={userBranchName}
          userBranchId={userBranchId}
          initialBranchId={activeBranchId}
        />

        {/* Report Card 3: Mutasi Inventaris */}
        <ReportCard
          type="inventory"
          title="Laporan Mutasi Inventaris"
          description="Log pemakaian bahan medis, restok distributor, penyesuaian stok opname, dan histori barang rusak."
          icon={Package}
          branches={branches}
          isDirectorOrSuperAdmin={isDirectorOrSuperAdmin}
          userBranchName={userBranchName}
          userBranchId={userBranchId}
          initialBranchId={activeBranchId}
        />
      </div>
    </div>
  );
}
