"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Stethoscope, MessageCircle, X } from "lucide-react";
import { mockServices } from "@/data/mock-grow";
import { ServiceCard } from "@/components/grow/service-card";

const CATEGORIES = [
  "Semua",
  "Pencegahan",
  "Restorasi",
  "Estetika",
  "Bedah Mulut",
] as const;

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredServices = useMemo(() => {
    return mockServices.filter((service) => {
      const matchCategory =
        selectedCategory === "Semua" ||
        service.categoryLabel.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        query === "" ||
        service.name.toLowerCase().includes(query) ||
        service.shortDesc.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query);

      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="py-12 md:py-20 max-w-6xl mx-auto px-6 font-sans">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Stethoscope className="w-3.5 h-3.5" /> Katalog Tindakan Klinis
        </div>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground">
          Layanan Perawatan Gigi <span className="font-bold">Komprehensif</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Temukan solusi perawatan kesehatan rongga mulut mulai dari tindakan preventif higienis, restorasi estetika presisi, hingga bedah mulut invasif minimal.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="space-y-6 mb-10">
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari perawatan, keluhan, atau nama tindakan..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-border/80 bg-card text-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs shadow-primary/25"
                    : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid or Empty State */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-card border border-dashed border-border/80 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Layanan Tidak Ditemukan
            </h3>
            <p className="text-xs text-muted-foreground">
              Tidak ada hasil yang sesuai dengan kata kunci &quot;{searchQuery}&quot; pada kategori &quot;{selectedCategory}&quot;.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("Semua");
              setSearchQuery("");
            }}
            className="inline-flex items-center text-xs font-semibold text-primary hover:underline pt-2 cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* Bottom WhatsApp CTA Consultation Banner */}
      <div className="mt-16 md:mt-24 rounded-3xl bg-foreground text-background p-8 md:p-12 relative overflow-hidden shadow-lg border border-border/30">
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
              Konsultasi Online 24/7
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
              Konsultasikan Rencana <span className="font-bold">Perawatan Anda</span>
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Masih bingung menentukan tindakan perawatan yang tepat untuk kondisi gigi Anda? Diskusikan keluhan Anda langsung dengan dental care advisor kami via WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Senyum%20Sehat,%20saya%20ingin%20konsultasi%20mengenai%20rencana%20layanan%20perawatan%20gigi."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 text-sm transition-all shadow-md hover:shadow-primary/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp Sekarang</span>
            </a>
            <Link
              href="/dokter"
              className="inline-flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3.5 text-sm transition-colors"
            >
              Cek Jadwal Dokter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
