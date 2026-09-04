import Link from "next/link";
import Image from "next/image";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";
import type { MockService } from "@/data/mock-grow";

interface ServiceCardProps {
  service: MockService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(service.basePrice);

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 font-sans">
      {/* Thumbnail Banner */}
      {service.imageUrl && (
        <div className="relative w-full h-44 bg-muted overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Category Badge overlay */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-card/90 backdrop-blur-md text-foreground border border-border/60 px-2.5 py-0.5 text-xs font-semibold shadow-xs">
              {service.categoryLabel}
            </span>
          </div>

          {service.insuranceCovered && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cover Asuransi</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Fallback Badge if no image */}
          {!service.imageUrl && (
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                {service.categoryLabel}
              </span>

              {service.insuranceCovered && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2 py-0.5 rounded-md"
                  title="Perawatan ini mendukung klaim asuransi / BPJS"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cover Asuransi</span>
                </span>
              )}
            </div>
          )}

          {/* Title and Short Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              <Link href={`/layanan/${service.slug}`} className="focus:outline-hidden">
                <span className="absolute inset-0" aria-hidden="true" />
                {service.name}
              </Link>
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {service.shortDesc}
            </p>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/80" />
            <span>Estimasi pengerjaan: {service.durationMinutes} menit</span>
          </div>
        </div>

        {/* Footer: Price & Details Link */}
        <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
          <div>
            <span className="block text-[11px] text-muted-foreground uppercase font-medium tracking-wider">
              Biaya Mulai Dari
            </span>
            <span className="text-base font-bold text-foreground">
              {formattedPrice}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
            <span>Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
}
