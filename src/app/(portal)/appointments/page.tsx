import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  Stethoscope,
  Phone,
  User as UserIcon,
} from "lucide-react";

import { auth } from "@/auth";
import { AppointmentStatus } from "@/generated/prisma";
import { STATUS_STYLES } from "@/lib/appointments/status";
import { prisma } from "@/lib/prisma";
import { getWibTodayIso, getWibIsoBounds } from "@/lib/appointments/day-bounds";
import { getActiveBranchId } from "@/lib/branch-context";
import { AppointmentWaButton } from "@/components/portal/appointment-wa-button";

type SearchParams = {
  date?: string;
  status?: string;
  branch?: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const VALID_STATUSES = new Set<string>(Object.values(AppointmentStatus));

function todayIsoDate(): string {
  return getWibTodayIso();
}

function shiftDate(iso: string, deltaDays: number): string {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + deltaDays);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function dayBounds(iso: string): { start: Date; end: Date } {
  return getWibIsoBounds(iso);
}

function formatLongDate(iso: string): string {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const d = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function formatTime(dt: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(dt);
}

function buildQuery(params: {
  date: string;
  status: AppointmentStatus | undefined;
  branch: string | undefined;
  overrides?: Partial<{ date: string; status: string; branch: string }>;
}): string {
  const merged: Record<string, string> = { date: params.date };
  if (params.status !== undefined) merged.status = params.status;
  if (params.branch !== undefined) merged.branch = params.branch;
  if (params.overrides) {
    for (const [k, v] of Object.entries(params.overrides)) {
      if (v === undefined) continue;
      merged[k] = v;
    }
  }
  const search = new URLSearchParams(merged).toString();
  return search.length > 0 ? `?${search}` : "";
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { date, status, branch } = await searchParams;

  const isDirector = session.user.role === "DIRECTOR" || session.user.role === "SUPER_ADMIN";
  const effectiveBranchId = await getActiveBranchId(branch, session.user.branchId, isDirector);

  const selectedDate = date && DATE_RE.test(date) ? date : todayIsoDate();
  const { start, end } = dayBounds(selectedDate);

  const selectedStatus: AppointmentStatus | undefined =
    status && VALID_STATUSES.has(status) ? (status as AppointmentStatus) : undefined;

  const selectedBranch = effectiveBranchId;

  const appointments = await prisma.appointment.findMany({
    where: {
      organizationId: session.user.organizationId,
      scheduledAt: { gte: start, lte: end },
      ...(selectedStatus ? { status: selectedStatus } : {}),
      ...(selectedBranch ? { branchId: selectedBranch } : {}),
    },
    include: {
      doctor: { select: { name: true } },
      patient: { select: { name: true, phone: true } },
      branch: { select: { name: true, address: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const prevDateStr = shiftDate(selectedDate, -1);
  const nextDateStr = shiftDate(selectedDate, 1);
  const todayStr = todayIsoDate();
  const isToday = selectedDate === todayStr;

  const prevHref = `/appointments${buildQuery({
    date: prevDateStr,
    status: selectedStatus,
    branch: selectedBranch,
  })}`;
  const nextHref = `/appointments${buildQuery({
    date: nextDateStr,
    status: selectedStatus,
    branch: selectedBranch,
  })}`;
  const todayHref = `/appointments${buildQuery({
    date: todayStr,
    status: selectedStatus,
    branch: selectedBranch,
  })}`;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Jadwal Janji Temu
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
              {formatLongDate(selectedDate)}
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {appointments.length} janji
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={prevHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            aria-label="Hari sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          {!isToday && (
            <Link
              href={todayHref}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            >
              Hari Ini
            </Link>
          )}
          <Link
            href={nextHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
            aria-label="Hari berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusFilterLink
          label="Semua Status"
          active={selectedStatus === undefined}
          href={`/appointments${buildQuery({
            date: selectedDate,
            status: undefined,
            branch: selectedBranch,
          })}`}
        />
        {(Object.keys(STATUS_STYLES) as AppointmentStatus[]).map((s) => (
          <StatusFilterLink
            key={s}
            label={STATUS_STYLES[s].label}
            active={selectedStatus === s}
            href={`/appointments${buildQuery({
              date: selectedDate,
              status: s,
              branch: selectedBranch,
            })}`}
          />
        ))}
      </div>

      {/* Table / list */}
      {appointments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Belum ada janji temu</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Tidak ada jadwal untuk {formatLongDate(selectedDate)}. Coba pilih tanggal lain atau
              buat janji baru.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/30 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:grid">
            <div className="col-span-1">Waktu</div>
            <div className="col-span-3">Pasien</div>
            <div className="col-span-2">Telepon</div>
            <div className="col-span-2">Layanan</div>
            <div className="col-span-1">Dokter</div>
            <div className="col-span-1">Cabang</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          <div className="divide-y divide-border">
            {appointments.map((apt) => {
              const badge = STATUS_STYLES[apt.status];
              const patientName = apt.patient?.name ?? apt.patientName;
              const patientPhone = apt.patient?.phone ?? apt.patientPhone;

              return (
                <div
                  key={apt.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted/30 md:grid-cols-12 md:items-center md:gap-4"
                >
                  {/* Time */}
                  <div className="col-span-1 flex items-center gap-1.5 text-sm font-semibold text-foreground tabular-nums">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground md:hidden lg:inline" />
                    {formatTime(apt.scheduledAt)}
                  </div>

                  {/* Patient name + walk-in pill */}
                  <div className="col-span-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/appointments/${apt.id}`}
                        className="text-sm font-medium text-foreground truncate hover:text-primary hover:underline"
                      >
                        {patientName}
                      </Link>
                      {apt.walkin && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Walk-in
                        </span>
                      )}
                    </div>
                    {apt.reasonForVisit && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {apt.reasonForVisit}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-span-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0 md:hidden lg:inline" />
                    <span className="tabular-nums truncate">{patientPhone}</span>
                  </div>

                  {/* Service */}
                  <div className="col-span-2 flex items-center gap-1.5 min-w-0 text-sm text-foreground">
                    <span className="truncate">{apt.service ?? "-"}</span>
                  </div>

                  {/* Doctor */}
                  <div className="col-span-1 flex items-center gap-1.5 min-w-0 text-sm text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5 shrink-0 md:hidden lg:inline" />
                    <span className="truncate">{apt.doctor?.name ?? "-"}</span>
                  </div>

                  {/* Branch */}
                  <div className="col-span-1 flex items-center gap-1.5 min-w-0 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 shrink-0 md:hidden lg:inline" />
                    <span className="truncate">{apt.branch.name}</span>
                  </div>

                  {/* Status badge */}
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center gap-2 md:justify-end">
                    <AppointmentWaButton
                      appointment={{
                        id: apt.id,
                        patientName,
                        patientPhone,
                        doctorName: apt.doctor?.name ?? null,
                        branchName: apt.branch.name,
                        branchAddress: apt.branch.address ?? null,
                        service: apt.service,
                        scheduledAt: apt.scheduledAt,
                        cancelToken: apt.cancelToken,
                        reminderSentAt: apt.reminderSentAt,
                        reminder2hSentAt: apt.reminder2hSentAt,
                      }}
                    />
                    <Link
                      href={`/appointments/${apt.id}`}
                      className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session info footer, subtle */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <UserIcon className="h-3.5 w-3.5" />
        Ditampilkan untuk {session.user.organizationName}
        {session.user.branchName ? ` · ${session.user.branchName}` : ""}
      </p>
    </div>
  );
}

function StatusFilterLink({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  const base =
    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors";
  const activeCls = "border-primary bg-primary/10 text-primary";
  const idleCls =
    "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary";
  return (
    <Link href={href} className={`${base} ${active ? activeCls : idleCls}`}>
      {label}
    </Link>
  );
}
