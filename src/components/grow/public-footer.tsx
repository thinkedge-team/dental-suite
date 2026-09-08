import Link from "next/link";
import { ShieldCheck, MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/60 text-card-foreground font-sans">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Clinic Info & Kemenkes accreditation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
                    fill="var(--color-primary)"
                  />
                </svg>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-foreground block">
                  Klinik Gigi Senyum Sehat
                </span>
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  Think Edge Network
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Pusat perawatan gigi dan mulut modern dengan pendekatan presisi, higienis, dan terintegrasi sistem digital cerdas.
            </p>

            <div className="inline-flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block text-[11px]">
                  Terakreditasi Kemenkes RI
                </span>
                <span className="text-[10px] text-muted-foreground">
                  No. Reg: YM.02.01/KEMENKES/2026/088
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Treatment Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Layanan Unggulan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/layanan/scaling-gigi" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Pembersihan Karang (Scaling)
                </Link>
              </li>
              <li>
                <Link href="/layanan/tambal-gigi-estetis" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Penambalan Estetis (Resin Komposit)
                </Link>
              </li>
              <li>
                <Link href="/layanan/bleaching-gigi" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Pemutihan Gigi (In-Office Bleaching)
                </Link>
              </li>
              <li>
                <Link href="/layanan/odontektomi-gigi-bungsu" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Pencabutan Gigi Bungsu (Odontektomi)
                </Link>
              </li>
              <li>
                <Link href="/layanan" className="text-primary hover:underline transition-colors inline-flex items-center gap-1 pt-1 font-semibold">
                  Semua Layanan <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Branch Contacts & Operational Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Cabang & Jam Operasional
            </h4>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <Link href="/lokasi/kelapa-gading" className="hover:text-primary transition-colors">
                    Cabang Kelapa Gading
                  </Link>
                </div>
                <p className="text-[11px] mt-0.5">Jl. Boulevard Raya Blok LB 3 No. 12, Kelapa Gading</p>
                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Senin - Sabtu: 09:00 - 20:00 WIB
                </p>
              </div>

              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <Link href="/lokasi/pluit" className="hover:text-primary transition-colors">
                    Cabang Pluit
                  </Link>
                </div>
                <p className="text-[11px] mt-0.5">Ruko Pluit Junction Blok A No. 8, Jl. Pluit Raya</p>
                <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Senin - Sabtu: 09:00 - 20:00 WIB
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Emergency & WhatsApp direct consultations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Bantuan & Emergency
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Membutuhkan tindakan darurat sakit gigi atau ingin menjadwalkan janji temu langsung?
            </p>

            <div className="space-y-2.5">
              <a
                href="https://wa.me/6281234567890?text=Halo%2C%20saya%20membutuhkan%20konsultasi%20darurat%20atau%20jadwal%20klinik."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Konsultasi WhatsApp</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="tel:02145871234"
                className="flex items-center gap-2 p-3 rounded-xl bg-muted/60 hover:bg-muted border border-border/60 text-xs text-foreground font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Hotline: (021) 4587-1234</span>
              </a>
            </div>

            <div className="pt-1">
              <Link href="/asuransi" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                Klaim Asuransi & Rekanan BPJS <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Klinik Gigi Senyum Sehat. Powered by Think Edge Dental Suite.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/tentang" className="hover:text-foreground transition-colors">
              Tentang Kami
            </Link>
            <span>•</span>
            <Link href="/asuransi" className="hover:text-foreground transition-colors">
              Mitra Asuransi
            </Link>
            <span>•</span>
            <Link href="/lokasi" className="hover:text-foreground transition-colors">
              Lokasi Cabang
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Portal Staf
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
