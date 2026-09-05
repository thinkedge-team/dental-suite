import Image from "next/image";
import { CalendarDays, Stethoscope, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const DAY_ABBREVIATIONS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function DoctorsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const doctors = await prisma.doctor.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    include: {
      branches: {
        include: {
          branch: {
            select: { name: true },
          },
        },
      },
      schedules: {
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          branchId: true,
        },
      },
      _count: {
        select: { appointments: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">Tim Klinis</p>
          <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
            Manajemen <span className="font-semibold">Dokter</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {doctors.length} dokter aktif dalam organisasi Anda
          </p>
        </div>
        <a
          href="#"
          aria-disabled="true"
          className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-md bg-muted px-5 text-sm font-semibold text-muted-foreground opacity-70"
        >
          + Tambah Dokter
        </a>
      </header>

      {doctors.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Stethoscope className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Belum ada dokter aktif</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tambahkan dokter untuk mengelola jadwal dan janji temu klinik.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const scheduleDays = [...new Set(doctor.schedules.map((schedule) => schedule.dayOfWeek))]
              .sort((a, b) => a - b)
              .map((day) => DAY_ABBREVIATIONS[day])
              .join(", ");

            return (
              <article
                key={doctor.id}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {doctor.photoUrl ? (
                      <Image
                        src={doctor.photoUrl}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-primary/10 text-sm font-bold text-primary">
                        {getInitials(doctor.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">{doctor.name}</h2>
                    {doctor.title && <p className="mt-0.5 text-sm font-medium text-primary">{doctor.title}</p>}
                    {doctor.specialty && <p className="mt-1 text-xs text-muted-foreground">{doctor.specialty}</p>}
                  </div>
                </div>

                <div className="mt-5 space-y-4 border-t border-border/70 pt-4">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted-foreground">No. SIP</span>
                    <span className="truncate font-semibold text-foreground">{doctor.sipNumber ?? "Belum tercatat"}</span>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cabang Praktik</p>
                    <div className="flex flex-wrap gap-1.5">
                      {doctor.branches.length > 0 ? (
                        doctor.branches.map(({ branch }) => (
                          <span key={branch.name} className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                            {branch.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Belum ditugaskan</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5 shrink-0 text-primary" />
                    <span>{scheduleDays || "Jadwal belum tersedia"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="size-3.5 shrink-0 text-primary" />
                    <span>{doctor._count.appointments} janji temu</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
