import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  MapPin,
  Stethoscope,
  CreditCard,
  FileText,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/intelligence/analytics";
import { PatientNotesForm } from "./patient-notes-form";

const WIB_OFFSET_HOURS = 7;

function toWib(date: Date): Date {
  return new Date(date.getTime() + WIB_OFFSET_HOURS * 60 * 60 * 1000);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

function calculateAge(dob: Date | null): string {
  if (!dob) return "-";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} tahun`;
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { id } = await params;

  const now = new Date();

  const patient = await prisma.patient.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      deletedAt: null,
    },
    include: {
      appointments: {
        where: {
          status: "CONFIRMED",
          scheduledAt: {
            gte: now,
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
        take: 5,
        include: {
          branch: true,
          doctor: true,
        },
      },
      visits: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          branch: true,
          service: true,
          appointment: {
            include: {
              doctor: true,
            },
          },
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const directDoctorIds = Array.from(
    new Set(
      patient.visits
        .map((v) => v.doctorId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const doctorsMap = new Map<string, { name: string; specialty: string | null }>();
  if (directDoctorIds.length > 0) {
    const doctors = await prisma.doctor.findMany({
      where: { id: { in: directDoctorIds } },
      select: { id: true, name: true, specialty: true },
    });
    for (const d of doctors) {
      doctorsMap.set(d.id, { name: d.name, specialty: d.specialty });
    }
  }

  const totalVisitsCount = patient.visits.length;
  const totalPaymentSum = patient.visits.reduce((acc, visit) => {
    return acc + (visit.paymentAmount ? Number(visit.paymentAmount) : 0);
  }, 0);
  const upcomingAppointmentsCount = patient.appointments.length;

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Patient Header */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Pasien
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {patient.name}
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Pasien Aktif
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </span>
                {patient.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {patient.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Terdaftar sejak {DATE_FORMATTER.format(toWib(patient.createdAt))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Kunjungan Selesai
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalVisitsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Pembayaran
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatRupiah(totalPaymentSum)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Janji Temu Mendatang
              </p>
              <p className="text-2xl font-bold text-foreground">
                {upcomingAppointmentsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid: Demographics & Clinical Notes */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Demographics Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground border-b border-border pb-3 mb-4">
            <User className="h-4 w-4 text-primary" />
            Data Demografis Pasien
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Tanggal Lahir (WIB)
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {patient.dob ? DATE_FORMATTER.format(toWib(patient.dob)) : "-"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Usia</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {calculateAge(patient.dob)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                No. Telepon / WhatsApp
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {patient.phone}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {patient.email || "-"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Clinical Notes Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground border-b border-border pb-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Catatan Medis &amp; Alergi
          </h2>
          <PatientNotesForm
            patientId={patient.id}
            initialNotes={patient.notes}
          />
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      {patient.appointments.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground border-b border-border pb-3 mb-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            Janji Temu Mendatang ({patient.appointments.length})
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {patient.appointments.map((appt) => {
              const apptDateWib = toWib(appt.scheduledAt);
              return (
                <div
                  key={appt.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        <Clock className="h-3 w-3" />
                        {TIME_FORMATTER.format(apptDateWib)} WIB
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {DATE_FORMATTER.format(apptDateWib)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {appt.service || "Pemeriksaan Gigi"}
                    </p>

                    <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />
                        {appt.doctor?.name || "Dokter Bertugas"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appt.branch.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Longitudinal Visit Timeline */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground border-b border-border pb-3 mb-6">
          <FileText className="h-4 w-4 text-primary" />
          Riwayat Rekam Medis &amp; Kunjungan (Timeline)
        </h2>

        {patient.visits.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Belum ada data kunjungan atau tindakan yang tercatat untuk pasien ini.
          </div>
        ) : (
          <div className="relative border-l border-border ml-4 space-y-6">
            {patient.visits.map((visit) => {
              const visitDateWib = toWib(visit.createdAt);
              const doctorInfo = visit.doctorId
                ? doctorsMap.get(visit.doctorId)
                : visit.appointment?.doctor
                ? {
                    name: visit.appointment.doctor.name,
                    specialty: visit.appointment.doctor.specialty,
                  }
                : null;

              return (
                <div key={visit.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />

                  <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    {/* Header: Date, Service, Branch */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {visit.service?.name || "Tindakan Medis"}
                          </span>
                          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {visit.branch.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {DATE_FORMATTER.format(visitDateWib)} pukul{" "}
                          {TIME_FORMATTER.format(visitDateWib)} WIB
                        </p>
                      </div>

                      {/* Doctor info */}
                      {doctorInfo && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Stethoscope className="h-3.5 w-3.5 text-primary" />
                          <span>{doctorInfo.name}</span>
                          {doctorInfo.specialty && (
                            <span className="text-muted-foreground">
                              · {doctorInfo.specialty}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Clinical Notes */}
                    <div className="py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Catatan Tindakan Klinis:
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/20 p-2.5 rounded-md">
                        {visit.notes || "Tidak ada catatan klinis khusus."}
                      </p>
                    </div>

                    {/* Footer: Payment info */}
                    <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Metode Pembayaran:
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                          {visit.paymentMethod || "CASH"}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-muted-foreground mr-1.5">
                          Total:
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatRupiah(
                            visit.paymentAmount
                              ? Number(visit.paymentAmount)
                              : 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}