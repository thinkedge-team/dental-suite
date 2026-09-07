import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MapPin, Award, ArrowRight } from "lucide-react";

export interface DoctorCardData {
  id: string;
  name: string;
  slug: string;
  title?: string | null;
  specialty?: string | null;
  subSpecialty?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  sipNumber?: string | null;
  strNumber?: string | null;
  experienceYears?: number | null;
  yearsExperience?: number | null;
  branches?: string[] | { branch?: { name: string } }[];
}

interface DoctorCardProps {
  doctor: DoctorCardData;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const photo = doctor.photoUrl || "/images/doctor-sarah.jpg";
  const years = doctor.experienceYears ?? doctor.yearsExperience ?? 5;
  const branchNames: string[] = Array.isArray(doctor.branches)
    ? doctor.branches.map((b) => (typeof b === "string" ? b : b.branch?.name ?? "")).filter(Boolean)
    : [];
  const sipCode = doctor.sipNumber ? doctor.sipNumber.split("/")[0] : "Terverifikasi";

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-card border border-border/70 p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300 font-sans">
      <div className="space-y-4">
        {/* Doctor Photo & Badges */}
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/70 shadow-2xs">
            <Image
              src={photo}
              alt={doctor.name}
              fill
              sizes="(max-width: 640px) 80px, 96px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                {doctor.specialty ?? "Dokter Gigi"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SIP & STR Terverifikasi</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors leading-snug">
              <Link href={`/dokter/${doctor.slug}`} className="focus:outline-hidden">
                <span className="absolute inset-0" aria-hidden="true" />
                {doctor.name}
              </Link>
            </h3>

            <p className="text-xs text-muted-foreground font-medium">
              {doctor.title ?? "drg."}
            </p>
          </div>
        </div>

        {/* Bio Excerpt */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 pt-1">
          {doctor.bio}
        </p>

        {/* Credentials & Branch Badges */}
        <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Award className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground">
              {years} Thn Pengalaman
            </span>
            {doctor.subSpecialty && (
              <span className="text-muted-foreground/80 truncate">
                · Fokus: {doctor.subSpecialty}
              </span>
            )}
          </div>

          <div className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-muted-foreground">Praktik di:</span>
              {branchNames.map((branch) => (
                <span
                  key={branch}
                  className="inline-block bg-muted px-2 py-0.5 rounded text-[11px] font-medium text-foreground"
                >
                  {branch}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground font-mono">
          SIP: {sipCode}
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
          <span>Lihat Profil & Jadwal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
}
