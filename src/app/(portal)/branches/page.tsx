import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Users,
  Stethoscope,
  Calendar,
  Clock,
  ExternalLink,
  Plus,
  Pencil,
  Eye,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    const rest = digits.slice(2);
    if (rest.length >= 9) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
    return `+62 ${rest}`;
  }
  if (digits.startsWith("0")) {
    const rest = digits.slice(1);
    if (rest.length >= 9) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
  }
  return raw;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function BranchesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const branches = await prisma.branch.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      _count: {
        select: {
          appointments: true,
          branchDoctors: true,
          users: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const branchIds = branches.map((b) => b.id);
  const todayCounts = branchIds.length
    ? await prisma.appointment.groupBy({
        by: ["branchId"],
        where: {
          branchId: { in: branchIds },
          scheduledAt: { gte: startOfToday(), lte: endOfToday() },
        },
        _count: { _all: true },
      })
    : [];
  const todayCountByBranch = new Map<string, number>(
    todayCounts.map((row) => [row.branchId, row._count._all]),
  );

  const totalCount = branches.length;
  const activeCount = branches.filter((b) => b.isActive).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-2">
            Jaringan Klinik
          </p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Manajemen Cabang
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {totalCount} cabang terdaftar
            {totalCount > 0 && (
              <>
                {" · "}
                <span className="text-emerald-700 font-medium">
                  {activeCount} aktif
                </span>
              </>
            )}
          </p>
        </div>
        <Link
          href="#"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Cabang
        </Link>
      </div>

      {branches.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => {
            const todayAppointments = todayCountByBranch.get(branch.id) ?? 0;
            const openingHoursText =
              branch.openingHours === null || branch.openingHours === undefined
                ? null
                : JSON.stringify(branch.openingHours);

            return (
              <article
                key={branch.id}
                className="group rounded-2xl bg-card border border-border/70 p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-5"
              >
                {/* Card header: name + active badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-muted/60 group-hover:bg-primary/10 transition-colors shrink-0">
                      <Building2 className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold tracking-tight text-foreground leading-snug truncate">
                        {branch.name}
                      </h2>
                      {branch.city && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          {branch.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={
                      branch.isActive
                        ? "px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0"
                        : "px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shrink-0"
                    }
                  >
                    {branch.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                {/* Contact & location */}
                <div className="space-y-2.5 text-sm">
                  {branch.address && (
                    <div className="flex items-start gap-2.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/70" />
                      <span className="leading-relaxed">{branch.address}</span>
                    </div>
                  )}
                  {branch.whatsapp && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span className="font-medium text-foreground">
                        {formatWhatsapp(branch.whatsapp)}
                      </span>
                    </div>
                  )}
                  {branch.googleMapsUrl && (
                    <a
                      href={branch.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Buka di Google Maps
                    </a>
                  )}
                </div>

                {/* Opening hours */}
                {openingHoursText && (
                  <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Jam Operasional
                      </p>
                    </div>
                    <p className="text-xs text-foreground/80 font-mono break-all leading-relaxed">
                      {openingHoursText}
                    </p>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <StatPill
                    icon={<Stethoscope className="h-3.5 w-3.5" />}
                    label="Dokter"
                    value={branch._count.branchDoctors}
                  />
                  <StatPill
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="Staf"
                    value={branch._count.users}
                  />
                  <StatPill
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Janji Hari Ini"
                    value={todayAppointments}
                    accent
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/60">
                  <Link
                    href="#"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat Detail
                  </Link>
                  <Link
                    href="#"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border bg-background text-foreground text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p
        className={
          accent
            ? "text-2xl font-light tabular-nums text-primary"
            : "text-2xl font-light tabular-nums text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        Belum ada cabang
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        Mulai bangun jaringan klinik Anda dengan menambahkan cabang pertama.
      </p>
      <Link
        href="#"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 text-sm font-semibold shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        Tambah Cabang Pertama
      </Link>
    </div>
  );
}
