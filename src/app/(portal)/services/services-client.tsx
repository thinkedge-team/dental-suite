"use client";

import { useState } from "react";
import {
  AlertCircle,
  Clock,
  DollarSign,
  Filter,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { ServiceModal, type ServiceModalData } from "./service-modal";

export interface ServiceListItem {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  durationMin: number | null;
  description: string | null;
  isActive: boolean;
  appointmentCount?: number;
}

interface ServicesClientProps {
  initialServices: ServiceListItem[];
  canManage: boolean;
}

function formatRupiah(amount: number | null): string {
  if (amount === null || amount === undefined) return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function ServicesClient({
  initialServices,
  canManage,
}: ServicesClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceModalData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const totalCount = initialServices.length;
  const activeCount = initialServices.filter((s) => s.isActive).length;

  function handleOpenCreate() {
    setSelectedService(null);
    setModalOpen(true);
  }

  function handleOpenEdit(service: ServiceListItem) {
    setSelectedService({
      id: service.id,
      name: service.name,
      price: service.price ?? 0,
      durationMin: service.durationMin ?? 30,
      description: service.description,
      isActive: service.isActive,
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setSelectedService(null);
  }

  const filteredServices = initialServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? service.isActive
        : !service.isActive;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Layanan</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Layanan Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Layanan Nonaktif</p>
          <p className="mt-1 text-2xl font-semibold text-muted-foreground">
            {totalCount - activeCount}
          </p>
        </div>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau deskripsi layanan..."
              className="w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
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
            + Tambah Layanan
          </button>
        )}
      </div>

      {/* Table or Empty State */}
      {filteredServices.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Stethoscope className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Tidak ada layanan ditemukan</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Coba ubah kata kunci pencarian atau filter status layanan."
              : "Tambahkan layanan pertama untuk klinik Anda agar pasien dapat memilihnya saat reservasi."}
          </p>
          {canManage && !searchQuery && statusFilter === "all" && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Plus className="size-3.5" />
              + Tambah Layanan
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Layanan</th>
                  <th className="px-5 py-3.5">Durasi</th>
                  <th className="px-5 py-3.5">Tarif</th>
                  <th className="px-5 py-3.5">Status</th>
                  {canManage && <th className="px-5 py-3.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{service.name}</span>
                        {service.description ? (
                          <span className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {service.description}
                          </span>
                        ) : (
                          <span className="mt-0.5 text-[11px] italic text-muted-foreground/60">
                            Tanpa deskripsi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-muted-foreground">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1">
                        <Clock className="size-3 text-muted-foreground" />
                        <span>{service.durationMin ?? 30} mnt</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-foreground">
                      {formatRupiah(service.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          service.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {service.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(service)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="size-3" />
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={modalOpen}
        serviceToEdit={selectedService}
        onClose={handleCloseModal}
      />
    </div>
  );
}
