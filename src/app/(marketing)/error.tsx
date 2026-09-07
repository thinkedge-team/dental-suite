"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Marketing error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-8 md:p-10 shadow-sm text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 size-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Calming Dental Illustration / Icon */}
        <div className="mx-auto mb-6 relative flex size-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
          <svg
            width="40"
            height="40"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="text-primary"
          >
            <path
              d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
              fill="currentColor"
            />
          </svg>
          <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-card border border-border shadow-xs text-amber-500">
            <Sparkles className="size-3.5" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
          Terjadi Kendala Teknis
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Mohon maaf atas ketidaknyamanannya. Halaman ini sedang mengalami kendala sementara. Silakan coba kembali atau kembali ke halaman beranda.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-lg bg-muted/60 p-2.5 text-xs font-mono text-muted-foreground break-all border border-border/50">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs px-5 py-2.5 h-auto rounded-xl text-sm font-semibold cursor-pointer"
            )}
          >
            <RefreshCw className="size-4" />
            Coba Lagi
          </button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto gap-2 border-border text-foreground hover:bg-muted px-5 py-2.5 h-auto rounded-xl text-sm font-semibold"
            )}
          >
            <Home className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
