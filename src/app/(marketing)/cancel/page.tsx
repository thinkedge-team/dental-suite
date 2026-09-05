import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldAlert,
  User,
  XCircle,
  CalendarPlus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/generated/prisma";
import { CancelForm } from "./cancel-form";

export const dynamic = "force-dynamic";

interface CancelPageProps {
  searchParams: Promise<{ token?: string }>;
}

function formatWibDateTime(date: Date): string {
  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);

  return `${formatted} WIB`;
}

function formatWibDateOnly(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatWibTimeOnly(date: Date): string {
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);

  return `${time} WIB`;
}

function checkCutoff(scheduledAt: Date): boolean {
  const twoHoursMs = 2 * 60 * 60 * 1000;
  return scheduledAt.getTime() - Date.now() < twoHoursMs;
}

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const { token } = await searchParams;

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Tautan Tidak Valid
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tautan pembatalan janji temu tidak valid atau parameter token tidak ditemukan. Pastikan Anda membuka tautan lengkap yang kami kirimkan.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 shadow-sm text-sm transition-all"
            >
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: {
      branch: true,
      doctor: true,
    },
  });

  if (!appointment) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Janji Temu Tidak Ditemukan
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Data janji temu dengan token ini tidak ditemukan atau telah dihapus dari sistem kami.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 shadow-sm text-sm transition-all"
            >
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappNumber = appointment.branch?.whatsapp?.replace(/\D/g, "") || "6281234567890";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo Klinik Gigi Senyum Sehat, saya ingin konfirmasi perihal janji temu atas nama ${appointment.patientName}.`
  )}`;

  // State 1: Already Cancelled
  if (appointment.status === AppointmentStatus.CANCELLED) {
    const cancelledFormatted = appointment.cancelledAt
      ? formatWibDateTime(appointment.cancelledAt)
      : null;

    return (
      <div className="max-w-xl mx-auto px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Janji Temu Sudah Dibatalkan
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Janji temu untuk <span className="font-semibold text-foreground">{appointment.patientName}</span> pada jadwal{" "}
              <span className="font-semibold text-foreground">
                {formatWibDateTime(appointment.scheduledAt)}
              </span>{" "}
              telah dibatalkan
              {cancelledFormatted ? ` pada ${cancelledFormatted}.` : "."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 shadow-sm text-sm transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Buat Janji Baru</span>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background hover:bg-muted font-semibold h-11 px-6 text-sm text-foreground transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Klinik</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Already Completed
  if (appointment.status === AppointmentStatus.COMPLETED) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Kunjungan Telah Selesai
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Janji temu ini telah selesai dilaksanakan. Anda tidak dapat melakukan pembatalan untuk kunjungan yang sudah berlangsung.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 shadow-sm text-sm transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Buat Janji Baru</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Within 2 Hours Cutoff Rule
  const isCutoff = checkCutoff(appointment.scheduledAt);

  if (isCutoff) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Batas Waktu Pembatalan Mandiri Berakhir
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pembatalan mandiri ditutup 2 jam sebelum jadwal demi persiapan dokter dan sterilisasi ruang tindakan. Untuk pembatalan atau perubahan mendesak, silakan langsung hubungi petugas kami melalui WhatsApp.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/50 border border-border/60 text-left space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Pasien:</span>
              <span>{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Jadwal:</span>
              <span>{formatWibDateTime(appointment.scheduledAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Lokasi Cabang:</span>
              <span>{appointment.branch?.name ?? "Klinik Pusat"}</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11 px-6 shadow-sm text-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Hotline WhatsApp Klinik</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Eligible for cancellation
  const formattedDate = formatWibDateOnly(appointment.scheduledAt);
  const formattedTime = formatWibTimeOnly(appointment.scheduledAt);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          Pembatalan Janji Temu
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Konfirmasi Pembatalan
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Mohon periksa kembali rincian janji temu Anda sebelum melanjutkan proses pembatalan.
        </p>
      </div>

      {/* Appointment Summary Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Rincian Reservasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Nama Pasien</p>
              <p className="text-sm font-semibold text-foreground">{appointment.patientName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Cabang Klinik</p>
              <p className="text-sm font-semibold text-foreground">
                {appointment.branch?.name ?? "Klinik Pusat"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tanggal</p>
              <p className="text-sm font-semibold text-foreground">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Waktu Praktik</p>
              <p className="text-sm font-semibold text-foreground">{formattedTime}</p>
            </div>
          </div>

          {appointment.doctor && (
            <div className="sm:col-span-2 flex items-start gap-3 pt-2 border-t border-border/50">
              <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                Dr
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Dokter yang Menangani</p>
                <p className="text-sm font-semibold text-foreground">{appointment.doctor.name}</p>
                {appointment.doctor.specialty && (
                  <p className="text-xs text-muted-foreground">{appointment.doctor.specialty}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Form Client Component */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
        <CancelForm
          token={token}
          scheduledAt={appointment.scheduledAt}
          branchWhatsapp={appointment.branch?.whatsapp}
        />
      </div>
    </div>
  );
}
