"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  CalendarDays,
  Filter,
  Pencil,
  Plus,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";

import { DoctorModal, type BranchOption, type DoctorModalData } from "./doctor-modal";

const DAY_ABBREVIATIONS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export interface DoctorListItem {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  specialty: string | null;
  bio: string | null;
  photoUrl: string | null;
  sipNumber: string | null;
  strNumber: string | null;
  yearsExperience: number | null;
  isActive: boolean;
  branches: Array<{
    branchId: string;
    branchName: string;
  }>;
  schedules: Array<{
    dayOfWeek: number;
  }>;
  appointmentCount: number;
}

interface DoctorsClientProps {
  initialDoctors: DoctorListItem[];
  branches: BranchOption[];
  canManage: boolean;
}

export function DoctorsClient({
  initialDoctors,
  branches,
  canManage,
}: DoctorsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorModalData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const totalCount = initialDoctors.length;
  const activeCount = initialDoctors.filter((d) => d.isActive).length;

  function handleOpenCreate() {
    setSelectedDoctor(null);
    setModalOpen(true);
  }

  function handleOpenEdit(doctor: DoctorListItem) {
    setSelectedDoctor({
      id: doctor.id,
      name: doctor.name,
      title: doctor.title,
      specialty: doctor.specialty,
      sipNumber: doctor.sipNumber,
      strNumber: doctor.strNumber,
      yearsExperience: doctor.yearsExperience,
      bio: doctor.bio,
      photoUrl: doctor.photoUrl,
      branchIds: doctor.branches.map((b) => b.branchId),
      isActive: doctor.isActive,
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedDoctor(null);
  }

  const filteredDoctors = initialDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.specialty?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (doctor.sipNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesBranch =
      branchFilter === "all"
        ? true
        : doctor.branches.some((b) => b.branchId === branchFilter);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? doctor.isActive
        : !doctor.isActive;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Dokter</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Dokter Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Cabang Terbuka</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{branches.length}</p>
        </div>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokter, spesialisasi, atau SIP..."
              className="w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background px-3 py-2">
            <Building2 className="size-3.5 text-muted-foreground" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-background px-3 py-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Nonaktif</option>
            </select>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all shrink-0"
          >
            <Plus className="size-4" />
            + Tambah Dokter
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredDoctors.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Stethoscope className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Tidak ada dokter ditemukan</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || branchFilter !== "all" || statusFilter !== "all"
              ? "Coba ubah kata kunci pencarian atau filter yang dipilih."
              : "Tambahkan dokter ke tim klinis Anda untuk mulai mengatur jadwal dan janji temu."}
          </p>
          {canManage && !searchQuery && branchFilter === "all" && statusFilter === "all" && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Plus className="size-3.5" />
              + Tambah Dokter
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => {
            const scheduleDays = [...new Set(doctor.schedules.map((schedule) => schedule.dayOfWeek))]
              .sort((a, b) => a - b)
              .map((day) => DAY_ABBREVIATIONS[day])
              .join(", ");

            return (
              <article
                key={doctor.id}
                className={`rounded-2xl border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between ${
                  doctor.isActive ? "border-border/70" : "border-border/40 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {doctor.photoUrl ? (
                          <Image
                            src={doctor.photoUrl}
                            alt={doctor.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-base font-bold text-primary">
                            {getInitials(doctor.name)}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                            {doctor.title ? `${doctor.title} ` : ""}
                            {doctor.name}
                          </h3>
                        </div>
                        <p className="text-xs text-primary font-medium mt-0.5">
                          {doctor.specialty || "Dokter Gigi"}
                        </p>
                        {doctor.yearsExperience !== null && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Pengalaman {doctor.yearsExperience} tahun
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        doctor.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {doctor.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  {doctor.bio && (
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="line-clamp-1">
                          {doctor.branches.length > 0
                            ? doctor.branches.map((b) => b.branchName).join(", ")
                            : "Belum ditugaskan"}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{scheduleDays || "Belum ada jadwal praktik"}</span>
                      </span>
                    </div>

                    {(doctor.sipNumber || doctor.strNumber) && (
                      <div className="text-[10px] text-muted-foreground/80 pt-1">
                        {doctor.sipNumber && <span>SIP: {doctor.sipNumber}</span>}
                        {doctor.sipNumber && doctor.strNumber && <span> · </span>}
                        {doctor.strNumber && <span>STR: {doctor.strNumber}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>{doctor.appointmentCount} janji temu</span>
                  </span>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(doctor)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="size-3" />
                      Edit Profil
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Doctor Modal */}
      <DoctorModal
        isOpen={modalOpen}
        doctorToEdit={selectedDoctor}
        branches={branches}
        onClose={handleCloseModal}
      />
    </div>
  );
}
