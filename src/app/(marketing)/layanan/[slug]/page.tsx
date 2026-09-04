import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  CalendarCheck,
} from "lucide-react";
import { mockServices } from "@/data/mock-grow";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;

  const service = mockServices.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(service.basePrice);

  const whatsappMessage = encodeURIComponent(
    `Halo Admin Klinik Senyum Sehat, saya ingin reservasi/konsultasi untuk perawatan: ${service.name}. Mohon informasi jadwal yang tersedia.`
  );

  return (
    <div className="py-10 md:py-16 max-w-6xl mx-auto px-6 font-sans">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          </li>
          <li>
            <Link
              href="/layanan"
              className="hover:text-foreground transition-colors"
            >
              Layanan
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
          </li>
          <li className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-md">
            {service.name}
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <div className="border-b border-border/70 pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-semibold">
            {service.categoryLabel}
          </span>
          {service.insuranceCovered && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Didukung Asuransi & BPJS</span>
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground leading-[1.2] max-w-3xl">
          {service.name}
        </h1>

        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {service.shortDesc}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-foreground/80">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Durasi: <strong>{service.durationMinutes} Menit</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Mulai Dari:</span>
            <span className="text-lg font-bold text-foreground">{formattedPrice}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Procedure Details */}
        <div className="lg:col-span-8 space-y-10">
          {/* Tentang Perawatan */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              Tentang Perawatan
            </h2>

            {service.imageUrl && (
              <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-muted border border-border/70 shadow-xs mb-4">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="rounded-2xl bg-card border border-border/70 p-6 shadow-xs leading-relaxed text-muted-foreground text-sm md:text-base space-y-3">
              <p>{service.description}</p>
            </div>
          </section>

          {/* Indikasi Perawatan */}
          {service.indications && service.indications.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                Indikasi Perawatan
              </h2>
              <p className="text-xs text-muted-foreground">
                Tindakan ini sangat direkomendasikan jika Anda mengalami salah satu kondisi berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.indications.map((indication, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/70 shadow-xs"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground">
                      {indication}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tahapan Tindakan */}
          {service.steps && service.steps.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                Tahapan Tindakan
              </h2>
              <div className="space-y-3">
                {service.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/70 shadow-xs"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pertanyaan Umum (FAQ) */}
          {service.faqs && service.faqs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                Pertanyaan Umum (FAQ)
              </h2>
              <div className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-card border border-border/70 p-5 shadow-xs space-y-2"
                  >
                    <h3 className="text-sm font-semibold text-foreground flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{faq.question}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sticky Booking Card */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">
                Estimasi Investasi
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {formattedPrice}
                </span>
                <span className="text-xs text-muted-foreground">/ tindakan</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                *Tarif final ditentukan berdasarkan hasil pemeriksaan dokter.
              </p>
            </div>

            <div className="space-y-3 py-4 border-y border-border/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Waktu Layanan
                </span>
                <span className="font-semibold text-foreground">
                  ~{service.durationMinutes} Menit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Status Asuransi
                </span>
                <span className="font-semibold text-foreground">
                  {service.insuranceCovered ? "Mendukung Cashless" : "Privat / Umum"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5" /> Penjadwalan
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Tersedia Hari Ini
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/6281234567890?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-3 text-sm transition-all shadow-md shadow-primary/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reservasi via WhatsApp</span>
              </a>

              <Link
                href="/dokter"
                className="w-full inline-flex items-center justify-center rounded-xl border border-border hover:bg-muted text-foreground font-medium px-4 py-2.5 text-xs transition-colors"
              >
                Lihat Jadwal Dokter Spesialis
              </Link>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/40">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span>
                  Jaminan sterilisasi instrumen autoclave kelas medis dan kenyamanan ruang tindakan individual.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
