import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppointmentStatus } from "@/generated/prisma";
import {
  cancelAppointment,
  checkInAppointment,
  completeAppointment,
} from "@/lib/actions/appointments";
import { STATUS_STYLES } from "@/lib/appointments/status";
import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id, organizationId: session.user.organizationId },
    include: {
      doctor: { select: { name: true, specialty: true, photoUrl: true } },
      patient: { select: { name: true, phone: true } },
      branch: { select: { name: true, address: true } },
      visit: { select: { notes: true } },
    },
  });

  if (!appointment) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Janji tidak ditemukan</h1>
          <Link href="/appointments" className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary/80">
            ← Kembali ke Daftar Janji
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_STYLES[appointment.status];
  const patientName = appointment.patient?.name ?? appointment.patientName;
  const patientPhone = appointment.patient?.phone ?? appointment.patientPhone;
  const canCheckIn = appointment.status === AppointmentStatus.CONFIRMED;
  const canComplete = appointment.status === AppointmentStatus.CHECKED_IN;
  const canCancel = canCheckIn || canComplete;

  async function checkIn(): Promise<void> {
    "use server";
    await checkInAppointment(id);
  }

  async function complete(formData: FormData): Promise<void> {
    "use server";
    const notes = formData.get("notes");
    await completeAppointment(id, typeof notes === "string" ? notes : undefined);
  }

  async function cancel(): Promise<void> {
    "use server";
    await cancelAppointment(id);
  }

  return (
    <div className="space-y-6 pb-10">
      <Link href="/appointments" className="inline-flex text-sm font-semibold text-primary hover:text-primary/80">
        ← Kembali ke Daftar Janji
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detail Janji Temu</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{patientName}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
                {status.label}
              </span>
              {appointment.walkin && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Walk-in
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{formatDateTime(appointment.scheduledAt)}</p>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
          <DetailField label="Nama Pasien" value={patientName} strong />
          <DetailField label="Nomor Telepon" value={patientPhone} />
          <DetailField label="Layanan" value={appointment.service ?? "—"} />
          <DetailField label="Alasan Kunjungan" value={appointment.reasonForVisit ?? "—"} />
          <DetailField label="Jadwal" value={formatDateTime(appointment.scheduledAt)} />
          <DetailField label="Cabang" value={appointment.branch.address ? `${appointment.branch.name} · ${appointment.branch.address}` : appointment.branch.name} />
          <DetailField label="Dokter" value={appointment.doctor ? `${appointment.doctor.name}${appointment.doctor.specialty ? ` · ${appointment.doctor.specialty}` : ""}` : "—"} />
          {appointment.checkInAt && <DetailField label="Waktu Check-in" value={formatTime(appointment.checkInAt)} />}
          {appointment.visit && <DetailField label="Catatan Kunjungan" value={appointment.visit.notes ?? "—"} />}
        </dl>

        {(canCheckIn || canComplete || canCancel) && (
          <div className="mt-8 border-t border-border pt-6">
            {canComplete && (
              <form action={complete} className="space-y-3">
                <label htmlFor="notes" className="block text-sm font-medium text-foreground">Catatan Kunjungan</label>
                <textarea id="notes" name="notes" rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/30 focus:ring-2" placeholder="Tambahkan catatan kunjungan (opsional)" />
                <button type="submit" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Selesaikan Kunjungan
                </button>
              </form>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {canCheckIn && (
                <form action={checkIn}>
                  <button type="submit" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    Check In
                  </button>
                </form>
              )}
              {canCancel && (
                <form action={cancel}>
                  <button type="submit" className="inline-flex rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                    Batalkan
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value, strong = false }: { readonly label: string; readonly value: string; readonly strong?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-sm text-foreground ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
