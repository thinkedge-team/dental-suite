import { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  FileText,
  ShieldCheck,
  CalendarCheck,
  MessageCircle,
  Layers,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BranchCard } from "@/components/grow/branch-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cabang & Lokasi Klinik | Klinik Gigi Senyum Sehat",
  description:
    "Temukan cabang Klinik Gigi Senyum Sehat di Kelapa Gading dan Pluit, Jakarta Utara. Rekam medis digital terintegrasi, standar sterilisasi rumah sakit, dan dokter spesialis lengkap.",
};

export default async function LocationsPage() {
  const branches = await prisma.branch.findMany({
    where: {
      organization: { slug: "senyum-sehat" },
      isActive: true,
    },
    include: {
      branchDoctors: {
        include: {
          doctor: true,
        },
      },
    },
  });

  const mappedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    address: b.address,
    city: b.city,
    whatsapp: b.whatsapp,
    photoUrls: b.photoUrls,
    openingHours: b.openingHours,
  }));

  return (
    <div className="py-12 md:py-20 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 font-sans">
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" /> Jaringan Klinik Modern
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Jaringan Cabang <span className="font-bold">Klinik Gigi Senyum Sehat</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Hadir di lokasi strategis Jakarta Utara dengan fasilitas berstandar
          internasional. Satu sistem terintegrasi yang memudahkan perawatan Anda di
          seluruh cabang kami.
        </p>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {mappedBranches.map((branch) => (
          <BranchCard key={branch.id} branch={branch} />
        ))}
      </div>

      {/* Multi-Branch Integrated Network Benefits */}
      <section className="mb-16 rounded-3xl bg-muted/30 border border-border/70 p-8 md:p-12 shadow-xs">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" /> Keunggulan Jaringan Multi-Cabang
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Perawatan Lebih Mudah dengan Sistem Terpusat
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Ke mana pun cabang yang Anda kunjungi, Anda mendapatkan kesinambungan
            perawatan medis yang sama tanpa harus mengulang pemeriksaan dari nol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Benefit 1: Satu Rekam Medis Terintegrasi */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Satu Rekam Medis Terintegrasi
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Riwayat radiografi digital, foto intraoral, catatan alergi obat, dan
                rencana perawatan odontogram Anda tersimpan aman secara cloud. Pasien
                dapat berkonsultasi di Kelapa Gading pada hari kerja dan melanjutkan
                tindakan di Pluit pada akhir pekan dengan dokter spesialis yang
                memiliki data rekam medis lengkap Anda.
              </p>
            </div>
          </div>

          {/* Benefit 2: Standar Higienitas Internasional */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Standar Higienitas Internasional & Autoklaf Kelas B
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Seluruh cabang menerapkan protokol sterilisasi instrumen kedokteran
                gigi terpadu dengan mesin Autoklaf Kelas B standar Kemenkes RI dan
                indikator biologis mingguan. Jarum, handscoon, saliva ejector, dan bib
                selalu baru dan 100% sekali pakai demi keamanan pasien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl bg-foreground text-background p-8 md:p-12 relative overflow-hidden shadow-lg border border-border/30">
        <div
          className="absolute inset-0 opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url("/images/dashboard-hero.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <CalendarCheck className="w-3.5 h-3.5" /> Kunjungan Mudah & Terjadwal
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
              Siap Berkunjung ke <span className="font-bold">Cabang Terdekat?</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Tim front office kami siap membantu memilihkan dokter spesialis dan jam
              perawatan yang paling sesuai dengan jadwal Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Senyum%20Sehat,%20saya%20ingin%20reservasi%20di%20cabang%20terdekat."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:shadow-primary/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reservasi via WhatsApp</span>
            </a>
            <Link
              href="/dokter"
              className="inline-flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3.5 text-sm transition-colors"
            >
              Lihat Tim Dokter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
