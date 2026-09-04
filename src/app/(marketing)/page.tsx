import Link from "next/link";
import { ShieldCheck, Clock, MapPin, Stethoscope, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Hero Copy & Actions */}
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
              href="/layanan"
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 px-6 shadow-md text-base transition-all gap-2"
            >
              <span>Eksplorasi Layanan</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dokter"
              className="inline-flex items-center justify-center rounded-lg border border-border hover:bg-muted font-semibold h-12 px-6 text-base transition-all"
            >
              Lihat Jadwal Dokter
            </Link>
          </div>

          <div className="pt-8 border-t border-border/60 grid grid-cols-3 gap-6 text-center sm:text-left">
            <Link href="/lokasi" className="group block">
              <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">2</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cabang Aktif</p>
            </Link>
            <div>
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rekam Medis Digital</p>
            </div>
            <Link href="/asuransi" className="group block">
              <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">BPJS & Asuransi</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mitra Resmi</p>
            </Link>
          </div>
        </div>

        {/* Right Column: Featured Services Card */}
        <div className="relative rounded-2xl overflow-hidden bg-foreground p-8 md:p-12 shadow-[0_20px_50px_rgba(22,24,23,0.1)] border border-border/40 text-background">
          <div
            className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity"
            style={{
              backgroundImage: 'url("/images/clinic-room.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/90 to-transparent z-0" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Layanan Unggulan</h3>
                  <p className="text-xs text-white/60">Tersedia di Kelapa Gading & Pluit</p>
                </div>
              </div>

              <Link
                href="/layanan"
                className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
              >
                Semua Layanan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: "Pembersihan Gigi (Scaling)", price: "Rp 450.000", duration: "45 menit", href: "/layanan/scaling-gigi" },
                { name: "Penambalan Gigi Estetis", price: "Rp 550.000", duration: "60 menit", href: "/layanan/tambal-gigi-estetis" },
                { name: "Pemutihan Gigi (Bleaching)", price: "Rp 2.500.000", duration: "60 menit", href: "/layanan/bleaching-gigi" },
                { name: "Pencabutan Gigi Bungsu", price: "Rp 2.800.000", duration: "60 menit", href: "/layanan/odontektomi-gigi-bungsu" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex justify-between items-center p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 backdrop-blur-sm transition-all group/item"
                >
                  <div>
                    <p className="text-sm font-medium text-white group-hover/item:text-primary transition-colors">{item.name}</p>
                    <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {item.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary font-mono">{item.price}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover/item:text-primary group-hover/item:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-white/40">Cabang:</span>
                <Link href="/lokasi/kelapa-gading" className="hover:text-primary transition-colors underline decoration-white/20 underline-offset-2">
                  Kelapa Gading
                </Link>
                <span className="text-white/20">•</span>
                <Link href="/lokasi/pluit" className="hover:text-primary transition-colors underline decoration-white/20 underline-offset-2">
                  Pluit
                </Link>
              </div>
              <Link href="/dokter" className="text-primary hover:underline font-semibold">
                Jadwal Dokter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
