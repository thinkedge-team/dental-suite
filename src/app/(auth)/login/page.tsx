import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Masuk — Think Edge Dental Suite",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-background font-sans selection:bg-primary/20">
      <div className="hidden md:flex md:w-[480px] lg:w-[560px] flex-col justify-between p-12 shrink-0 relative overflow-hidden bg-foreground">
        {/* Generated Premium Dental Clinic Background */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage: 'url("/images/login-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.1) brightness(0.85)'
          }}
        />
        {/* Dark Ink gradient overlay to ensure text legibility and brand color dominance */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#161817]/95 via-[#161817]/70 to-[#161817]/95 z-0" />
        
        {/* Noise overlay to ground it */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path
                d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
                fill="var(--color-primary)"
                fillOpacity="1"
              />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight">Dental Suite</div>
            <div className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mt-0.5">by Think Edge</div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-medium backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Sistem Enkripsi End-to-End
          </div>
          <h1 className="text-white text-4xl lg:text-5xl leading-[1.1] font-light tracking-tight">
            Satu platform<br />untuk seluruh<br />jaringan klinik.
          </h1>
          <p className="text-white/70 text-sm lg:text-base leading-relaxed max-w-sm">
            Kelola jadwal, rekam medis pasien, metrik dokter, dan performa cabang — dari satu dasbor yang dirancang khusus untuk efisiensi operasional gigi.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="text-white/40 text-xs font-medium">
            © 2026 Think Edge. Hak cipta dilindungi.
          </div>
          <div className="flex gap-4 text-white/40 text-xs">
            <a href="#" className="hover:text-white transition-colors">Bantuan</a>
            <a href="#" className="hover:text-white transition-colors">Privasi</a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative sm:px-6 lg:px-8">
        <div className="w-full max-w-[420px]">
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path
                d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
                fill="currentColor"
                className="text-primary"
              />
            </svg>
            <span className="font-bold text-foreground text-xl tracking-tight font-sans">Dental Suite</span>
          </div>
          
          <div className="bg-card px-8 py-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/60 space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Masuk ke Akun</h2>
              <p className="text-muted-foreground text-sm font-sans">
                Akses dasbor operasional klinik Anda.
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}

