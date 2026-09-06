"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Timer,
} from "lucide-react";

import { clockIn, clockOut } from "@/lib/actions/attendance";
import { formatDurationMinutes } from "@/lib/attendance/punctuality";

export interface ScheduledShiftInfo {
  readonly id: string;
  readonly shiftType: string; // "PAGI", "SIANG", "FULLDAY", "CUSTOM"
  readonly startTime: string; // "08:00"
  readonly endTime: string; // "15:00"
  readonly branchId: string;
  readonly branchName: string;
}

export interface TodayAttendanceInfo {
  readonly id: string;
  readonly branchId: string;
  readonly clockInAt: string; // ISO string
  readonly clockOutAt?: string | null; // ISO string
  readonly status: "ON_TIME" | "LATE" | "PRESENT" | "EARLY_LEAVE";
  readonly notes?: string | null;
}

interface ClockWidgetProps {
  readonly scheduledShift?: ScheduledShiftInfo | null;
  readonly initialAttendance?: TodayAttendanceInfo | null;
  readonly userBranchId?: string | null;
  readonly userBranchName?: string | null;
}

function getWibTimeString(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getWibFormattedDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatWibTimestamp(isoString: string): string {
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function ClockWidget({
  scheduledShift,
  initialAttendance,
  userBranchId,
  userBranchName,
}: ClockWidgetProps) {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep a dynamic attendance state that initializes from props
  const [attendance, setAttendance] = useState<TodayAttendanceInfo | null>(
    initialAttendance ?? null,
  );

  // Sync state if props change (avoiding synchronous setState during render by comparing IDs)
  const propAttId = initialAttendance?.id ?? "";
  const propClockOut = initialAttendance?.clockOutAt ?? "";
  const [lastPropKey, setLastPropKey] = useState<string>(`${propAttId}_${propClockOut}`);

  if (`${propAttId}_${propClockOut}` !== lastPropKey) {
    setLastPropKey(`${propAttId}_${propClockOut}`);
    setAttendance(initialAttendance ?? null);
  }

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Determine active branch target
  const targetBranchId =
    scheduledShift?.branchId || userBranchId || attendance?.branchId || "";
  const targetBranchName =
    scheduledShift?.branchName || userBranchName || "Klinik Utama";

  // State evaluation
  const isClockedIn = Boolean(attendance && attendance.clockInAt);
  const isClockedOut = Boolean(attendance && attendance.clockOutAt);

  // Calculate elapsed time if active
  let elapsedMinutes = 0;
  if (isClockedIn && attendance) {
    const startMs = new Date(attendance.clockInAt).getTime();
    const endMs = attendance.clockOutAt
      ? new Date(attendance.clockOutAt).getTime()
      : currentTime.getTime();
    elapsedMinutes = Math.max(0, Math.floor((endMs - startMs) / 60000));
  }

  function handleClockIn() {
    setError(null);
    if (!targetBranchId) {
      setError("Data cabang tidak terdeteksi. Hubungi administrator.");
      return;
    }

    startTransition(async () => {
      const res = await clockIn({
        branchId: targetBranchId,
        notes: notes.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error ?? "Gagal melakukan clock in.");
        return;
      }

      setAttendance({
        id: res.attendanceId || "temp-id",
        branchId: targetBranchId,
        clockInAt: new Date().toISOString(),
        clockOutAt: null,
        status: (res.status as "ON_TIME" | "LATE" | "PRESENT") || "ON_TIME",
        notes: notes.trim() || null,
      });
      setNotes("");
    });
  }

  function handleClockOut() {
    setError(null);
    startTransition(async () => {
      const res = await clockOut({
        notes: notes.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error ?? "Gagal melakukan clock out.");
        return;
      }

      if (attendance) {
        setAttendance({
          ...attendance,
          clockOutAt: new Date().toISOString(),
          notes: notes.trim()
            ? attendance.notes
              ? `${attendance.notes} · ${notes.trim()}`
              : notes.trim()
            : attendance.notes,
        });
      }
      setNotes("");
    });
  }

  return (
    <div className="space-y-6">
      {/* Clock and Live Date Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
            </span>
            <span>Waktu Indonesia Barat (WIB)</span>
          </div>

          {/* Large Digital Clock */}
          <div className="mt-3 font-mono text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {getWibTimeString(currentTime)}
          </div>

          <div className="mt-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            <span>{getWibFormattedDate(currentTime)}</span>
          </div>

          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3 text-muted-foreground/70" />
            <span>{targetBranchName}</span>
          </div>
        </div>
      </div>

      {/* Today's Shift Summary Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Jadwal Shift Anda Hari Ini
          </h3>
        </div>

        {scheduledShift ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Shift {scheduledShift.shiftType}
                </span>
                <span className="font-semibold text-sm text-foreground">
                  {scheduledShift.startTime} - {scheduledShift.endTime} WIB
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="size-3" />
                Penugasan di {scheduledShift.branchName}
              </p>
            </div>
            <div className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Shift Terdaftar
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 text-muted-foreground/80" />
            <span>
              Tidak ada jadwal shift terdaftar hari ini (Presensi Lepas/Lembur).
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Action Area */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: Not Clocked In */}
        {!isClockedIn && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <LogIn className="size-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Mulai Sesi Kerja Anda
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pastikan Anda berada di area klinik sebelum menekan tombol Clock In.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label htmlFor="clock-in-notes" className="sr-only">
                Catatan Clock In
              </label>
              <input
                id="clock-in-notes"
                type="text"
                placeholder="Catatan awal bertugas (opsional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleClockIn}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-xs font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                <span>Clock In Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Clocked In & Active */}
        {isClockedIn && !isClockedOut && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Timer className="size-6" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sesi Presensi Aktif</span>
              </div>
              <h4 className="text-lg font-bold text-foreground mt-2">
                Sedang Bertugas
              </h4>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <span className="text-[11px] text-muted-foreground block">Jam Masuk (WIB)</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {attendance?.clockInAt ? formatWibTimestamp(attendance.clockInAt) : "-"}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <span className="text-[11px] text-muted-foreground block">Durasi Berjalan</span>
                <span className="text-sm font-bold text-primary mt-0.5 block">
                  {formatDurationMinutes(elapsedMinutes)}
                </span>
              </div>
            </div>

            {attendance?.notes && (
              <p className="text-xs italic text-muted-foreground">
                &ldquo;{attendance.notes}&rdquo;
              </p>
            )}

            <div className="max-w-md mx-auto pt-2">
              <label htmlFor="clock-out-notes" className="sr-only">
                Catatan Clock Out
              </label>
              <input
                id="clock-out-notes"
                type="text"
                placeholder="Catatan serah terima / selesai dinas (opsional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleClockOut}
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 text-xs font-semibold text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                <span>Clock Out</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Completed / Clocked Out */}
        {isClockedIn && isClockedOut && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="size-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-foreground">
                Tugas Hari Ini Selesai
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Presensi kerja Anda telah terekam lengkap di sistem.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto pt-2">
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Clock In
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 block">
                  {attendance?.clockInAt ? formatWibTimestamp(attendance.clockInAt) : "-"}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Clock Out
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5 block">
                  {attendance?.clockOutAt ? formatWibTimestamp(attendance.clockOutAt) : "-"}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">
                  Total Jam Kerja
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatDurationMinutes(elapsedMinutes)}
                </span>
              </div>
            </div>

            {attendance?.notes && (
              <div className="rounded-xl border border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground max-w-md mx-auto text-left">
                <span className="font-semibold text-foreground block mb-0.5">Catatan:</span>
                <span>{attendance.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
