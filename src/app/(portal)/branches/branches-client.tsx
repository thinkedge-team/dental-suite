"use client";

import { useState } from "react";
import Link from "next/link";
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

import { BranchModal, type BranchModalData } from "./branch-modal";

export interface BranchListItem {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  province: string | null;
  whatsapp: string | null;
  googleMapsUrl: string | null;
  isActive: boolean;
  openingHours: Record<string, string> | null;
  doctorCount: number;
  userCount: number;
  todayAppointments: number;
}

interface BranchesClientProps {
  initialBranches: BranchListItem[];
  canCreate: boolean;
  userRole: string;
  userBranchId?: string | null;
}

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

export function BranchesClient({
  initialBranches,
  canCreate,
  userRole,
  userBranchId,
}: BranchesClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchModalData | null>(null);

  const totalCount = initialBranches.length;
  const activeCount = initialBranches.filter((b) => b.isActive).length;

  function handleOpenCreate() {
    setSelectedBranch(null);
    setModalOpen(true);
  }

  function handleOpenEdit(branch: BranchListItem) {
    setSelectedBranch({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      province: branch.province,
      whatsapp: branch.whatsapp,
      googleMapsUrl: branch.googleMapsUrl,
      isActive: branch.isActive,
      openingHours: branch.openingHours,
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedBranch(null);
  }

  function canEditBranch(branchId: string): boolean {
    if (userRole === "DIRECTOR" || userRole === "SUPER_ADMIN") return true;
    if (userRole === "MANAGER" && userBranchId === branchId) return true;
    return false;
  }

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

        {canCreate ? (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground h-10 px-5 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Cabang
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Hanya DIRECTOR atau SUPER_ADMIN yang dapat menambah cabang"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground h-10 px-5 text-sm font-semibold cursor-not-allowed opacity-60"
          >
            <Plus className="h-4 w-4" />
            Tambah Cabang
          </button>
        )}
      </div>

      {initialBranches.length === 0 ? (
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
          {canCreate && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground h-10 px-5 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Cabang Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {initialBranches.map((branch) => {
            const hasEditAccess = canEditBranch(branch.id);
            const openingHoursEntries =
              branch.openingHours && typeof branch.openingHours === "object"
                ? Object.entries(branch.openingHours)
                : [];

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
                {openingHoursEntries.length > 0 && (
                  <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Jam Operasional
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {openingHoursEntries.map(([day, hours]) => (
                        <div key={day} className="flex justify-between py-0.5">
                          <span className="capitalize text-muted-foreground">{day}:</span>
                          <span className="font-mono text-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <StatPill
                    icon={<Stethoscope className="h-3.5 w-3.5" />}
                    label="Dokter"
                    value={branch.doctorCount}
                  />
                  <StatPill
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="Staf"
                    value={branch.userCount}
                  />
                  <StatPill
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Janji Hari Ini"
                    value={branch.todayAppointments}
                    accent
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/60">
                  <Link
                    href={`/appointments?branch=${encodeURIComponent(branch.name)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Lihat Janji
                  </Link>

                  {hasEditAccess ? (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(branch)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border bg-background text-foreground text-xs font-medium hover:bg-muted/60 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Anda tidak memiliki wewenang untuk mengubah cabang ini"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-border bg-muted/40 text-muted-foreground text-xs font-medium cursor-not-allowed opacity-60"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BranchModal
        isOpen={modalOpen}
        branchToEdit={selectedBranch}
        onClose={handleCloseModal}
      />
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
