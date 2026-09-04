"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ShieldCheck,
  Building2,
  Sparkles,
  CalendarCheck,
  MessageCircle,
  X,
} from "lucide-react";
import { mockDoctors } from "@/data/mock-grow";
import { DoctorCard } from "@/components/grow/doctor-card";

const BRANCHES = ["Semua", "Kelapa Gading", "Pluit"] as const;

const SPECIALTIES = [
  "Semua",
  "Konservasi Gigi & Estetika",
  "Bedah Mulut & Implan",
  "Ortodonti & Perapian Gigi",
] as const;

export default function DoctorsPage() {
  const [selectedBranch, setSelectedBranch] = useState<string>("Semua");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter((doctor) => {
      const matchBranch =
        selectedBranch === "Semua" ||
        doctor.branches.some(
          (b) => b.toLowerCase() === selectedBranch.toLowerCase()
        );

      const matchSpecialty =
        selectedSpecialty === "Semua" ||
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        query === "" ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.title.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        (doctor.subSpecialty &&
          doctor.subSpecialty.toLowerCase().includes(query)) ||
        doctor.bio.toLowerCase().includes(query);

      return matchBranch && matchSpecialty && matchQuery;
    });
  }, [selectedBranch, selectedSpecialty, searchQuery]);

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
            placeholder="Cari nama dokter, spesialisasi, atau sub-spesialis..."
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
            {BRANCHES.map((branch) => {
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
            {SPECIALTIES.map((specialty) => {
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
              Tidak ada dokter yang cocok dengan kriteria pencarian dan filter yang
              Anda pilih.
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

      {/* Trust & Regulatory Compliance Banner */}
      <div className="mt-16 rounded-2xl bg-card border border-border/80 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              Kepatuhan & Verifikasi Medis Resmi Kemenkes RI
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Seluruh dokter gigi di Klinik Gigi Senyum Sehat memegang Surat Izin
              Praktik (SIP) aktif dan tersertifikasi oleh Konsil Kedokteran Indonesia
              (KKI). Rekam medis dan penegakan diagnosa dijalankan sesuai Standar
              Pelayanan Kedokteran Gigi Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom WhatsApp Booking CTA Banner */}
      <div className="mt-12 rounded-3xl bg-foreground text-background p-8 md:p-12 relative overflow-hidden shadow-lg border border-border/30">
        <div
          className="absolute inset-0 opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url("/images/dashboard-hero.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <CalendarCheck className="w-3.5 h-3.5" /> Reservasi Langsung
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
              Pilih Waktu Konsultasi <span className="font-bold">Sesuai Kebutuhan</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Ingin berkonsultasi mengenai keluhan gigi Anda dengan dokter spesialis
              tertentu? Hubungi customer care kami via WhatsApp untuk konfirmasi slot
              jadwal terkini.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Senyum%20Sehat,%20saya%20ingin%20jadwalkan%20konsultasi%20dengan%20dokter%20spesialis."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:shadow-primary/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Jadwalkan via WhatsApp</span>
            </a>
            <Link
              href="/layanan"
              className="inline-flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3.5 text-sm transition-colors"
            >
              Lihat Daftar Layanan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
