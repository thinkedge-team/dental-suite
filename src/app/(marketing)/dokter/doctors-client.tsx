"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Building2,
  Sparkles,
  MessageCircle,
  X,
} from "lucide-react";
import { DoctorCard, type DoctorCardData } from "@/components/grow/doctor-card";

interface DoctorsClientProps {
  doctors: DoctorCardData[];
}

export function DoctorsClient({ doctors }: DoctorsClientProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("Semua");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const branches = useMemo(() => {
    const set = new Set<string>();
    for (const d of doctors) {
      if (Array.isArray(d.branches)) {
        for (const b of d.branches) {
          const name = typeof b === "string" ? b : b.branch?.name;
          if (name) set.add(name);
        }
      }
    }
    return ["Semua", ...Array.from(set)];
  }, [doctors]);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    for (const d of doctors) {
      if (d.specialty) set.add(d.specialty);
    }
    return ["Semua", ...Array.from(set)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const doctorBranches = Array.isArray(doctor.branches)
        ? doctor.branches.map((b) => (typeof b === "string" ? b : b.branch?.name ?? ""))
        : [];

      const matchBranch =
        selectedBranch === "Semua" ||
        doctorBranches.some(
          (b) => b.toLowerCase() === selectedBranch.toLowerCase()
        );

      const matchSpecialty =
        selectedSpecialty === "Semua" ||
        (doctor.specialty &&
          doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        query === "" ||
        doctor.name.toLowerCase().includes(query) ||
        (doctor.title && doctor.title.toLowerCase().includes(query)) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(query)) ||
        (doctor.subSpecialty &&
          doctor.subSpecialty.toLowerCase().includes(query)) ||
        (doctor.bio && doctor.bio.toLowerCase().includes(query));

      return matchBranch && matchSpecialty && matchQuery;
    });
  }, [doctors, selectedBranch, selectedSpecialty, searchQuery]);

  return (
    <div className="py-12 md:py-20 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 font-sans">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" /> Tenaga Medis Spesialis
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Tim Dokter Gigi Spesialis <span className="font-bold">Kami</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Ditangani oleh dokter gigi spesialis lulusan universitas terkemuka dengan
          sertifikasi resmi, pengalaman klinis bertahun-tahun, dan komitmen pada
          perawatan gigi yang presisi, steril, serta berorientasi pada kenyamanan Anda.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-6 mb-10">
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dokter, spesialisasi, atau keahlian..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-border/80 bg-card text-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Groups Container */}
        <div className="flex flex-col items-center gap-4">
          {/* Branch Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1 inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Cabang:
            </span>
            {branches.map((branch) => {
              const isSelected = selectedBranch === branch;
              return (
                <button
                  key={branch}
                  onClick={() => setSelectedBranch(branch)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs shadow-primary/25"
                      : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {branch}
                </button>
              );
            })}
          </div>

          {/* Specialty Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Spesialisasi:
            </span>
            {specialties.map((specialty) => {
              const isSelected = selectedSpecialty === specialty;
              return (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs shadow-primary/25"
                      : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {specialty}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor Grid or Empty State */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-card border border-dashed border-border/80 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Dokter Tidak Ditemukan
            </h3>
            <p className="text-xs text-muted-foreground">
              Tidak ada dokter yang sesuai dengan filter pencarian saat ini.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedBranch("Semua");
              setSelectedSpecialty("Semua");
              setSearchQuery("");
            }}
            className="inline-flex items-center text-xs font-semibold text-primary hover:underline pt-2 cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Booking Consultation CTA */}
      <div className="mt-16 md:mt-24 rounded-3xl bg-card border border-border/80 p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Butuh Rekomendasi Dokter Sesuai Keluhan?
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
            Sampaikan keluhan atau kebutuhan perawatan Anda ke dental coordinator kami. Kami siap membantu mencocokkan jadwal dokter spesialis yang paling tepat.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20butuh%20rekomendasi%20jadwal%20dokter%20gigi%20spesialis."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-3 text-sm shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Dental Coordinator</span>
          </a>
        </div>
      </div>
    </div>
  );
}
