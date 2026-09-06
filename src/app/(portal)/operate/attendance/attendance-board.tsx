"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Timer,
  UserCheck,
  Users,
} from "lucide-react";

import { formatDurationMinutes } from "@/lib/attendance/punctuality";

export interface AttendanceBoardRecord {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly userRole: string;
  readonly branchId: string;
  readonly branchName?: string;
  readonly date: string; // ISO
  readonly clockInAt: string; // ISO
  readonly clockOutAt?: string | null; // ISO
  readonly status: "ON_TIME" | "LATE" | "PRESENT" | "EARLY_LEAVE";
  readonly scheduledShift?: {
    readonly startTime: string;
    readonly endTime: string;
    readonly shiftType: string;
  } | null;
  readonly notes?: string | null;
}

interface AttendanceBoardProps {
  readonly records: readonly AttendanceBoardRecord[];
  readonly branchName?: string;
}

function formatWibTime(isoString?: string | null): string {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function calculateDurationString(
  clockInIso: string,
  clockOutIso?: string | null,
): string {
  const startMs = new Date(clockInIso).getTime();
  const endMs = clockOutIso ? new Date(clockOutIso).getTime() : Date.now();
  const diffMinutes = Math.max(0, Math.floor((endMs - startMs) / 60000));
  return formatDurationMinutes(diffMinutes);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ON_TIME":
      return {
        label: "Tepat Waktu",
        badgeClass:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      };
    case "LATE":
      return {
        label: "Terlambat",
        badgeClass:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      };
    case "PRESENT":
      return {
        label: "Hadir",
        badgeClass:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      };
    case "EARLY_LEAVE":
      return {
        label: "Pulang Awal",
        badgeClass:
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      };
    default:
      return {
        label: status,
        badgeClass:
          "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
  }
}

export function AttendanceBoard({
  records,
  branchName,
}: AttendanceBoardProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Metric calculations
  const metrics = useMemo(() => {
    let onDuty = 0;
    let onTime = 0;
    let late = 0;
    const total = records.length;

    for (const r of records) {
      if (r.clockInAt && !r.clockOutAt) {
        onDuty += 1;
      }
      if (r.status === "ON_TIME") {
        onTime += 1;
      } else if (r.status === "LATE") {
        late += 1;
      }
    }

    return { onDuty, onTime, late, total };
  }, [records]);

  // Filter records by staff name
  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return records;
    return records.filter((r) => r.userName.toLowerCase().includes(term));
  }, [records, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Sedang Bertugas */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Sedang Bertugas
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Timer className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {metrics.onDuty}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Staf aktif belum clock out
          </p>
        </div>

        {/* Hadir Tepat Waktu */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Hadir Tepat Waktu
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {metrics.onTime}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Sesuai toleransi 15 menit
          </p>
        </div>

        {/* Terlambat */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Terlambat
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {metrics.late}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Melebihi toleransi jadwal
          </p>
        </div>

        {/* Total Presensi */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Presensi
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {metrics.total}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Catatan presensi hari ini
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        {/* Search Bar & Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="size-4 text-primary" />
              <span>Daftar Kehadiran Hari Ini</span>
              {branchName && (
                <span className="text-xs font-normal text-muted-foreground">
                  · {branchName}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pemantauan presensi dan durasi kerja staf secara real-time
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama staf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Live Attendees Table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-3.5 font-semibold text-foreground">Nama Staf & Peran</th>
                <th className="p-3.5 font-semibold text-foreground">Shift Terjadwal</th>
                <th className="p-3.5 font-semibold text-foreground">Jam Masuk (WIB)</th>
                <th className="p-3.5 font-semibold text-foreground">Jam Pulang (WIB)</th>
                <th className="p-3.5 font-semibold text-foreground">Durasi</th>
                <th className="p-3.5 font-semibold text-foreground">Status</th>
                <th className="p-3.5 font-semibold text-foreground">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {searchTerm
                      ? `Tidak ada catatan presensi yang cocok dengan "${searchTerm}".`
                      : "Belum ada catatan presensi yang tercatat hari ini."}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const statusInfo = getStatusBadge(record.status);
                  const isCurrentlyActive = record.clockInAt && !record.clockOutAt;

                  return (
                    <tr key={record.id} className="transition-colors hover:bg-muted/20">
                      {/* Nama Staf & Peran */}
                      <td className="p-3.5 align-middle">
                        <div className="font-semibold text-foreground">
                          {record.userName}
                        </div>
                        <div className="mt-0.5 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {record.userRole}
                        </div>
                      </td>

                      {/* Shift Terjadwal */}
                      <td className="p-3.5 align-middle">
                        {record.scheduledShift ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {record.scheduledShift.shiftType}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {record.scheduledShift.startTime} - {record.scheduledShift.endTime}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Non-Shift / Lepas
                          </span>
                        )}
                      </td>

                      {/* Jam Masuk */}
                      <td className="p-3.5 align-middle font-mono font-medium text-foreground">
                        {formatWibTime(record.clockInAt)}
                      </td>

                      {/* Jam Pulang */}
                      <td className="p-3.5 align-middle font-mono font-medium">
                        {record.clockOutAt ? (
                          <span className="text-foreground">{formatWibTime(record.clockOutAt)}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Aktif
                          </span>
                        )}
                      </td>

                      {/* Durasi */}
                      <td className="p-3.5 align-middle font-medium text-foreground">
                        {calculateDurationString(record.clockInAt, record.clockOutAt)}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 align-middle">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Catatan */}
                      <td className="p-3.5 align-middle max-w-[200px] truncate text-muted-foreground">
                        {record.notes ? (
                          <span title={record.notes}>{record.notes}</span>
                        ) : (
                          <span className="opacity-40">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
