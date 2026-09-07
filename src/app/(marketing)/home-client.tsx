"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Activity,
  Star,
  Quote,
  GraduationCap,
  Microscope,
  Tag,
  Images,
  X,
} from "lucide-react";
import { ServiceCard, type ServiceCardData } from "@/components/grow/service-card";
import { DoctorCard, type DoctorCardData } from "@/components/grow/doctor-card";
import { BranchCard, type BranchCardData } from "@/components/grow/branch-card";
import { BeforeAfterSlider } from "@/components/grow/before-after-slider";

interface PromoItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  discountValue: string;
  discountLabel: string;
  priceFrom: string;
  priceOriginal?: string;
  expiresLabel: string;
  ctaText: string;
  imageUrl: string;
  category: string;
  whatsappMessage: string;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  content: string;
  treatment: string;
  date: string;
  avatarUrl?: string;
  verified: boolean;
}

interface TechItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  benefits: string[];
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: "Klinik" | "Peralatan" | "Tim";
  imageUrl: string;
  size: "normal" | "wide";
}

const PROMOS: PromoItem[] = [
  {
    id: "promo-1",
    title: "Pemutihan Gigi Profesional In-Office",
    description: "Naik 6-8 shade kecerahan dalam 60 menit dengan teknologi LED bleaching tanpa ngilu.",
    badge: "Terlaris",
    badgeColor: "#f38218",
    discountValue: "30%",
    discountLabel: "OFF",
    priceFrom: "Rp 750.000",
    priceOriginal: "Rp 1.100.000",
    expiresLabel: "Berlaku s/d 30 Sep 2026",
    ctaText: "Booking via WhatsApp",
    imageUrl: "/images/promo-whitening.jpg",
    category: "Estetika",
    whatsappMessage: "Halo, saya ingin booking Promo Pemutihan Gigi Profesional.",
  },
  {
    id: "promo-2",
    title: "Scaling Ultrasonic + Poles Gigi Gratis",
    description: "Bersihkan karang gigi menyeluruh sekaligus dapatkan poles gigi gratis di kunjungan yang sama.",
    badge: "Terbatas",
    badgeColor: "#059669",
    discountValue: "25%",
    discountLabel: "OFF",
    priceFrom: "Rp 300.000",
    priceOriginal: "Rp 400.000",
    expiresLabel: "Berlaku s/d 15 Okt 2026",
    ctaText: "Booking via WhatsApp",
    imageUrl: "/images/service-scaling.jpg",
    category: "Pencegahan",
    whatsappMessage: "Halo, saya ingin booking Promo Scaling Ultrasonic.",
  },
  {
    id: "promo-3",
    title: "Konsultasi Implan Gigi Gratis",
    description: "Foto panoramik digital + konsultasi rencana tindakan implan dengan dokter spesialis bedah mulut tanpa biaya.",
    badge: "Konsultasi Gratis",
    badgeColor: "#7c3aed",
    discountValue: "100%",
    discountLabel: "GRATIS",
    priceFrom: "Rp 0",
    priceOriginal: "Rp 500.000",
    expiresLabel: "Khusus Pasien Baru",
    ctaText: "Booking via WhatsApp",
    imageUrl: "/images/promo-implant.jpg",
    category: "Bedah Mulut",
    whatsappMessage: "Halo, saya ingin booking Promo Konsultasi Implan Gigi.",
  },
];

const TECHNOLOGIES: TechItem[] = [
  {
    id: "tech-1",
    name: "Autoklaf Vakum Kelas B Eropa",
    tagline: "Sterilisasi 134°C Rumah Sakit",
    description: "Mesin sterilisasi standar tertinggi yang digunakan rumah sakit Eropa untuk jaminan 100% eliminasi spora dan bakteri pada seluruh instrumen medis.",
    imageUrl: "/images/gallery-sterilization.jpg",
    benefits: [
      "Siklus vakum fraksinasi 134°C bertekanan tinggi",
      "Indikator biologis mingguan terverifikasi laboratorium",
      "Pouch steril sekali pakai dibuka di hadapan pasien",
    ],
  },
  {
    id: "tech-2",
    name: "Unit Rontgen Panoramik Digital 3D",
    tagline: "Diagnostik Presisi Sub-Milimeter",
    description: "Foto rontgen seluruh rahang beresolusi tinggi dengan radiasi 80% lebih rendah dibanding rontgen analog konvensional, memberikan visualisasi instan kondisi akar gigi dan saraf.",
    imageUrl: "/images/gallery-xray-room.jpg",
    benefits: [
      "Dosis radiasi ultra-rendah aman untuk anak dan dewasa",
      "Hasil foto digital siap dalam waktu kurang dari 2 menit",
      "Deteksi karies tersembunyi dan posisi gigi bungsu impaksi",
    ],
  },
  {
    id: "tech-3",
    name: "Piezo-Ultrasonic Scaler",
    tagline: "Pembersihan Karang Bebas Ngilu",
    description: "Getaran ultrasonik mikro terkalibrasi khusus yang melepaskan kalkulus dan noda plak tanpa mengikis jaringan enamel gigi atau melukai gusi.",
    imageUrl: "/images/service-scaling.jpg",
    benefits: [
      "Getaran lembut minim rasa ngilu saat scaling",
      "Irigasi antiseptik terintegrasi mencegah radang gusi",
      "Hasil pembersihan optimal pada sela-sela gigi sempit",
    ],
  },
];

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "testi-1",
    name: "Clarissa Wijaya",
    role: "Karyawan Swasta",
    location: "Kelapa Gading",
    rating: 5,
    content: "Pertama kali scaling yang benar-benar tidak ngilu sama sekali. Dokternya sangat komunikatif dan menjelaskan kondisi gigi lewat foto monitor sebelum tindakan.",
    treatment: "Scaling Ultrasonic & Poles",
    date: "Agustus 2026",
    avatarUrl: "/images/doctor-sarah.jpg",
    verified: true,
  },
  {
    id: "testi-2",
    name: "Hendrik Prasetyo",
    role: "Wiraswasta",
    location: "Pluit",
    rating: 5,
    content: "Operasi gigi bungsu impaksi berjalan lancar tanpa rasa sakit berlebih. Pemulihannya cepat dan proses klaim asuransi Prudential langsung diproses kasir tanpa ribet.",
    treatment: "Odontektomi Gigi Bungsu",
    date: "Juli 2026",
    avatarUrl: "/images/doctor-budi.jpg",
    verified: true,
  },
  {
    id: "testi-3",
    name: "Melinda Tan",
    role: "Ibu Rumah Tangga",
    location: "Sunter",
    rating: 5,
    content: "Kliniknya sangat bersih dan wangi, tidak ada bau obat sama sekali. Anak saya yang biasanya takut dokter gigi malah tenang saat ditambal giginya.",
    treatment: "Tambal Komposit Estetis",
    date: "Agustus 2026",
    avatarUrl: "/images/doctor-jessica.jpg",
    verified: true,
  },
];

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Ruang Tindakan Utama",
    description: "Dental unit ergonomis berstandar internasional dengan pencahayaan LED dingin.",
    category: "Klinik",
    imageUrl: "/images/clinic-room.jpg",
    size: "wide",
  },
  {
    id: "gal-2",
    title: "Ruang Sterilisasi Terpusat",
    description: "Autoklaf vakum kelas B dan sistem verifikasi indikator biologis mingguan.",
    category: "Peralatan",
    imageUrl: "/images/gallery-sterilization.jpg",
    size: "normal",
  },
  {
    id: "gal-3",
    title: "Unit Rontgen Panoramik Digital",
    description: "Radiografi digital dosis radiasi ultra-rendah untuk diagnostik akurat.",
    category: "Peralatan",
    imageUrl: "/images/gallery-xray-room.jpg",
    size: "normal",
  },
  {
    id: "gal-4",
    title: "Lobi & Resepsionis Ramah",
    description: "Sistem check-in digital terhubung dua cabang di Jakarta Utara.",
    category: "Klinik",
    imageUrl: "/images/gallery-reception.jpg",
    size: "normal",
  },
  {
    id: "gal-5",
    title: "Tim Medis Spesialis",
    description: "Dokter gigi spesialis berpengalaman dan perawat profesional berlisensi.",
    category: "Tim",
    imageUrl: "/images/gallery-team.jpg",
    size: "wide",
  },
];

const INSURANCES_SUMMARY = [
  { id: "ins-1", logoText: "ADMEDIKA", type: "CASHLESS" },
  { id: "ins-2", logoText: "PRUDENTIAL", type: "CASHLESS" },
  { id: "ins-3", logoText: "BCA LIFE", type: "CASHLESS" },
  { id: "ins-4", logoText: "MANDIRI", type: "CASHLESS" },
  { id: "ins-5", logoText: "SINARMAS", type: "CASHLESS" },
  { id: "ins-6", logoText: "BPJS KESEHATAN", type: "REIMBURSEMENT" },
];

const TREATMENT_PROTOCOLS = [
  {
    num: "01",
    title: "Diagnostik Intraoral 3D",
    desc: "Pemetaan seluruh gigi dan gusi beresolusi sub-milimeter tanpa cetakan pasta alginat yang memicu mual. Pasien melihat visualisasi 3D kondisi gigi di layar monitor secara real-time.",
    detail: "Intraoral Optical Scanner · Hasil 45 Detik",
  },
  {
    num: "02",
    title: "Sterilisasi Autoklaf Vakum Kelas B",
    desc: "Setiap alat medis dibungkus kantong steril kedap udara dan diproses melalui siklus vakum fraksinasi 134°C standar rumah sakit Eropa untuk jaminan nol kontaminasi silang.",
    detail: "Siklus Terverifikasi Biologis Tiap Tindakan",
  },
  {
    num: "03",
    title: "Minimal Invasif & Proteksi Enamel",
    desc: "Perawatan konservatif mempertahankan sebanyak mungkin jaringan gigi asli. Pembersihan piezo-ultrasonic mengangkat kalkulus tanpa mengikis permukaan dentin atau gusi.",
    detail: "Preservasi Struktur Gigi Asli",
  },
  {
    num: "04",
    title: "Satu Rekam Medis Dua Cabang",
    desc: "Histori rontgen panoramik dan rencana tindakan tersinkronisasi otomatis. Anda leluasa berkonsultasi di Kelapa Gading pada hari kerja dan melanjutkan perawatan di Pluit di akhir pekan.",
    detail: "Terhubung Penuh Think Edge Network",
  },
];

const HOME_FAQS = [
  {
    q: "Bagaimana alur konsultasi pertama dan penetapan biaya tindakan?",
    a: "Kunjungan awal diawali foto intraoral digital dan pemeriksaan fisik rongga mulut oleh dokter spesialis. Tim dokter akan memaparkan temuan klinis, alternatif pilihan tindakan, serta rincian biaya yang pasti sebelum prosedur disetujui.",
  },
  {
    q: "Apakah asuransi swasta rekanan dapat langsung diproses tanpa talangan tunai?",
    a: "Ya. Untuk pemegang polis asuransi rekanan (AdMedika, Prudential, BCA Life, Mandiri Inhealth, Sinarmas), kasir kami memfasilitasi swipe cashless langsung sesuai plafon manfaat rawat jalan gigi Anda.",
  },
  {
    q: "Bagaimana cara memastikan jadwal kunjungan tepat waktu tanpa antre?",
    a: "Setiap reservasi melalui WhatsApp atau portal dikunci pada slot waktu spesifik per dokter. Anda cukup hadir 10 menit sebelum jadwal untuk registrasi dan langsung dipersilakan masuk ruang tindakan.",
  },
  {
    q: "Apakah tindakan pembersihan karang gigi (scaling) menyebabkan gigi renggang?",
    a: "Tidak. Scaling hanya mengangkat karang gigi yang mengeras dan menutupi sela gigi. Ruang yang terasa setelah karang terangkat adalah bentuk anatomi asli gigi yang sebelumnya terhalang tumpukan kotoran.",
  },
];

interface HomePageClientProps {
  services: ServiceCardData[];
  doctors: DoctorCardData[];
  branches: BranchCardData[];
}

export function HomePageClient({ services, doctors, branches }: HomePageClientProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTech, setActiveTech] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"all" | "Klinik" | "Peralatan" | "Tim">("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const promoRef = useRef<HTMLDivElement>(null);

  const filteredGallery = GALLERY_ITEMS.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );

  return (
    <div className="space-y-28 md:space-y-40 pb-32 font-sans selection:bg-primary/20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 md:pt-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Klinik Spesialis Berizin Kemenkes RI · Jakarta Utara</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12] text-foreground">
                Kesehatan rongga mulut presisi untuk{" "}
                <span className="font-bold text-foreground underline decoration-primary/40 decoration-wavy underline-offset-8">
                  senyum percaya diri
                </span>
                .
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                Diagnostik intraoral 3D beresolusi tinggi, penanganan langsung dokter spesialis lulusan universitas terkemuka, dan sistem antrean digital terintegrasi di Kelapa Gading serta Pluit.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link
                  href="/layanan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-6 shadow-md shadow-primary/20 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Jelajahi Pilihan Layanan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dokter"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card hover:bg-muted font-semibold h-12 px-6 text-sm sm:text-base transition-all hover:border-primary/40"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Jadwal Praktik Dokter</span>
                </Link>
              </div>

              {/* Verified Facts & Network Presence */}
              <div className="pt-8 border-t border-border/70 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">2 Cabang</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Kelapa Gading & Pluit</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Rekam Medis Terhubung</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">5+ Mitra</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Asuransi & Cashless</p>
                </div>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-card border border-border/80 shadow-2xl p-2 group">
                <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/clinic-room.jpg"
                    alt="Ruang Tindakan Klinik Gigi Senyum Sehat"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 550px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Doctor Profile Floating Card */}
                  <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted shrink-0 border border-primary/30">
                      <Image
                        src="/images/doctor-jessica.jpg"
                        alt="drg. Sarah Amanda, Sp.KG"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">drg. Sarah Amanda, Sp.KG</p>
                      <p className="text-[10px] text-primary font-semibold">Konservasi Gigi & Estetika</p>
                    </div>
                  </div>

                  {/* Bottom Highlight */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                      <Activity className="w-3.5 h-3.5" />
                      Sterilisasi Vakum Autoklaf Kelas B
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold leading-snug">
                      Standar higienitas rumah sakit internasional di setiap tindakan.
                    </h3>
                    <p className="text-xs text-white/75">
                      Peralatan autoklaf fraksinasi 134°C untuk jaminan sterilitas tanpa kompromi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMO SLIDER */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Tag className="w-4 h-4" />
              Penawaran Terbatas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Promo Spesial Untuk Anda</h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => promoRef.current?.scrollBy({ left: -420, behavior: "smooth" })}
              className="w-10 h-10 rounded-xl border border-border/70 bg-card flex items-center justify-center hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => promoRef.current?.scrollBy({ left: 420, behavior: "smooth" })}
              className="w-10 h-10 rounded-xl border border-border/70 bg-card flex items-center justify-center hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={promoRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
          {PROMOS.map((promo) => (
            <a
              key={promo.id}
              href={`https://wa.me/6281234567890?text=${encodeURIComponent(promo.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[360px] sm:w-[420px] rounded-2xl overflow-hidden border border-border/70 bg-card shadow-sm hover:shadow-lg hover:border-primary/40 transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={promo.imageUrl}
                  alt={promo.title}
                  fill
                  sizes="420px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: promo.badgeColor }}>
                    {promo.badge}
                  </span>
                  <div className="text-right bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <p className="text-xl font-black text-white leading-none">{promo.discountValue}</p>
                    <p className="text-[10px] text-white/80 font-semibold">{promo.discountLabel}</p>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="text-[10px] text-white/70 font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                    {promo.category}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-foreground text-base leading-snug">{promo.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{promo.description}</p>
                </div>
                <div className="flex items-end justify-between pt-1 border-t border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">Mulai dari</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">{promo.priceFrom}</span>
                      {promo.priceOriginal && (
                        <span className="text-xs text-muted-foreground line-through">{promo.priceOriginal}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{promo.expiresLabel}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {promo.ctaText}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE CLINICAL TRANSFORMATION SLIDER */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
              Transformasi senyum nyata dengan teknik minimal invasif.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Geser garis slider di samping untuk melihat perbandingan gigi sebelum dan sesudah prosedur pembersihan karang ultrasonik dan pemutihan profesional dalam satu kali kunjungan.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/70">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Warna Cerah Alami Merata</p>
                  <p className="text-xs text-muted-foreground">Peningkatan 6 sampai 8 tingkat kecerahan tanpa mengikis lapisan enamel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/70">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Gusi Sehat & Bebas Radang</p>
                  <p className="text-xs text-muted-foreground">Pengangkatan kalkulus subgingival tuntas untuk mencegah radang dan bau mulut.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/layanan/pemutihan-gigi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <span>Pelajari Prosedur Pemutihan Gigi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BeforeAfterSlider
              beforeImage="/images/smile-before.jpg"
              afterImage="/images/smile-after.jpg"
              beforeLabel="Sebelum Perawatan"
              afterLabel="Sesudah Bleaching & Scaling"
            />
          </div>
        </div>
      </section>

      {/* 4. CLINICAL STANDARDS PROTOCOL */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-3 max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Empat Pilar Keamanan Perawatan Pasien
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Setiap tindakan di Klinik Gigi Senyum Sehat tunduk pada standar operasional kedokteran gigi modern yang terukur dan transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TREATMENT_PROTOCOLS.map((protocol) => (
            <div
              key={protocol.num}
              className="rounded-2xl bg-card border border-border/70 p-7 shadow-xs hover:border-primary/40 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary/80 font-mono">
                  {protocol.num}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {protocol.detail}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {protocol.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {protocol.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ABOUT FOUNDER / MEDICAL DIRECTOR */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[3/4] max-h-[560px] shadow-2xl">
              <Image
                src="/images/founder-portrait.jpg"
                alt="drg. Aditya Nugraha, Sp.KG, M.Kes - Direktur Medis"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Floating experience badge */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Direktur Medis</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">drg. Aditya Nugraha, Sp.KG, M.Kes</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-primary">15+</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">Tahun Pengalaman</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                Tentang Direktur Medis
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
                Dedikasi 15 tahun membangun standar klinis yang melampaui ekspektasi pasien.
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                drg. Aditya Nugraha meraih spesialisasi Konservasi Gigi dari Universitas Indonesia dan gelar Master Kesehatan dari Universitas Gadjah Mada. Beliau memimpin implementasi sistem sterilisasi Autoklaf Kelas B dan integrasi rekam medis cloud di seluruh jaringan klinik.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "50K+", label: "Pasien Ditangani" },
                { num: "4.9★", label: "Rating Google Maps" },
                { num: "2 Cabang", label: "Jakarta Utara" },
                { num: "5+", label: "Mitra Asuransi" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-card border border-border/70 p-5 space-y-1">
                  <p className="text-2xl font-bold text-primary">{stat.num}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                "Lulusan Sp.KG Universitas Indonesia, M.Kes Universitas Gadjah Mada",
                "Konsultan Klinis berpengalaman di rumah sakit rujukan nasional",
                "Instruktur pelatihan kedokteran gigi restoratif dan endodontik",
              ].map((cred) => (
                <div key={cred} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground font-medium">{cred}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. MEDICAL TECHNOLOGY SHOWCASE */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-3 max-w-2xl mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Microscope className="w-4 h-4" />
            Teknologi Medis Unggulan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Peralatan klinis setara standar rumah sakit swasta premium.
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TECHNOLOGIES.map((tech, idx) => (
            <button
              key={tech.id}
              type="button"
              onClick={() => setActiveTech(idx)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTech === idx
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {tech.name.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>

        {/* Active Tech Panel */}
        {TECHNOLOGIES[activeTech] && (
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden aspect-video shadow-xl">
              <Image
                src={TECHNOLOGIES[activeTech].imageUrl}
                alt={TECHNOLOGIES[activeTech].name}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow">
                  {TECHNOLOGIES[activeTech].tagline}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {TECHNOLOGIES[activeTech].name}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-3">
                  {TECHNOLOGIES[activeTech].description}
                </p>
              </div>

              <div className="space-y-3">
                {TECHNOLOGIES[activeTech].benefits.map((b) => (
                  <div key={b} className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/70">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground font-medium leading-snug">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 7. PATIENT TESTIMONIALS */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              50.000+ pasien mempercayakan senyum mereka kepada kami.
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">4.9</span>
              <span className="text-sm text-muted-foreground">· Ulasan Google Maps Terverifikasi</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card border border-border/70 p-6 space-y-4 hover:border-primary/40 transition-colors shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-primary/30" />
              </div>

              <p className="text-sm text-foreground leading-relaxed">{t.content}</p>

              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
                    <Image src={t.avatarUrl ?? "/images/doctor-sarah.jpg"} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role} · {t.location}</p>
                  </div>
                  {t.verified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                  Prosedur: {t.treatment} · {t.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FEATURED PROCEDURES SHOWCASE (Prisma Database Driven) */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Layanan Perawatan Unggulan
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Biaya transparan dan prosedur medis terencana untuk setiap kebutuhan Anda.
            </p>
          </div>

          <Link
            href="/layanan"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>Lihat Semua Layanan ({services.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 9. DOCTORS DIRECTORY SHOWCASE (Prisma Database Driven) */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Dokter Gigi Spesialis Kami
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Berpengalaman, komunikatif, dan terdaftar resmi di Konsil Kedokteran Indonesia.
            </p>
          </div>

          <Link
            href="/dokter"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors group"
          >
            <span>Semua Profil Dokter</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* 10. DUAL-BRANCH LOCATIONS (Prisma Database Driven) */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="space-y-3 mb-10 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Kunjungi Cabang Terdekat di Jakarta
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Dilengkapi dental unit ergonomis, ruang sterilisasi standar rumah sakit, dan parkir mobil luas di Kelapa Gading dan Pluit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {branches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </section>

      {/* 11. INSURANCE & PAYMENT TRANSPARENCY */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-card border border-border/80 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dukungan Klaim Asuransi dan Fasilitas Cashless
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Nikmati fasilitas swipe cashless dengan kartu asuransi rekanan, atau peroleh kelengkapan berkas reimbursement dengan pendampingan staf kasir kami.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3">
              {INSURANCES_SUMMARY.map((ins) => (
                <div
                  key={ins.id}
                  className="p-3 rounded-xl bg-muted/50 border border-border/60 flex flex-col items-center justify-center text-center space-y-1 hover:border-primary/40 transition-colors"
                >
                  <span className="text-[11px] font-bold text-foreground tracking-tight">
                    {ins.logoText}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    {ins.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Link
                href="/asuransi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <span>Pelajari Panduan Lengkap Klaim Asuransi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. GALLERY SECTION */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
              <Images className="w-4 h-4" />
              Galeri Fasilitas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Fasilitas klinik standar rumah sakit, lingkungan nyaman.
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            {(["all", "Klinik", "Peralatan", "Tim"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {f === "all" ? "Semua" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredGallery.map((item, idx) => (
            <div
              key={item.id}
              className="break-inside-avoid rounded-2xl overflow-hidden relative group cursor-pointer border border-border/50 hover:border-primary/40 transition-colors"
              onClick={() => setLightboxIdx(idx)}
            >
              <div className={`relative ${item.size === "wide" ? "aspect-video" : "aspect-[4/3]"} overflow-hidden`}>
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-white/70 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded w-fit mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-xs text-white/75 mt-0.5">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lightboxIdx !== null && (() => {
          const item = filteredGallery[lightboxIdx];
          if (!item) return null;
          return (
            <div
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setLightboxIdx(null)}
            >
              <button
                type="button"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                onClick={() => setLightboxIdx(null)}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((lightboxIdx - 1 + filteredGallery.length) % filteredGallery.length);
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((lightboxIdx + 1) % filteredGallery.length);
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                  <span className="text-xs font-bold text-white/70">{item.category}</span>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{item.description}</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-semibold">
                {lightboxIdx + 1} / {filteredGallery.length}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 13. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          {HOME_FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-card border border-border/70 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-semibold text-foreground text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 14. BOTTOM CONVERSION ACTION */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="relative rounded-3xl bg-foreground text-background p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: 'url("/images/clinic-room.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80 z-0" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">
              Konsultasi Pertama
            </span>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
              Mulai langkah <span className="font-bold">senyum sehat Anda</span> bersama kami.
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Konsultasikan keluhan atau rencana perawatan gigi Anda langsung dengan staf medis kami melalui WhatsApp untuk konfirmasi slot jadwal tercepat.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Klinik%20Gigi%20Senyum%20Sehat%2C%20saya%20ingin%20konsultasi%20jadwal%20perawatan."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-12 px-6 shadow-md text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Konsultasi via WhatsApp</span>
              </a>

              <Link
                href="/layanan"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold h-12 px-6 text-sm sm:text-base transition-all"
              >
                <span>Lihat Biaya Tindakan</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
