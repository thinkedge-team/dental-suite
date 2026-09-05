"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Stethoscope, Building2, Calendar, FileText } from "lucide-react";

import { createScheduleBlock } from "@/lib/actions/schedule";

interface DoctorOption {
  id: string;
  name: string;
  specialty: string | null;
}

interface BranchOption {
  id: string;
  name: string;
}

interface ScheduleBlockFormProps {
  doctors: DoctorOption[];
  branches: BranchOption[];
  onSuccess?: () => void;
}

const COMMON_REASONS = ["Cuti", "Operasi", "Seminar", "Pribadi", "Lainnya"];

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";
const selectCls = `${inputCls} appearance-none pr-8`;

export function ScheduleBlockForm({ doctors, branches, onSuccess }: ScheduleBlockFormProps) {
  const [isPending, startTransition] = useTransition();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedReason, setSelectedReason] = useState("Cuti");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setStartDate("");
    setStartTime("09:00");
    setEndDate("");
    setEndTime("17:00");
    setSelectedReason("Cuti");
    setCustomReason("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!doctorId) {
      setError("Silakan pilih dokter.");
      return;
    }

    if (!branchId) {
      setError("Silakan pilih cabang.");
      return;
    }

    if (!startDate || !startTime) {
      setError("Tanggal dan waktu mulai wajib diisi.");
      return;
    }

    if (!endDate || !endTime) {
      setError("Tanggal dan waktu selesai wajib diisi.");
      return;
    }

    const startAt = new Date(`${startDate}T${startTime}:00`);
    const endAt = new Date(`${endDate}T${endTime}:00`);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      setError("Format tanggal atau waktu tidak valid.");
      return;
    }

    if (startAt >= endAt) {
      setError("Waktu selesai harus lebih besar dari waktu mulai.");
      return;
    }

    const finalReason = selectedReason === "Lainnya"
      ? (customReason.trim() || "Lainnya")
      : (customReason.trim() ? `${selectedReason} - ${customReason.trim()}` : selectedReason);

    startTransition(async () => {
      try {
        const res = await createScheduleBlock({
          doctorId,
          branchId,
          startAt,
          endAt,
          reason: finalReason,
        });

        if (!res.ok) {
          setError(res.error || "Gagal memblokir jadwal praktik.");
          return;
        }

        setSuccess(true);
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memblokir jadwal.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 pb-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock className="size-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Formulir Blokir Praktik</h2>
          <p className="text-xs text-muted-foreground">Tutup slot reservasi dokter untuk cuti, seminar, atau keperluan medis lain</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Jadwal dokter berhasil diblokir. Pasien tidak dapat memilih rentang waktu ini.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="blockDoctorId" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Stethoscope className="size-3.5" />
            Dokter <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              id="blockDoctorId"
              required
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className={selectCls}
            >
              {doctors.length === 0 ? (
                <option value="">Belum ada dokter aktif</option>
              ) : (
                doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.specialty ? `${d.name} · ${d.specialty}` : d.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="blockBranchId" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Building2 className="size-3.5" />
            Cabang Klinik <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <select
              id="blockBranchId"
              required
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={selectCls}
            >
              {branches.length === 0 ? (
                <option value="">Belum ada cabang aktif</option>
              ) : (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="size-3.5 text-primary" />
            Mulai Blokir <span className="text-destructive">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="size-3.5 text-primary" />
            Selesai Blokir <span className="text-destructive">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputCls}
            />
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <FileText className="size-3.5" />
          Kategori Alasan
        </label>
        <div className="flex flex-wrap gap-2">
          {COMMON_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedReason(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedReason === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder={selectedReason === "Lainnya" ? "Tuliskan keterangan blokir..." : "Catatan tambahan (opsional)..."}
          className={inputCls}
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending || doctors.length === 0 || branches.length === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Blokir Praktik"
          )}
        </button>
      </div>
    </form>
  );
}
