import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ShieldCheck, Clock, MapPin, ArrowRight, Stethoscope } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      {/* Public Header */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
                  fill="var(--color-primary)"
                />
              </svg>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">Klinik Gigi Senyum Sehat</span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">by Think Edge</span>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Portal Staf
            </Link>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 px-5 shadow-sm text-sm transition-all"
            >
              Masuk Portal <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Pelayanan Gigi Modern & Terpercaya
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.15]">
              Perawatan gigi presisi untuk <span className="font-bold text-foreground">senyum sehat</span> keluarga Anda.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg">
              Didukung oleh dokter gigi spesialis berpengalaman, teknologi modern, dan sistem penjadwalan digital terintegrasi tanpa antre.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-6 shadow-md text-base transition-all"
              >
                <Calendar className="mr-2 h-4 w-4" /> Akses Portal Operasional
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-border hover:bg-muted font-semibold h-12 px-6 text-base transition-all"
              >
                Lihat Jadwal Dokter
              </Link>
            </div>

            <div className="pt-8 border-t border-border/60 grid grid-cols-3 gap-6 text-center sm:text-left">
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cabang Aktif</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Rekam Medis Digital</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">BPJS & Asuransi</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mitra Resmi</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-foreground p-8 md:p-12 shadow-[0_20px_50px_rgba(22,24,23,0.1)] border border-border/40 text-background">
            <div 
              className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity"
              style={{
                backgroundImage: 'url("/images/dashboard-hero.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/90 to-transparent z-0" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Layanan Unggulan</h3>
                  <p className="text-xs text-white/60">Tersedia di Kelapa Gading & Pluit</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Pembersihan Gigi (Scaling)", price: "Rp 250.000", duration: "45 menit" },
                  { name: "Penambalan Gigi Estetis", price: "Rp 400.000", duration: "60 menit" },
                  { name: "Pemutihan Gigi (Bleaching)", price: "Rp 800.000", duration: "90 menit" },
                  { name: "Konsultasi & Pemeriksaan", price: "Rp 150.000", duration: "20 menit" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-medium text-white">{item.name}</p>
                      <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {item.duration}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary font-mono">{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-white/60 pt-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Jakarta Utara: Kelapa Gading & Pluit</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
