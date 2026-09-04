"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  ChevronDown,
  CheckCircle2,
  Activity,
  Layers,
  Award,
} from "lucide-react";
import { mockServices, mockDoctors, mockBranches, mockInsurances } from "@/data/mock-grow";
import { ServiceCard } from "@/components/grow/service-card";
import { DoctorCard } from "@/components/grow/doctor-card";
import { BranchCard } from "@/components/grow/branch-card";
import { BeforeAfterSlider } from "@/components/grow/before-after-slider";

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const treatmentProtocols = [
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

  const homeFaqs = [
    {
      q: "Bagaimana alur konsultasi pertama dan penetapan biaya tindakan?",
      a: "Kunjungan awal diawali foto intraoral digital dan pemeriksaan fisik rongga mulut oleh dokter spesialis. Tim dokter akan memaparkan temuan klinis, alternatif pilihan tindakan, serta rincian biaya yang pasti sebelum prosedur disetujui.",
    },
    {
      q: "Apakah asuransi swasta rekanan dapat langsung diproses tanpa talangan tunai?",
      a: "Ya. Untuk pemegang polis asuransi rekanan (Prudential, Allianz, Mandiri Inhealth, Sinarmas, FWD), kasir kami memfasilitasi swipe cashless langsung sesuai plafon manfaat rawat jalan gigi Anda.",
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

  return (
    <div className="space-y-28 md:space-y-40 pb-32 font-sans selection:bg-primary/20">
      {/* 1. HERO SECTION: Clean Asymmetric Editorial with Contextual Photography */}
      <section className="relative pt-6 md:pt-14 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
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
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">6+ Mitra</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Asuransi & BPJS</p>
                </div>
              </div>
            </div>

            {/* Right Visual Column: Genuine Treatment Environment */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-card border border-border/80 shadow-2xl p-2 group">
                <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/clinic-room.jpg"
                    alt="Ruang Tindakan Klinik Gigi Senyum Sehat"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Doctor Profile Floating Card */}
                  <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted shrink-0 border border-primary/30">
                      <Image
                        src="/images/doctor-sarah.jpg"
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

      {/* 2. INTERACTIVE CLINICAL TRANSFORMATION SLIDER (Genuine Before-After Proof) */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs uppercase font-bold text-primary tracking-widest block">
              Bukti Hasil Klinis
            </span>
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
                href="/layanan/bleaching-gigi"
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

      {/* 3. CLINICAL STANDARDS PROTOCOL: Replaces AI Slop 3-Equal Cards with Professional Checklist */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="space-y-4 max-w-2xl mb-12">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">
            Protokol Klinis
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Empat Pilar Keamanan Perawatan Pasien
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Setiap tindakan di Klinik Gigi Senyum Sehat tunduk pada standar operasional kedokteran gigi modern yang terukur dan transparan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {treatmentProtocols.map((protocol) => (
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

      {/* 4. FEATURED PROCEDURES SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-primary tracking-widest block">
              Pilihan Tindakan
            </span>
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
            <span>Lihat Semua Layanan ({mockServices.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.slice(0, 3).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 5. DOCTORS DIRECTORY SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-primary tracking-widest block">
              Tim Medis
            </span>
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
          {mockDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* 6. DUAL-BRANCH LOCATIONS */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="space-y-3 mb-10 max-w-xl">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">
            Jaringan Cabang
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Kunjungi Cabang Terdekat di Jakarta
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Dilengkapi dental unit ergonomis, ruang sterilisasi standar rumah sakit, dan parkir mobil luas di Kelapa Gading dan Pluit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </section>

      {/* 7. INSURANCE & PAYMENT TRANSPARENCY */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-card border border-border/80 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              Kemudahan Pembayaran
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dukungan Klaim Asuransi dan BPJS Kesehatan
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Nikmati fasilitas swipe cashless dengan kartu asuransi rekanan, atau peroleh kelengkapan berkas reimbursement dengan pendampingan staf kasir kami.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3">
              {mockInsurances.map((ins) => (
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

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">
            Tanya Jawab
          </span>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          {homeFaqs.map((faq, idx) => {
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

      {/* 9. BOTTOM CONVERSION ACTION */}
      <section className="max-w-6xl mx-auto px-6">
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
