"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  MapPin,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Award,
  Phone,
  MessageCircle,
  Building2,
  HelpCircle,
  ChevronDown,
  Star,
  Activity,
} from "lucide-react";
import { mockServices, mockDoctors, mockBranches, mockInsurances } from "@/data/mock-grow";
import { ServiceCard } from "@/components/grow/service-card";
import { DoctorCard } from "@/components/grow/doctor-card";
import { BranchCard } from "@/components/grow/branch-card";

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const homeFaqs = [
    {
      q: "Bagaimana cara membuat janji temu konsultasi dokter gigi?",
      a: "Anda dapat memilih jadwal melalui tombol 'Lihat Jadwal Dokter' di atas, atau langsung klik tombol WhatsApp CS kami untuk dibantu memilih dokter dan cabang terdekat tanpa antre.",
    },
    {
      q: "Apakah Klinik Gigi Senyum Sehat menerima klaim asuransi?",
      a: "Ya! Kami bekerja sama dengan lebih dari 6 mitra asuransi terkemuka seperti Prudential, Allianz, Mandiri Inhealth, FWD, Sinarmas, serta mendukung fasilitas rujukan BPJS Kesehatan.",
    },
    {
      q: "Apakah cabang Kelapa Gading dan Pluit memiliki rekam medis terhubung?",
      a: "Tentu. Seluruh data rekam medis, riwayat foto rontgen panoramik, dan rencana perawatan Anda tersinkronisasi secara digital di sistem Think Edge Dental Suite. Anda bebas berkunjung ke cabang mana saja.",
    },
    {
      q: "Apakah prosedur pembersihan karang gigi (scaling) terasa ngilu?",
      a: "Kami menggunakan instrumen piezo-ultrasonic berfrekuensi lembut dengan semprotan air teratur yang secara efektif mengangkat karang gigi tanpa merusak lapisan enamel dan meminimalkan rasa ngilu.",
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-24 font-sans selection:bg-primary/20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold tracking-wide shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Klinik Gigi Modern & Spesialis Terakreditasi Kemenkes</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12] text-foreground">
                Perawatan gigi presisi untuk{" "}
                <span className="font-bold text-foreground underline decoration-primary/40 decoration-wavy underline-offset-8">
                  senyum sehat
                </span>{" "}
                keluarga Anda.
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                Didukung dokter gigi spesialis berpengalaman, teknologi intraoral 3D mutakhir, dan sistem antrean digital terintegrasi untuk kenyamanan maksimal Anda.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link
                  href="/layanan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-6 shadow-md shadow-primary/20 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Jelajahi Layanan Kami</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dokter"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/80 hover:bg-muted font-semibold h-12 px-6 text-sm sm:text-base transition-all hover:border-primary/40"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Jadwal Dokter Spesialis</span>
                </Link>
              </div>

              {/* Social Proof & Metrics */}
              <div className="pt-8 border-t border-border/70 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">2 Cabang</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Kelapa Gading & Pluit</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Rekam Medis Digital</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">6+ Mitra</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Asuransi & BPJS</p>
                </div>
              </div>
            </div>

            {/* Right Visual Bento Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-card border border-border/80 shadow-2xl p-2 group">
                <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/clinic-room.jpg"
                    alt="Ruang Perawatan Klinik Gigi Senyum Sehat"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Floating Doctor Badge */}
                  <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted shrink-0 border border-primary/30">
                      <Image
                        src="/images/doctor-sarah.jpg"
                        alt="drg. Sarah Amanda"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">drg. Sarah Amanda, Sp.KG</p>
                      <p className="text-[10px] text-primary font-semibold">Konservasi Gigi & Estetika</p>
                    </div>
                  </div>

                  {/* Floating Rating Pill */}
                  <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>4.9 / 5.0</span>
                  </div>

                  {/* Bottom Highlight Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                      <Activity className="w-3.5 h-3.5" />
                      Sterilisasi Medis Kelas B
                    </span>
                    <h3 className="text-xl font-bold leading-snug">
                      Standar higienitas rumah sakit internasional di setiap tindakan.
                    </h3>
                    <p className="text-xs text-white/70">
                      Peralatan autoklaf vakum kelas B berstandar WHO untuk keamanan tanpa kompromi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION / BENTO EXCELLENCE */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">
            Keunggulan Pelayanan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Standar Baru Pengalaman Perawatan Gigi
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Kami menggabungkan kenyamanan ruang praktek dengan akurasi teknologi digital terkini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl bg-card border border-border/70 p-7 shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Intraoral Scanner 3D Presisi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tinggalkan cetakan pasta gigi manual yang membuat mual. Pemindaian digital 3D instan memberikan model gigi akurat dalam hitungan detik.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-card border border-border/70 p-7 shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">100% Dokter Gigi Spesialis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Setiap tindakan kompleks ditangani langsung oleh dokter spesialis (Sp.KG, Sp.BM, Sp.Ort) yang memiliki izin praktik resmi Kemenkes RI.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-card border border-border/70 p-7 shadow-xs hover:shadow-md hover:border-primary/40 transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Sistem Antrean Bebas Macet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jadwal reservasi terikat slot waktu presisi. Datang tepat waktu, langsung masuk ruang perawatan tanpa menunggu berjam-jam di ruang tunggu.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-primary tracking-widest block">
              Pilihan Perawatan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Layanan Unggulan Pasien
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Dari pencegahan rutin hingga bedah estetik berteknologi tinggi.
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

      {/* 4. MEET SPECIALIST DOCTORS */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-primary tracking-widest block">
              Tenaga Medis
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Temui Dokter Gigi Spesialis Kami
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

      {/* 5. CLINIC LOCATIONS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs uppercase font-bold text-primary tracking-widest block">
            Jaringan Cabang
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Kunjungi Cabang Terdekat di Jakarta
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Fasilitas lengkap, parkir nyaman, dan akses mudah di Kelapa Gading dan Pluit.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </section>

      {/* 6. INSURANCE & CASHLESS PARTNERS */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl bg-card border border-border/80 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              Kemudahan Pembayaran
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dukungan Klaim Asuransi & BPJS Kesehatan
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Nikmati fasilitas swipe cashless dengan kartu asuransi Anda, atau dapatkan bantuan kelengkapan berkas reimbursement yang diproses kilat oleh tim kasir kami.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4">
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

            <div className="pt-4">
              <Link
                href="/asuransi"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <span>Pelajari Panduan & Ketentuan Klaim Asuransi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
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
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4 animate-fadeIn">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM CONVERSION CTA BANNER */}
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
              Mulai perjalanan <span className="font-bold">senyum percaya diri</span> Anda hari ini.
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Tim dokter gigi kami siap membantu mendiagnosis dan merencanakan perawatan yang tepat untuk kesehatan gigi jangka panjang Anda.
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
