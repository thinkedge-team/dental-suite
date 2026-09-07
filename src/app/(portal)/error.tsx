"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring if needed
    console.error("Portal error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
          <AlertTriangle className="size-7" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">
          Terjadi Kendala Saat Memuat Data Portal
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Sistem mengalami kendala sementara saat mengambil data dari server. Silakan coba muat ulang atau hubungi administrator jika kendala berlanjut.
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
              "w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            )}
          >
            <RefreshCw className="size-4" />
            Coba Lagi
          </button>

          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto gap-2 border-border text-foreground hover:bg-muted"
            )}
          >
            <LayoutDashboard className="size-4" />
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
