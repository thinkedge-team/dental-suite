import { redirect } from "next/navigation";
import { Search, Users, Phone, Mail, Calendar, CalendarClock, ClipboardList, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DOB_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const REGISTERED_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function truncateNotes(notes: string | null): string {
  if (!notes) return "";
  const trimmed = notes.trim();
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 60).trimEnd()}…`;
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const patients = await prisma.patient.findMany({
    where: {
      organizationId: session.user.organizationId,
      deletedAt: null,
      ...(search.length > 0 && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }),
    },
    include: {
      _count: {
        select: {
          appointments: true,
          visits: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalCount = patients.length;
  const hasSearch = search.length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Manajemen Pasien
          </p>
          <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
            Daftar Pasien
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasSearch ? (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-foreground">{totalCount}</span>{" "}
                pasien untuk pencarian &ldquo;
                <span className="font-semibold text-foreground">{search}</span>
                &rdquo;.
              </>
            ) : (
              <>
                Total{" "}
                <span className="font-semibold text-foreground">{totalCount}</span>{" "}
                pasien aktif di organisasi Anda (menampilkan 50 terbaru).
              </>
            )}
          </p>
        </div>

        <form
          method="GET"
          className="flex w-full items-center gap-2 md:w-80"
          role="search"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Cari nama atau nomor telepon…"
              className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Content */}
      {totalCount === 0 ? (
        <EmptyState hasSearch={hasSearch} search={search} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Table header (desktop) */}
          <div className="hidden border-b border-border bg-muted/30 px-5 py-3 md:grid md:grid-cols-12 md:gap-4">
            <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Pasien
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tanggal Lahir
            </div>
            <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Catatan
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Aktivitas
            </div>
            <div className="col-span-1 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Terdaftar
            </div>
          </div>

          <ul className="divide-y divide-border">
            {patients.map((patient) => {
              const notesPreview = truncateNotes(patient.notes);
              const dobLabel = patient.dob ? DOB_FORMATTER.format(patient.dob) : "—";
              const registeredLabel = REGISTERED_FORMATTER.format(patient.createdAt);

              return (
                <li
                  key={patient.id}
                  className="grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-muted/30 md:grid-cols-12 md:items-center"
                >
                  {/* Name + contact */}
                  <div className="col-span-4 flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {patient.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{patient.phone}</span>
                      </p>
                      {patient.email ? (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{patient.email}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="col-span-2 flex items-center gap-1.5 text-sm text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground md:hidden" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground md:hidden">
                      Lahir:
                    </span>
                    <span className="tabular-nums">{dobLabel}</span>
                  </div>

                  {/* Notes preview */}
                  <div className="col-span-3 min-w-0">
                    {notesPreview ? (
                      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <ClipboardList className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="truncate">{notesPreview}</span>
                      </p>
                    ) : (
                      <p className="text-xs italic text-muted-foreground/60">
                        Tidak ada catatan
                      </p>
                    )}
                  </div>

                  {/* Counters */}
                  <div className="col-span-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"
                      title={`${patient._count.appointments} janji temu`}
                    >
                      <CalendarClock className="h-3 w-3" />
                      {patient._count.appointments} Janji
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800"
                      title={`${patient._count.visits} kunjungan`}
                    >
                      <Users className="h-3 w-3" />
                      {patient._count.visits} Kunjungan
                    </span>
                  </div>

                  {/* Registered */}
                  <div className="col-span-1 text-left text-xs text-muted-foreground md:text-right">
                    <span className="text-[10px] uppercase tracking-widest md:hidden">
                      Terdaftar:{" "}
                    </span>
                    <span className="tabular-nums">{registeredLabel}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasSearch, search }: { hasSearch: boolean; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Users className="h-6 w-6" />
      </div>
      {hasSearch ? (
        <>
          <h2 className="text-base font-semibold text-foreground">
            Tidak ada pasien yang cocok
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Pencarian &ldquo;
            <span className="font-medium text-foreground">{search}</span>
            &rdquo; tidak menemukan pasien. Coba nama atau nomor telepon lain.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold text-foreground">
            Belum ada pasien terdaftar
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Pasien baru akan muncul di sini setelah mereka melakukan booking
            pertama atau didaftarkan manual oleh staff.
          </p>
        </>
      )}
    </div>
  );
}
