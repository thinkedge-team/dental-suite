import Link from "next/link";
import { Compass, Home, LogIn } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f7f5f0] text-[#161817] font-sans selection:bg-[#f38218]/20 selection:text-[#161817]">
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Clean 404 Badge with Tooth & Compass Accent */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-[#161817]/10 shadow-xs mb-8">
          <div className="flex items-center justify-center size-8 rounded-full bg-[#f38218]/10 text-[#f38218]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="text-[#f38218]"
            >
              <path
                d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#161817]/70">
            Error 404
          </span>
          <span className="text-[#161817]/20">·</span>
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#161817]/70">
            <Compass className="size-3.5 text-[#f38218]" />
            <span>Halaman Hilang</span>
          </div>
        </div>

        {/* Large 404 Display */}
        <div className="relative mb-6">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-[#161817]/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#161817]">
              Halaman Tidak Ditemukan
            </span>
          </div>
        </div>

        {/* Message */}
        <p className="text-base sm:text-lg text-[#5b6465] max-w-md mx-auto leading-relaxed mb-10">
          Halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau terdapat kesalahan penulisan alamat URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto h-11 px-6 rounded-xl bg-[#f38218] hover:bg-[#f38218]/90 text-white font-semibold shadow-sm transition-all gap-2"
            )}
          >
            <Home className="size-4" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto h-11 px-6 rounded-xl bg-white hover:bg-[#f7f5f0] text-[#161817] border border-[#161817]/15 font-semibold shadow-xs transition-all gap-2"
            )}
          >
            <LogIn className="size-4" />
            Masuk ke Portal Staf
          </Link>
        </div>

        {/* Sub-footer Brand Note */}
        <div className="mt-16 pt-8 border-t border-[#161817]/10 text-xs text-[#5b6465]">
          Klinik Gigi Senyum Sehat · Think Edge Network
        </div>
      </div>
    </main>
  );
}
