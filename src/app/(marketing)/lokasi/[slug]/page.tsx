import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Building2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Navigation,
  CheckCircle2,
  Users,
} from "lucide-react";
import { mockBranches, mockDoctors } from "@/data/mock-grow";
import { DoctorCard } from "@/components/grow/doctor-card";

interface BranchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BranchDetailPage({
  params,
}: BranchDetailPageProps) {
  const { slug } = await params;

  const branch = mockBranches.find((b) => b.slug === slug);

  if (!branch) {
    notFound();
  }

  // Branch simplified name for doctor matching (e.g. "Cabang Kelapa Gading" -> "Kelapa Gading")
  const branchSimpleName = branch.name.replace("Cabang ", "").trim();

  // Find all doctors practicing at this branch
  const branchDoctors = mockDoctors.filter((doctor) =>
    doctor.branches.some(
      (b) =>
        b.toLowerCase() === branchSimpleName.toLowerCase() ||
        branch.name.toLowerCase().includes(b.toLowerCase())
    )
  );

  const defaultWhatsappMessage = encodeURIComponent(
    `Halo Admin ${branch.name}, saya ingin konsultasi atau reservasi jadwal dokter gigi di cabang ini.`
  );

  return (
    <div className="py-10 md:py-16 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 font-sans">
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
              href="/lokasi"
              className="hover:text-foreground transition-colors"
            >
              Cabang & Lokasi
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          </li>
          <li className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-md">
            {branch.name}
          </li>
        </ol>
      </nav>

      {/* Main Branch Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Left Column: Branch Information Card */}
        <div className="lg:col-span-7 space-y-6">
          {branch.imageUrl && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-muted border border-border/70 shadow-xs">
              <Image
                src={branch.imageUrl}
                alt={branch.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" /> Cabang Resmi Klinik
            </div>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-foreground">
              {branch.name}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Fasilitas kedokteran gigi modern di {branch.city} dengan standar
              pelayanan prima, kenyamanan lounge pasien, dan dokter gigi spesialis
              terlengkap.
            </p>
          </div>

          {/* Contact and Operational Details Card */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-foreground">
              Informasi Operasional & Kontak
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-semibold block">
                    Alamat Lengkap:
                  </span>
                  <span className="text-muted-foreground">{branch.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-semibold block">
                    Jam Operasional:
                  </span>
                  <span className="text-muted-foreground">{branch.hours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-semibold block">
                    Telepon Langsung:
                  </span>
                  <a
                    href={`tel:${branch.phone.replace(/[^0-9+]/g, "")}`}
                    className="text-primary hover:underline font-mono"
                  >
                    {branch.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`https://wa.me/${branch.whatsapp}?text=${defaultWhatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-3 text-xs sm:text-sm transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp Admin</span>
              </a>

              <a
                href={branch.mapEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 hover:bg-muted text-foreground font-semibold px-5 py-3 text-xs sm:text-sm transition-colors"
              >
                <Navigation className="w-4 h-4 text-primary" />
                <span>Petunjuk Arah (Maps)</span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Facilities Checklist Section */}
          <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Fasilitas & Sarana Medis Tersedia
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branch.facilities.map((facility) => (
                <div
                  key={facility}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{facility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Maps Action Card */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                Lokasi & Navigasi
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/50">
                Akses Mudah
              </span>
            </div>

            {/* Map Placeholder Card with Visual Aesthetics */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-muted/70 border border-border/60 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
                <MapPin className="w-7 h-7 animate-bounce" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-bold text-foreground block">
                  {branch.name}
                </span>
                <span className="text-xs text-muted-foreground block max-w-xs">
                  {branch.address}
                </span>
              </div>
              <a
                href={branch.mapEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed pt-1">
              <p>
                *Parkir mobil dan motor tersedia di area klinik. Untuk pasien lansia
                atau berkebutuhan khusus, tim sekuriti siap membantu akses ramp kursi
                roda.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Doctors Practicing at this Branch */}
      <section className="space-y-6 pt-6 border-t border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Users className="w-3.5 h-3.5" /> Tim Dokter Spesialis
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Dokter Gigi Praktik di {branch.name}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pilih dokter spesialis sesuai kebutuhan perawatan dan konsultasikan
              jadwal praktik terkini.
            </p>
          </div>

          <Link
            href="/dokter"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>Lihat Semua Dokter</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {branchDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branchDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-6 rounded-2xl bg-muted/40 border border-border/60">
            <p className="text-sm text-muted-foreground">
              Jadwal dokter spesialis sedang diperbarui. Hubungi admin untuk informasi
              lebih lanjut.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
