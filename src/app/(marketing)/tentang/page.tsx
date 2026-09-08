import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, HeartPulse, MapPin, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react";

export const metadata = {
  title: "Tentang Kami · Klinik Gigi Senyum Sehat",
  description: "Profil, visi, standar klinis, dan dedikasi Klinik Gigi Senyum Sehat dalam memberikan perawatan gigi modern berkualitas tinggi di Indonesia.",
};

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Sterilisasi Medis Ketat",
      description: "Seluruh instrumen melalui pembersihan ultrasonik dan sterilisasi autoklaf kelas B dengan indikator biologis terstandarisasi Kemenkes RI.",
    },
    {
      icon: Stethoscope,
      title: "Dokter Spesialis Berlisensi",
      description: "Tim dokter gigi umum dan spesialis berpengalaman dengan nomor STR dan SIP aktif dari Konsil Kedokteran Indonesia.",
    },
    {
      icon: HeartPulse,
      title: "Pendekatan Bebas Cemas",
      description: "Pelayanan empatik dengan teknologi piezo-ultrasonic bebas ngilu dan komunikasi transparan mengenai setiap langkah tindakan.",
    },
    {
      icon: Sparkles,
      title: "Digitalisasi Klinis Terintegrasi",
      description: "Pengelolaan jadwal akurat, antrean minim tunggu, dan rekam kunjungan aman yang terintegrasi di seluruh cabang jaringan kami.",
    },
  ];

  const milestones = [
    { year: "2020", title: "Pendirian Klinik Pertama", desc: "Berdiri di Kelapa Gading dengan fokus layanan kesehatan gigi keluarga komprehensif." },
    { year: "2023", title: "Ekspansi Cabang Pluit", desc: "Pembukaan cabang kedua dengan fasilitas bedah mulut minor dan odontologi estetik." },
    { year: "2025", title: "Cabang Senopati Luxury", desc: "Peresmian cabang spesialis ortodonti dan estetika dental di kawasan Jakarta Selatan." },
    { year: "2026", title: "Sistem Terintegrasi Think Edge", desc: "Implementasi platform manajemen digital untuk efisiensi reservasi dan rekam medis aman." },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-card border-b border-border/80 py-16 sm:py-24">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-6">
            <Award className="w-3.5 h-3.5" />
            Standar Pelayanan Prima
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Menghadirkan Senyum Sehat dengan <span className="text-primary">Presisi & Empati</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Klinik Gigi Senyum Sehat didirikan dengan satu komitmen mendasar: menyediakan perawatan gigi berkualitas tinggi, higienis, dan transparan tanpa rasa takut bagi seluruh keluarga.
          </p>
        </div>
      </section>

      {/* Philosophy & Story */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Users className="size-4" /> Filosofi Pelayanan
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
              Kedokteran Gigi Modern Berbasis Bukti Ilmiah dan Kenyamanan Pasien
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Kami percaya bahwa senyum yang sehat bermula dari hubungan saling percaya antara dokter dan pasien. Di Klinik Gigi Senyum Sehat, kami menolak pendekatan tindakan yang terburu-buru. Setiap kunjungan diawali dengan konsultasi mendalam, visualisasi rongga mulut via kamera intraoral beresolusi tinggi, dan perumusan opsi rencana perawatan yang jelas beserta estimasi biaya di muka.
            </p>
            <div className="pt-2 space-y-3">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Transparansi rencana perawatan tanpa biaya tersembunyi.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Teknologi diagnosis terkini dengan dosis radiasi panoramik minimal.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>Rekam medis terlindungi sesuai ketentuan UU PDP No. 27 Tahun 2022.</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card to-muted/40 p-8 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Terakreditasi Kemenkes RI
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Nomor Registrasi Fasilitas Pelayanan Kesehatan
              </h3>
              <p className="text-sm font-mono text-primary font-bold">
                YM.02.01/KEMENKES/2026/088
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Telah memenuhi standar kelayakan sarana, prasarana, peralatan sterilisasi, dan kompetensi tenaga kesehatan gigi tingkat nasional.
              </p>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Jaringan Cabang Aktif</span>
                <span className="text-foreground">Kelapa Gading · Pluit · Senopati</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Standar Keunggulan Klinis Kami
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Empat pilar utama yang mendasari setiap prosedur dan interaksi di seluruh cabang klinik kami.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 transition-colors">
                <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Milestone Timeline */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-8 text-center sm:text-left">
            Perjalanan Pertumbuhan Klinik
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {milestones.map((m) => (
              <div key={m.year} className="relative pl-6 sm:pl-0 sm:pt-6 border-l-2 sm:border-l-0 sm:border-t-2 border-primary/30">
                <div className="absolute -left-2 sm:left-0 sm:-top-2 size-3.5 rounded-full bg-primary ring-4 ring-card" />
                <span className="text-xs font-bold text-primary font-mono">{m.year}</span>
                <h4 className="text-sm font-bold text-foreground mt-1">{m.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action CTA Banner */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Siap Menjadwalkan Kunjungan Anda?
            </h2>
            <p className="text-xs sm:text-sm text-primary-foreground/90 leading-relaxed">
              Pilih cabang terdekat dan tentukan dokter spesialis yang sesuai dengan kebutuhan perawatan gigi Anda secara online dalam hitungan menit.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/book"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-card text-foreground px-6 text-xs font-bold shadow-md hover:bg-card/90 transition-all"
              >
                <span>Reservasi Janji Temu</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/lokasi"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-6 text-xs font-bold hover:bg-primary-foreground/20 transition-all text-primary-foreground"
              >
                <MapPin className="size-4" />
                <span>Lihat Cabang Kami</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
