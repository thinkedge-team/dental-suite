import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  AlertTriangle,
  Ban,
  CheckCircle2,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveBranchId } from "@/lib/branch-context";
import { ScheduleBlockDrawer } from "./schedule-block-drawer";
import { DeleteBlockButton } from "./delete-block-button";

const DAYS_OF_WEEK = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

function formatDateTimeWib(date: Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d) + " WIB";
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams?: Promise<{ branch?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;
  const { branch: branchParam } = (await searchParams) || {};
  const isDirector = session.user.role === "DIRECTOR" || session.user.role === "SUPER_ADMIN";
  const effectiveBranchId = await getActiveBranchId(branchParam, session.user.branchId, isDirector);

  const [doctors, branches, scheduleBlocks] = await Promise.all([
    prisma.doctor.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        schedules: {
          orderBy: { dayOfWeek: "asc" },
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.scheduleBlock.findMany({
      where: {
        doctor: {
          organizationId,
        },
        ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
      },
      include: {
        doctor: {
          select: { id: true, name: true, specialty: true },
        },
        branch: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    }),
  ]);

  const now = new Date();
  const activeAndUpcomingBlocks = scheduleBlocks.filter((b) => b.endAt >= now);
  const pastBlocks = scheduleBlocks.filter((b) => b.endAt < now);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">Manajemen Jadwal</p>
          <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
            Jadwal & Blokir Praktik <span className="font-semibold">Dokter</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atur jadwal praktik mingguan dan blokir tanggal berhalangan untuk mencegah reservasi ganda
          </p>
        </div>
        <ScheduleBlockDrawer doctors={doctors} branches={branches} />
      </header>

      {/* Section: Active & Upcoming Schedule Blocks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Ban className="size-4" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Daftar Blokir Praktik Aktif & Mendatang</h2>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {activeAndUpcomingBlocks.length} Aktif
          </span>
        </div>

        {activeAndUpcomingBlocks.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card p-6 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Tidak Ada Jadwal Terblokir</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Semua dokter beroperasi sesuai jadwal reguler mingguan masing-masing.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3.5">Dokter</th>
                    <th className="px-4 py-3.5">Cabang</th>
                    <th className="px-4 py-3.5">Mulai Blokir</th>
                    <th className="px-4 py-3.5">Selesai Blokir</th>
                    <th className="px-4 py-3.5">Alasan</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeAndUpcomingBlocks.map((block) => {
                    const isOngoing = block.startAt <= now && block.endAt >= now;
                    return (
                      <tr key={block.id} className="transition hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="size-3.5 text-primary shrink-0" />
                            <div>
                              <div>{block.doctor.name}</div>
                              {block.doctor.specialty && (
                                <div className="text-[10px] font-normal text-muted-foreground">
                                  {block.doctor.specialty}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-muted-foreground shrink-0" />
                            <span>{block.branch.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                          {formatDateTimeWib(block.startAt)}
                        </td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                          {formatDateTimeWib(block.endAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                              {block.reason || "Blokir Praktik"}
                            </span>
                            {isOngoing && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="size-2.5" />
                                Sedang Berlangsung
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <DeleteBlockButton id={block.id} doctorName={block.doctor.name} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Section: Overview of Regular Weekly Doctor Practice Schedules */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="size-4" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Jadwal Praktik Reguler Mingguan</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {doctors.length} Dokter Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    {doctor.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{doctor.name}</h3>
                    <p className="text-xs text-muted-foreground">{doctor.specialty || "Dokter Gigi Umum"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {doctor.schedules.length} Hari Aktif
                </span>
              </div>

              <div className="mt-4 flex-1 space-y-2">
                {doctor.schedules.length === 0 ? (
                  <p className="py-2 text-xs italic text-muted-foreground">
                    Belum ada jadwal praktik mingguan yang dikonfigurasi.
                  </p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {doctor.schedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="flex items-center justify-between py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <span className="w-16 font-semibold text-primary">
                            {DAYS_OF_WEEK[sch.dayOfWeek] ?? `Hari ${sch.dayOfWeek}`}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="size-3" />
                            {sch.startTime} - {sch.endTime} WIB
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="size-3" />
                          {sch.branch.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Past Blocks History (Collapsed/Informative) */}
      {pastBlocks.length > 0 && (
        <section className="space-y-3 pt-4 opacity-75">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Riwayat Blokir Selesai ({pastBlocks.length})
          </h3>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/10">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/20 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Dokter</th>
                  <th className="px-4 py-2.5">Cabang</th>
                  <th className="px-4 py-2.5">Periode</th>
                  <th className="px-4 py-2.5">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-muted-foreground">
                {pastBlocks.slice(0, 5).map((block) => (
                  <tr key={block.id}>
                    <td className="px-4 py-2 font-medium">{block.doctor.name}</td>
                    <td className="px-4 py-2">{block.branch.name}</td>
                    <td className="px-4 py-2">
                      {formatDateTimeWib(block.startAt)} - {formatDateTimeWib(block.endAt)}
                    </td>
                    <td className="px-4 py-2">{block.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
