"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { type Branch, type Doctor, type Service, type BookingForm, formatDateId } from "./booking-types";

interface Props {
  form: BookingForm;
  selectedBranch: Branch | null;
  selectedDoctor: Doctor | null;
  selectedService: Service | null;
  updateField: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  submitting: boolean;
  submitError: string | null;
  canSubmit: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function StepPatient({
  form, selectedBranch, selectedDoctor, selectedService,
  updateField, submitting, submitError, canSubmit, onSubmit, onBack,
}: Props) {
  const inputCls = "w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="patient-name" className="block text-sm font-bold text-foreground mb-2">
            Nama Lengkap <span className="text-primary">*</span>
          </label>
          <input id="patient-name" type="text" placeholder="Nama sesuai KTP" value={form.patientName}
            onChange={(e) => updateField("patientName", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label htmlFor="patient-phone" className="block text-sm font-bold text-foreground mb-2">
            Nomor Telepon / WhatsApp <span className="text-primary">*</span>
          </label>
          <input id="patient-phone" type="tel" placeholder="08xxxxxxxxxx" value={form.patientPhone}
            onChange={(e) => updateField("patientPhone", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label htmlFor="patient-email" className="block text-sm font-bold text-foreground mb-2">
            Alamat Email <span className="font-normal text-muted-foreground">(opsional)</span>
          </label>
          <input id="patient-email" type="email" placeholder="email@contoh.com" value={form.patientEmail}
            onChange={(e) => updateField("patientEmail", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label htmlFor="patient-notes" className="block text-sm font-bold text-foreground mb-2">
            Catatan Tambahan <span className="font-normal text-muted-foreground">(opsional)</span>
          </label>
          <textarea id="patient-notes" rows={3} placeholder="Keluhan, alergi obat, atau informasi khusus lainnya"
            value={form.notes} onChange={(e) => updateField("notes", e.target.value)}
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/30 p-5 space-y-2.5 text-sm">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Ringkasan Janji Temu</p>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Cabang</span>
          <span className="font-semibold text-foreground">{selectedBranch?.name ?? "-"}</span>
        </div>
        {selectedDoctor && (
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Dokter</span>
            <span className="font-semibold text-foreground">{selectedDoctor.name}</span>
          </div>
        )}
        {selectedService && (
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">Layanan</span>
            <span className="font-semibold text-foreground">{selectedService.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Tanggal</span>
          <span className="font-semibold text-foreground">{form.date ? formatDateId(form.date) : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Waktu</span>
          <span className="font-semibold text-foreground">{form.time ? `${form.time} WIB` : "-"}</span>
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40">
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>
        <button type="button" disabled={!canSubmit || submitting} onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</> : "Konfirmasi Janji"}
        </button>
      </div>
    </div>
  );
}
