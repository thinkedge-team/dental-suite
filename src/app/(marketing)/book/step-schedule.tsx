"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Branch, type Doctor, type Service, type BookingForm, todayString } from "./booking-types";

interface Props {
  form: BookingForm;
  selectedBranch: Branch | null;
  selectedDoctor: Doctor | null;
  selectedService: Service | null;
  updateField: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
}

export function StepSchedule({ form, selectedBranch, selectedDoctor, selectedService, updateField, canAdvance, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm space-y-1">
        <p><span className="text-muted-foreground font-medium">Cabang:</span>{" "}<span className="font-semibold text-foreground">{selectedBranch?.name}</span></p>
        {selectedDoctor && <p><span className="text-muted-foreground font-medium">Dokter:</span>{" "}<span className="font-semibold text-foreground">{selectedDoctor.name}</span></p>}
        {selectedService && <p><span className="text-muted-foreground font-medium">Layanan:</span>{" "}<span className="font-semibold text-foreground">{selectedService.name}</span></p>}
      </div>

      <div>
        <label htmlFor="date-input" className="block text-sm font-bold text-foreground mb-2">
          Tanggal Kunjungan <span className="text-primary">*</span>
        </label>
        <input
          id="date-input"
          type="date"
          min={todayString()}
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label htmlFor="time-input" className="block text-sm font-bold text-foreground mb-2">
          Waktu Kunjungan <span className="text-primary">*</span>
        </label>
        <input
          id="time-input"
          type="time"
          step={1800}
          value={form.time}
          onChange={(e) => updateField("time", e.target.value)}
          className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>
        <button
          type="button"
          disabled={!canAdvance}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        >
          Lanjutkan <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
