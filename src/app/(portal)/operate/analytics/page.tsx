import Link from "next/link";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  UserX,
  Activity,
  Building2,
  Calendar,
  Lock,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateKpiGrowth,
  formatRupiah,
  resolveDateRange,
} from "@/lib/intelligence/analytics";
import { getActiveBranchId } from "@/lib/branch-context";
import { TrendChart, TrendChartItem } from "./trend-chart";
import { DoctorRankingTable, DoctorRankingItem } from "./doctor-ranking-table";
import { ServiceBreakdown, ServiceBreakdownItem } from "./service-breakdown";

interface AnalyticsPageProps {
  searchParams: Promise<{
    branch?: string;
    period?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { branch: branchParam, period: periodParam } = await searchParams;
  const organizationId = session.user.organizationId;
  const role = session.user.role;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";
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
            Klinik <span className="font-semibold text-foreground">{org?.name ?? "Anda"}</span> belum mengaktifkan modul INTELLIGENCE (Analitik Eksekutif, KPI & Laporan Ekspor).
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

  // 2. Resolve branch scoping
  const effectiveBranchId = await getActiveBranchId(branchParam, userBranchId, isDirector);

  // Query branches for branch filter dropdown (if Director/SuperAdmin)
  const branches = await prisma.branch.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // 3. Resolve period & date ranges
  const validPeriods = ["7d", "30d", "this_month", "last_month"] as const;
  type PeriodPreset = (typeof validPeriods)[number];
  const activePeriod: PeriodPreset = validPeriods.includes(periodParam as PeriodPreset)
    ? (periodParam as PeriodPreset)
    : "30d";

  const { current: currentRange, previous: previousRange } = resolveDateRange(activePeriod);

  // 4. Fetch current & previous Visits
  const currentVisits = await prisma.visit.findMany({
    where: {
      organizationId,
      ...(effectiveBranchId && { branchId: effectiveBranchId }),
      deletedAt: null,
      createdAt: {
        gte: currentRange.start,
        lte: currentRange.end,
      },
    },
    include: {
      service: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
      appointment: {
        include: {
          doctor: { select: { id: true, name: true, specialty: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const previousVisits = await prisma.visit.findMany({
    where: {
      organizationId,
      ...(effectiveBranchId && { branchId: effectiveBranchId }),
      deletedAt: null,
      createdAt: {
        gte: previousRange.start,
        lte: previousRange.end,
      },
    },
    select: {
      paymentAmount: true,
    },
  });

  // 5. Fetch current & previous Appointments (for no-show rate)
  const currentAppointments = await prisma.appointment.findMany({
    where: {
      organizationId,
      ...(effectiveBranchId && { branchId: effectiveBranchId }),
      scheduledAt: {
        gte: currentRange.start,
        lte: currentRange.end,
      },
    },
    select: {
      id: true,
      status: true,
      scheduledAt: true,
      doctorId: true,
      doctor: { select: { id: true, name: true, specialty: true } },
      branch: { select: { id: true, name: true } },
    },
  });

  const previousAppointments = await prisma.appointment.findMany({
    where: {
      organizationId,
      ...(effectiveBranchId && { branchId: effectiveBranchId }),
      scheduledAt: {
        gte: previousRange.start,
        lte: previousRange.end,
      },
    },
    select: {
      status: true,
    },
  });

  // Direct doctor IDs from visits if visit.doctorId is present
  const directDoctorIds = Array.from(
    new Set(
      currentVisits
        .map((v) => v.doctorId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const directDoctorsMap = new Map<string, { name: string; specialty: string | null }>();
  if (directDoctorIds.length > 0) {
    const doctors = await prisma.doctor.findMany({
      where: { id: { in: directDoctorIds } },
      select: { id: true, name: true, specialty: true },
    });
    for (const d of doctors) {
      directDoctorsMap.set(d.id, { name: d.name, specialty: d.specialty });
    }
  }

  // 6. Calculate KPIs
  // Total Revenue
  const currentRevenue = currentVisits.reduce(
    (acc, v) => acc + (v.paymentAmount ? Number(v.paymentAmount) : 0),
    0
  );
  const previousRevenue = previousVisits.reduce(
    (acc, v) => acc + (v.paymentAmount ? Number(v.paymentAmount) : 0),
    0
  );
  const revenueGrowth = calculateKpiGrowth(currentRevenue, previousRevenue);

  // Completed Visits
  const currentCompletedVisits = currentVisits.length;
  const previousCompletedVisits = previousVisits.length;
  const visitsGrowth = calculateKpiGrowth(currentCompletedVisits, previousCompletedVisits);

  // No-Show Rate: noShowCount / (completedCount + noShowCount) * 100
  const currentNoShowCount = currentAppointments.filter(
    (a) => a.status === "NO_SHOW"
  ).length;
  const currentCompletedApptCount = currentAppointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const currentTotalDenominator = currentCompletedApptCount + currentNoShowCount;
  const currentNoShowRate =
    currentTotalDenominator > 0
      ? (currentNoShowCount / currentTotalDenominator) * 100
      : 0;

  const prevNoShowCount = previousAppointments.filter(
    (a) => a.status === "NO_SHOW"
  ).length;
  const prevCompletedApptCount = previousAppointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const prevTotalDenominator = prevCompletedApptCount + prevPrevNoShow(prevCompletedApptCount, prevNoShowCount);
  function prevPrevNoShow(c: number, ns: number) {
    return c + ns;
  }
  const previousNoShowRate =
    prevTotalDenominator > 0
      ? (prevNoShowCount / prevTotalDenominator) * 100
      : 0;
  const noShowDiff = Math.round((currentNoShowRate - previousNoShowRate) * 10) / 10;

  // Average Revenue per Patient/Visit
  const currentAvgRevenue =
    currentCompletedVisits > 0 ? currentRevenue / currentCompletedVisits : 0;
  const previousAvgRevenue =
    previousCompletedVisits > 0 ? previousRevenue / previousCompletedVisits : 0;
  const avgRevenueGrowth = calculateKpiGrowth(currentAvgRevenue, previousAvgRevenue);

  // 7. Time-series aggregation for TrendChart (WIB date groups)
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const dailyMap = new Map<string, { appointments: number; revenue: number }>();

  // Initialize all days in currentRange
  const startDay = new Date(currentRange.start.getTime());
  startDay.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(currentRange.end.getTime());
  endDay.setUTCHours(23, 59, 59, 999);

  const curIter = new Date(startDay.getTime());
  while (curIter <= endDay) {
    const yyyy = curIter.getUTCFullYear();
    const mm = String(curIter.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(curIter.getUTCDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    dailyMap.set(key, { appointments: 0, revenue: 0 });
    curIter.setUTCDate(curIter.getUTCDate() + 1);
  }

  // Populate visits revenue
  for (const v of currentVisits) {
    const wib = new Date(v.createdAt.getTime() + WIB_OFFSET_MS);
    const yyyy = wib.getUTCFullYear();
    const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(wib.getUTCDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;

    const existing = dailyMap.get(key) ?? { appointments: 0, revenue: 0 };
    existing.revenue += v.paymentAmount ? Number(v.paymentAmount) : 0;
    dailyMap.set(key, existing);
  }

  // Populate appointments volume
  for (const a of currentAppointments) {
    const wib = new Date(a.scheduledAt.getTime() + WIB_OFFSET_MS);
    const yyyy = wib.getUTCFullYear();
    const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(wib.getUTCDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;

    const existing = dailyMap.get(key) ?? { appointments: 0, revenue: 0 };
    existing.appointments += 1;
    dailyMap.set(key, existing);
  }

  const trendData: TrendChartItem[] = Array.from(dailyMap.entries()).map(
    ([dateKey, val]) => {
      const parts = dateKey.split("-");
      const label = `${parts[2]}/${parts[1]}`;
      return {
        date: dateKey,
        label,
        appointments: val.appointments,
        revenue: val.revenue,
      };
    }
  );

  // 8. Doctor Ranking Aggregation
  const doctorStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      specialty: string | null;
      branchName: string;
      visitCount: number;
      totalRevenue: number;
    }
  >();

  for (const v of currentVisits) {
    const directDoc = v.doctorId ? directDoctorsMap.get(v.doctorId) : undefined;
    const apptDoc = v.appointment?.doctor;
    const docId = v.doctorId ?? apptDoc?.id ?? "unknown";
    const docName = directDoc?.name ?? apptDoc?.name ?? "Dokter Gigi Klinik";
    const docSpecialty = directDoc?.specialty ?? apptDoc?.specialty ?? null;
    const branchName = v.branch?.name ?? "Klinik Utama";
    const revenue = v.paymentAmount ? Number(v.paymentAmount) : 0;

    const existing = doctorStatsMap.get(docId) ?? {
      id: docId,
      name: docName,
      specialty: docSpecialty,
      branchName,
      visitCount: 0,
      totalRevenue: 0,
    };

    existing.visitCount += 1;
    existing.totalRevenue += revenue;
    doctorStatsMap.set(docId, existing);
  }

  const doctorRankings: DoctorRankingItem[] = Array.from(
    doctorStatsMap.values()
  ).map((doc) => ({
    ...doc,
    avgRevenuePerVisit: doc.visitCount > 0 ? Math.round(doc.totalRevenue / doc.visitCount) : 0,
  }));

  // 9. Service Breakdown Aggregation
  const serviceStatsMap = new Map<
    string,
    { id: string; name: string; visitCount: number; revenue: number }
  >();

  for (const v of currentVisits) {
    const svcId = v.serviceId ?? "other";
    const svcName = v.service?.name ?? "Konsultasi & Tindakan Umum";
    const rev = v.paymentAmount ? Number(v.paymentAmount) : 0;

    const existing = serviceStatsMap.get(svcId) ?? {
      id: svcId,
      name: svcName,
      visitCount: 0,
      revenue: 0,
    };

    existing.visitCount += 1;
    existing.revenue += rev;
    serviceStatsMap.set(svcId, existing);
  }

  const serviceBreakdownList: ServiceBreakdownItem[] = Array.from(
    serviceStatsMap.values()
  ).map((s) => ({
    ...s,
    percentage: currentRevenue > 0 ? (s.revenue / currentRevenue) * 100 : 0,
  }));

  // Period label mapper
  const periodTabs = [
    { key: "7d", label: "7 Hari Terakhir" },
    { key: "30d", label: "30 Hari Terakhir" },
    { key: "this_month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Period & Branch Switchers */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Activity className="size-6 text-primary" />
            Analitik & Performa Eksekutif
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ringkasan omzet klinis, utilisasi dokter, dan rasio kehadiran pasien
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Branch Badge */}
          {effectiveBranchId && (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs">
              <Building2 className="size-3.5 text-primary" />
              <span>Cabang {branches.find((b) => b.id === effectiveBranchId)?.name ?? effectiveBranchId}</span>
            </div>
          )}

          {/* Period Selector Tabs */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-xs">
            <Calendar className="size-3.5 text-muted-foreground ml-1.5 mr-1" />
            {periodTabs.map((tab) => {
              const isActive = activePeriod === tab.key;
              const branchQuery = effectiveBranchId ? `&branch=${effectiveBranchId}` : "";
              return (
                <Link
                  key={tab.key}
                  href={`/operate/analytics?period=${tab.key}${branchQuery}`}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Pendapatan Klinis */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Pendapatan Klinis
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(currentRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {revenueGrowth.positive ? (
                <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="mr-0.5 size-3.5" />
                  {revenueGrowth.label}
                </span>
              ) : (
                <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                  <TrendingDown className="mr-0.5 size-3.5" />
                  {revenueGrowth.label}
                </span>
              )}
              <span className="text-muted-foreground">vs periode sebelumnya</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Kunjungan Selesai */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Kunjungan Selesai
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {currentCompletedVisits.toLocaleString("id-ID")}{" "}
              <span className="text-sm font-normal text-muted-foreground">pasien</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {visitsGrowth.positive ? (
                <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="mr-0.5 size-3.5" />
                  {visitsGrowth.label}
                </span>
              ) : (
                <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                  <TrendingDown className="mr-0.5 size-3.5" />
                  {visitsGrowth.label}
                </span>
              )}
              <span className="text-muted-foreground">vs periode sebelumnya</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Tingkat No-Show */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Tingkat No-Show
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserX className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {currentNoShowRate.toFixed(1)}%
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {noShowDiff <= 0 ? (
                <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="mr-0.5 size-3.5" />
                  {noShowDiff}%
                </span>
              ) : (
                <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                  <TrendingUp className="mr-0.5 size-3.5" />
                  +{noShowDiff}%
                </span>
              )}
              <span className="text-muted-foreground">
                ({currentNoShowCount} pasien batal hadir)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Rata-rata Pendapatan per Pasien */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Rata-rata per Pasien
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(currentAvgRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {avgRevenueGrowth.positive ? (
                <span className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="mr-0.5 size-3.5" />
                  {avgRevenueGrowth.label}
                </span>
              ) : (
                <span className="flex items-center font-medium text-rose-600 dark:text-rose-400">
                  <TrendingDown className="mr-0.5 size-3.5" />
                  {avgRevenueGrowth.label}
                </span>
              )}
              <span className="text-muted-foreground">per transaksi</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Trend Chart */}
      <TrendChart data={trendData} />

      {/* Grid: Doctor Ranking & Service Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DoctorRankingTable doctors={doctorRankings} />
        <ServiceBreakdown
          services={serviceBreakdownList}
          totalRevenue={currentRevenue}
        />
      </div>
    </div>
  );
}
