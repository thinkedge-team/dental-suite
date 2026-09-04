import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  GraduationCap,
  ChevronRight,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileBadge,
  Sparkles,
} from "lucide-react";
import { mockDoctors } from "@/data/mock-grow";

interface DoctorDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DoctorDetailPage({
  params,
}: DoctorDetailPageProps) {
  const { slug } = await params;

  const doctor = mockDoctors.find((d) => d.slug === slug);

  if (!doctor) {
    notFound();
  }

  const defaultWhatsappMessage = encodeURIComponent(
    `Halo Admin Klinik Senyum Sehat, saya ingin reservasi konsultasi dengan ${doctor.name} (${doctor.title}). Mohon bantuan informasi jadwal dokter.`
  );

  return (
    <div className="py-10 md:py-16 max-w-6xl mx-auto px-6 font-sans">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          </li>
          <li>
            <Link
              href="/dokter"
              className="hover:text-foreground transition-colors"
            >
              Dokter
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          </li>
          <li className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-md">
            {doctor.name}
          </li>
        </ol>
      </nav>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Sticky Profile Card */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Portrait & Core Bio */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-muted border-2 border-primary/20 shadow-xs">
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  fill
                  sizes="(max-width: 640px) 112px, 144px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                  {doctor.specialty}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight pt-1">
                  {doctor.name}
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {doctor.title}
                </p>
                {doctor.subSpecialty && (
                  <p className="text-[11px] text-primary font-medium">
                    Fokus Klinis: {doctor.subSpecialty}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center py-3 border-y border-border/60">
              <div className="p-2 rounded-xl bg-muted/50 border border-border/40">
                <span className="block text-[11px] text-muted-foreground">
                  Pengalaman
                </span>
                <span className="text-sm font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  {doctor.experienceYears} Tahun
                </span>
              </div>
              <div className="p-2 rounded-xl bg-muted/50 border border-border/40">
                <span className="block text-[11px] text-muted-foreground">
                  Status SIP & STR
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Aktif / KKI
                </span>
              </div>
            </div>

            {/* Credential Details: SIP & STR */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Nomor Registrasi Legal
              </span>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <FileBadge className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-foreground font-medium">SIP: </span>
                    <span className="text-muted-foreground">{doctor.sipNumber}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <FileBadge className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-foreground font-medium">STR: </span>
                    <span className="text-muted-foreground">{doctor.strNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Pendidikan */}
            <div className="space-y-2.5 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Riwayat Pendidikan
              </span>
              <div className="space-y-2">
                {doctor.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-muted-foreground"
                  >
                    <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90 font-medium leading-relaxed">
                      {edu}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Booking CTA */}
            <div className="pt-2 space-y-3">
              <a
                href={`https://wa.me/6281234567890?text=${defaultWhatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-3 text-sm transition-all shadow-md shadow-primary/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Booking Konsultasi Dokter</span>
              </a>

              <p className="text-center text-[11px] text-muted-foreground">
                Respon cepat customer care WhatsApp &lt; 5 menit pada jam operasional
              </p>
            </div>
          </div>
        </aside>

        {/* Right Column: Bio & Practice Schedule */}
        <div className="lg:col-span-8 space-y-10">
          {/* Header Title on Right Column */}
          <div className="space-y-3 pb-6 border-b border-border/70">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Profil Dokter Gigi Spesialis
            </div>
            <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">
              Dedikasi Medis & <span className="font-bold">Pendekatan Klinis</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Keahlian komprehensif drg. spesialis kami memastikan setiap tindakan
              direncanakan secara detail, berbasis data radiologis digital, dan
              mengutamakan kenyamanan serta konservasi struktur gigi alami.
            </p>
          </div>

          {/* Biografi & Filosofi Klinis */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Tentang Dokter
            </h3>
            <div className="rounded-2xl bg-card border border-border/70 p-6 shadow-xs leading-relaxed text-muted-foreground text-sm md:text-base space-y-4">
              <p>{doctor.bio}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Teknik minimal invasif berstandar internasional
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Sterilisasi instrumen autoklaf kelas B teruji
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Cabang Praktik */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Lokasi Praktik Aktif
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctor.branches.map((branch) => (
                <div
                  key={branch}
                  className="rounded-xl bg-card border border-border/70 p-4 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">
                      Cabang Klinik
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      Klinik Senyum Sehat {branch}
                    </span>
                  </div>
                  <Link
                    href={`/lokasi/${branch === "Pluit" ? "pluit" : "kelapa-gading"}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Peta Lokasi
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Comprehensive Practice Schedule Table */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Jadwal Praktik Rutin
              </h3>
              <span className="text-xs text-muted-foreground">
                *Jadwal dapat berubah sewaktu-waktu sesuai reservasi tindakan bedah
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl bg-card border border-border/70 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Hari
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Cabang
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Jam Praktik
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6">
                        Status
                      </th>
                      <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {doctor.schedule.map((item, index) => {
                      const scheduleWaMessage = encodeURIComponent(
                        `Halo Admin Klinik Senyum Sehat, saya ingin reservasi konsultasi dengan ${doctor.name} pada hari ${item.day} di cabang ${item.branch} (Jam: ${item.hours}).`
                      );

                      return (
                        <tr
                          key={index}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-4 sm:px-6 font-semibold text-foreground whitespace-nowrap">
                            {item.day}
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-muted-foreground whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                              {item.branch}
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-muted-foreground whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-foreground font-medium">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              {item.hours} WIB
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Tersedia
                            </span>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <a
                              href={`https://wa.me/6281234567890?text=${scheduleWaMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/25 transition-colors cursor-pointer"
                            >
                              <span>Pilih Jadwal</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Additional Clinical Assurance Note */}
          <div className="rounded-2xl bg-muted/40 border border-border/70 p-6 space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Jaminan Layanan & Kebijakan Kedatangan
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pasien disarankan hadir 10-15 menit sebelum jam konsultasi untuk
              pemeriksaan tekanan darah dan rekam medis awal. Untuk pembatalan atau
              perubahan jadwal, mohon konfirmasi maksimal 3 jam sebelumnya melalui
              WhatsApp admin cabang terkait.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
