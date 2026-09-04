import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Building2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { MockBranch } from "@/data/mock-grow";

interface BranchCardProps {
  branch: MockBranch;
}

export function BranchCard({ branch }: BranchCardProps) {
  const whatsappUrl = `https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(
    `Halo Admin ${branch.name}, saya ingin konsultasi atau reservasi jadwal perawatan.`
  )}`;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 font-sans">
      {/* Branch Exterior Photo Banner */}
      {branch.imageUrl && (
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <Image
            src={branch.imageUrl}
            alt={branch.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-card/90 backdrop-blur-md text-foreground border border-border/60 px-2.5 py-0.5 text-xs font-semibold shadow-xs">
              {branch.city}
            </span>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header: Name and City badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {!branch.imageUrl && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {branch.city}
                  </span>
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                {branch.name}
              </h3>
            </div>
          </div>

          {/* Physical Address */}
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{branch.address}</span>
          </div>

          {/* Operational Hours */}
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{branch.hours}</span>
          </div>

          {/* Contact Links: Phone and WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${branch.phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-xs font-medium text-foreground transition-colors border border-border/50"
            >
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{branch.phone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 text-xs font-semibold transition-colors border border-emerald-200/60 dark:border-emerald-800/50"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Chat WhatsApp</span>
            </a>
          </div>

          {/* Facilities Chip List */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Fasilitas Utama:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {branch.facilities.map((facility) => (
                <span
                  key={facility}
                  className="inline-flex items-center rounded-md bg-muted/70 px-2.5 py-1 text-xs text-foreground/90 font-medium"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer Button */}
        <div className="mt-6 pt-4 border-t border-border/60">
          <Link
            href={`/lokasi/${branch.slug}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2.5 text-sm transition-all shadow-xs group-hover:shadow-primary/20"
          >
            <span>Detail Cabang & Peta</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
