import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  Lock,
  UserCheck,
} from "lucide-react";

import { auth } from "@/auth";
import { getWibDayBounds } from "@/lib/appointments/day-bounds";
import { getActiveBranchId } from "@/lib/branch-context";
import { prisma } from "@/lib/prisma";
import {
  AttendanceBoard,
  AttendanceBoardRecord,
} from "./attendance-board";
import {
  ClockWidget,
  ScheduledShiftInfo,
  TodayAttendanceInfo,
} from "./clock-widget";

interface AttendancePageProps {
  searchParams: Promise<{
    branch?: string;
  }>;
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organizationId) {
    redirect("/login");
  }

  const { branch } = await searchParams;
  const organizationId = session.user.organizationId;
  const role = session.user.role;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";
  const isManager = role === "MANAGER";
  const isManagerOrDirector = isDirector || isManager;
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

  // 3. Resolve active branch for board view
  const effectiveBranchId = await getActiveBranchId(branch, userBranchId, isDirector);
  let activeBranchId: string | undefined;
  if (isDirector) {
    if (effectiveBranchId && branches.some((b) => b.id === effectiveBranchId)) {
      activeBranchId = effectiveBranchId;
    } else {
      activeBranchId = branches[0]?.id;
    }
  } else {
    activeBranchId = userBranchId ?? branches[0]?.id;
  }

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  // 4. Today's WIB start and end bounds
  const { start: startOfToday, end: endOfToday } = getWibDayBounds();

  // 5. Query today's scheduled Shift for session user
  const todayShift = await prisma.shift.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      branch: {
        select: { id: true, name: true },
      },
    },
  });

  const scheduledShift: ScheduledShiftInfo | null = todayShift
    ? {
        id: todayShift.id,
        shiftType: todayShift.shiftType,
        startTime: todayShift.startTime,
        endTime: todayShift.endTime,
        branchId: todayShift.branchId,
        branchName: todayShift.branch?.name ?? "Klinik Utama",
      }
    : null;

  // 6. Query today's AttendanceRecord for session user
  const userAttendance = await prisma.attendanceRecord.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    orderBy: {
      clockInAt: "desc",
    },
  });

  const initialAttendance: TodayAttendanceInfo | null = userAttendance
    ? {
        id: userAttendance.id,
        branchId: userAttendance.branchId,
        clockInAt: userAttendance.clockInAt.toISOString(),
        clockOutAt: userAttendance.clockOutAt?.toISOString() ?? null,
        status: userAttendance.status as "ON_TIME" | "LATE" | "PRESENT" | "EARLY_LEAVE",
        notes: userAttendance.notes,
      }
    : null;

  // 7. For MANAGER, DIRECTOR, SUPER_ADMIN: Query all today's attendance for the branch
  const branchAttendanceRecords =
    isManagerOrDirector && activeBranchId
      ? await prisma.attendanceRecord.findMany({
          where: {
            branchId: activeBranchId,
            date: {
              gte: startOfToday,
              lte: endOfToday,
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
            shift: {
              select: {
                startTime: true,
                endTime: true,
                shiftType: true,
              },
            },
            branch: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            clockInAt: "desc",
          },
        })
      : [];

  const boardRecords: AttendanceBoardRecord[] = branchAttendanceRecords.map(
    (record) => ({
      id: record.id,
      userId: record.userId,
      userName: record.user.name,
      userRole: record.user.role,
      branchId: record.branchId,
      branchName: record.branch?.name,
      date: record.date.toISOString(),
      clockInAt: record.clockInAt.toISOString(),
      clockOutAt: record.clockOutAt?.toISOString() ?? null,
      status: record.status as "ON_TIME" | "LATE" | "PRESENT" | "EARLY_LEAVE",
      scheduledShift: record.shift
        ? {
            startTime: record.shift.startTime,
            endTime: record.shift.endTime,
            shiftType: record.shift.shiftType,
          }
        : null,
      notes: record.notes,
    }),
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="size-6 text-primary" />
            <span>Presensi & Kehadiran Staf</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Catat jam masuk/pulang dinas dan pantau kedisiplinan kehadiran staf klinik.
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
                  href={`/operate/attendance?branch=${b.id}`}
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

      {/* Top Section: ClockWidget for logged-in user */}
      <div className="max-w-3xl">
        <ClockWidget
          scheduledShift={scheduledShift}
          initialAttendance={initialAttendance}
          userBranchId={activeBranchId ?? userBranchId}
          userBranchName={activeBranch?.name}
        />
      </div>

      {/* Lower Section: Live Attendance Monitoring Board (Managers & Directors) */}
      {isManagerOrDirector && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Monitoring Presensi Cabang
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rekapitulasi kehadiran seluruh staf cabang {activeBranch?.name ?? ""} hari ini.
              </p>
            </div>
          </div>

          <AttendanceBoard
            records={boardRecords}
            branchName={activeBranch?.name}
          />
        </div>
      )}
    </div>
  );
}
