import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

import { auth } from "@/auth";
import { getWibTodayIso } from "@/lib/appointments/day-bounds";
import { getActiveBranchId } from "@/lib/branch-context";
import { prisma } from "@/lib/prisma";
import {
  DayColumn,
  RosterShift,
  RosterStaff,
  WeeklyRosterGrid,
} from "./weekly-roster-grid";

const WIB_OFFSET_HOURS = 7;
const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

const DAY_NAMES_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

const MONTH_NAMES_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

interface ShiftsPageProps {
  searchParams: Promise<{
    branch?: string;
    week?: string;
  }>;
}

function resolveMondayWib(weekParam?: string): Date {
  if (weekParam) {
    // 1. Check for ISO week pattern like 2026-W37 or 2026-W09
    const match = weekParam.match(/^(\d{4})-W(\d{1,2})$/i);
    if (match) {
      const year = parseInt(match[1], 10);
      const weekNum = parseInt(match[2], 10);
      // Jan 4th is always in ISO week 1
      const jan4 = new Date(Date.UTC(year, 0, 4));
      const jan4Day = jan4.getUTCDay();
      const jan4MondayDiff = jan4Day === 0 ? -6 : 1 - jan4Day;
      const week1Monday = new Date(Date.UTC(year, 0, 4 + jan4MondayDiff));
      const targetMondayUtc = new Date(
        Date.UTC(
          week1Monday.getUTCFullYear(),
          week1Monday.getUTCMonth(),
          week1Monday.getUTCDate() + (weekNum - 1) * 7,
          0,
          0,
          0,
          0,
        ),
      );
      return new Date(targetMondayUtc.getTime() - WIB_OFFSET_MS);
    }

    // 2. Check for ISO date string e.g. 2026-09-07
    const dateStr = weekParam.includes("T") ? weekParam.split("T")[0] : weekParam;
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const y = parts[0];
      const m = parts[1] - 1;
      const d = parts[2];
      const inputDateUtc = new Date(Date.UTC(y, m, d));
      const dayOfWeek = inputDateUtc.getUTCDay();
      const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const mondayDateUtc = new Date(Date.UTC(y, m, d + mondayDiff, 0, 0, 0, 0));
      return new Date(mondayDateUtc.getTime() - WIB_OFFSET_MS);
    }
  }

  // Default: current week's Monday in WIB
  const now = new Date();
  const wibTime = new Date(now.getTime() + WIB_OFFSET_MS);
  const wYear = wibTime.getUTCFullYear();
  const wMonth = wibTime.getUTCMonth();
  const wDay = wibTime.getUTCDate();
  const wDayOfWeek = wibTime.getUTCDay();
  const mondayDiff = wDayOfWeek === 0 ? -6 : 1 - wDayOfWeek;
  const mondayDateUtc = new Date(Date.UTC(wYear, wMonth, wDay + mondayDiff, 0, 0, 0, 0));
  return new Date(mondayDateUtc.getTime() - WIB_OFFSET_MS);
}

export default async function ShiftsPage({ searchParams }: ShiftsPageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { branch, week } = await searchParams;
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

  // 3. Resolve active branch
  const effectiveBranchId = await getActiveBranchId(branch, userBranchId, isDirector);
  let activeBranchId = "";
  if (isDirector) {
    if (effectiveBranchId && branches.some((b) => b.id === effectiveBranchId)) {
      activeBranchId = effectiveBranchId;
    } else {
      activeBranchId = branches[0]?.id ?? "";
    }
  } else {
    activeBranchId = userBranchId ?? branches[0]?.id ?? "";
  }

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  // 4. Resolve target week Monday to Sunday in WIB
  const mondayStart = resolveMondayWib(week);
  const sundayEnd = new Date(mondayStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  const todayIso = getWibTodayIso(new Date());

  // Generate 7 day columns (Monday to Sunday)
  const days: DayColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStartUtc = new Date(mondayStart.getTime() + i * 24 * 60 * 60 * 1000);
    const dayWib = new Date(dayStartUtc.getTime() + WIB_OFFSET_MS);
    const y = dayWib.getUTCFullYear();
    const m = String(dayWib.getUTCMonth() + 1).padStart(2, "0");
    const d = String(dayWib.getUTCDate()).padStart(2, "0");
    const dateIso = `${y}-${m}-${d}`;
    const dayOfWeek = dayWib.getUTCDay();
    const dayName = DAY_NAMES_ID[dayOfWeek];
    const formattedDate = `${dayWib.getUTCDate()} ${MONTH_NAMES_ID[dayWib.getUTCMonth()]}`;

    days.push({
      dateIso,
      dayName,
      formattedDate,
      isToday: dateIso === todayIso,
    });
  }

  // ISO string for navigation
  const prevMondayWib = new Date(mondayStart.getTime() - 7 * 24 * 60 * 60 * 1000 + WIB_OFFSET_MS);
  const prevWeekIso = `${prevMondayWib.getUTCFullYear()}-${String(prevMondayWib.getUTCMonth() + 1).padStart(2, "0")}-${String(prevMondayWib.getUTCDate()).padStart(2, "0")}`;

  const nextMondayWib = new Date(mondayStart.getTime() + 7 * 24 * 60 * 60 * 1000 + WIB_OFFSET_MS);
  const nextWeekIso = `${nextMondayWib.getUTCFullYear()}-${String(nextMondayWib.getUTCMonth() + 1).padStart(2, "0")}-${String(nextMondayWib.getUTCDate()).padStart(2, "0")}`;

  const currentWeekLabel = `${days[0]?.formattedDate ?? ""} - ${days[6]?.formattedDate ?? ""} ${days[6]?.dateIso.slice(0, 4) ?? ""}`;

  // 5. Query users belonging to the branch with role STAFF, MANAGER, or DOCTOR
  const staffUsers = activeBranchId
    ? await prisma.user.findMany({
        where: {
          organizationId,
          isActive: true,
          role: {
            in: ["STAFF", "MANAGER", "DOCTOR"],
          },
          OR: [
            { branchId: activeBranchId },
            { branchId: null },
          ],
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
        orderBy: [
          { role: "asc" },
          { name: "asc" },
        ],
      })
    : [];

  // 6. Query Shift records for these users between Monday and Sunday
  const shifts = activeBranchId
    ? await prisma.shift.findMany({
        where: {
          branchId: activeBranchId,
          date: {
            gte: mondayStart,
            lte: sundayEnd,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          startTime: "asc",
        },
      })
    : [];

  // Merge staff from roster shifts and branch staff users to avoid omissions
  const staffMap = new Map<string, RosterStaff>();
  for (const u of staffUsers) {
    staffMap.set(u.id, {
      id: u.id,
      name: u.name,
      role: u.role,
    });
  }
  for (const s of shifts) {
    if (!staffMap.has(s.userId) && s.user) {
      staffMap.set(s.userId, {
        id: s.user.id,
        name: s.user.name,
        role: s.user.role,
      });
    }
  }
  const staffList: RosterStaff[] = Array.from(staffMap.values());

  // Map to RosterShift
  const rosterShifts: RosterShift[] = shifts.map((s) => {
    const wibDate = new Date(s.date.getTime() + WIB_OFFSET_MS);
    const y = wibDate.getUTCFullYear();
    const m = String(wibDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(wibDate.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    return {
      id: s.id,
      userId: s.userId,
      branchId: s.branchId,
      date: dateStr,
      startTime: s.startTime,
      endTime: s.endTime,
      shiftType: s.shiftType,
      notes: s.notes,
    };
  });

  // Helper url builder preserving branch
  function buildWeekUrl(targetWeek?: string): string {
    const params = new URLSearchParams();
    if (activeBranchId) {
      params.set("branch", activeBranchId);
    }
    if (targetWeek) {
      params.set("week", targetWeek);
    }
    const qs = params.toString();
    return `/operate/shifts${qs ? `?${qs}` : ""}`;
  }

  // Branch switcher url builder preserving week
  function buildBranchUrl(targetBranchId: string): string {
    const params = new URLSearchParams();
    params.set("branch", targetBranchId);
    if (week) {
      params.set("week", week);
    }
    return `/operate/shifts?${params.toString()}`;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="size-6 text-primary" />
            <span>Jadwal Shift Staf</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atur dan pantau jadwal dinas dokter dan staf per cabang klinik.
          </p>
        </div>

        {/* Branch Selector for Director / Super Admin */}
        {isDirector && branches.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-2xs">
            {branches.map((b) => {
              const isActive = activeBranchId === b.id;
              return (
                <Link
                  key={b.id}
                  href={buildBranchUrl(b.id)}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Building2 className="size-3.5" />
                  <span>{b.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Week Navigation & Summary Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Periode Roster Mingguan (WIB)
            </div>
            <div className="text-base font-bold text-foreground">
              {currentWeekLabel}
            </div>
          </div>
        </div>

        {/* Week Switcher Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={buildWeekUrl(prevWeekIso)}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            title="Minggu Lalu"
          >
            <ChevronLeft className="size-3.5" />
            <span>Minggu Lalu</span>
          </Link>

          <Link
            href={buildWeekUrl()}
            className="inline-flex h-9 items-center rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Minggu Ini
          </Link>

          <Link
            href={buildWeekUrl(nextWeekIso)}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            title="Minggu Depan"
          >
            <span>Minggu Depan</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Roster Grid */}
      {activeBranchId ? (
        <WeeklyRosterGrid
          branchId={activeBranchId}
          branchName={activeBranch?.name}
          days={days}
          staffList={staffList}
          shifts={rosterShifts}
          currentWeekLabel={currentWeekLabel}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Belum ada cabang aktif yang terdaftar di organisasi ini.
        </div>
      )}
    </div>
  );
}
