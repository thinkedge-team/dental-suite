"use client";

import { useMemo } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Sun,
  SunMedium,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type Branch,
  type Doctor,
  type Service,
  type BookingForm,
} from "./booking-types";
import {
  generateNextDays,
  isDoctorAvailableOnDay,
  SESSION_TIME_SLOTS,
} from "./date-slot-utils";

interface Props {
  readonly form: BookingForm;
  readonly selectedBranch: Branch | null;
  readonly selectedDoctor: Doctor | null;
  readonly selectedService: Service | null;
  readonly updateField: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  readonly canAdvance: boolean;
  readonly onNext: () => void;
  readonly onBack: () => void;
}

const SESSION_ICONS = {
  morning: SunMedium,
  afternoon: Sun,
  evening: Moon,
} as const;

const SESSION_KEYS = ["morning", "afternoon", "evening"] as const;

export function StepSchedule({
  form,
  selectedBranch,
  selectedDoctor,
  selectedService,
  updateField,
  canAdvance,
  onNext,
  onBack,
}: Props) {
  const days = useMemo(() => generateNextDays(14), []);

  return (
    <div className="space-y-6">
      {/* Top summary card: Clean pill badges for Cabang, Dokter, and Layanan */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
          Ringkasan Pilihan
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/70 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
            <span className="text-muted-foreground font-medium">Cabang:</span>
            <span className="font-semibold text-foreground">{selectedBranch?.name ?? "-"}</span>
          </div>
          {selectedDoctor && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/70 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
              <span className="text-muted-foreground font-medium">Dokter:</span>
              <span className="font-semibold text-foreground">{selectedDoctor.name}</span>
            </div>
          )}
          {selectedService && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border/70 px-3 py-1 text-xs font-medium text-foreground shadow-xs">
              <span className="text-muted-foreground font-medium">Layanan:</span>
              <span className="font-semibold text-foreground">{selectedService.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Date Carousel (14 Hari ke Depan) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Pilih Tanggal Kunjungan</span>
        </div>

        <div className="overflow-x-auto flex gap-2.5 pb-2 no-scrollbar">
          {days.map((day) => {
            const isAvailable = isDoctorAvailableOnDay(
              selectedDoctor?.schedules,
              day.dayOfWeek
            );
            const isSelected = form.date === day.iso;

            let pillLabel: string | null = null;
            if (!isAvailable) {
              pillLabel = "Libur";
            } else if (day.isToday) {
              pillLabel = "Hari Ini";
            } else if (day.isTomorrow) {
              pillLabel = "Besok";
            }

            return (
              <button
                key={day.iso}
                type="button"
                disabled={!isAvailable}
                onClick={() => updateField("date", day.iso)}
                className={cn(
                  "flex min-w-[76px] sm:min-w-[84px] flex-col items-center justify-between rounded-2xl p-3 text-center transition-all shrink-0 select-none",
                  !isAvailable &&
                    "opacity-50 cursor-not-allowed bg-muted/30 border border-border/40 text-muted-foreground",
                  isAvailable &&
                    !isSelected &&
                    "bg-card border border-border/80 hover:border-primary/50 text-foreground hover:shadow-xs cursor-pointer",
                  isAvailable &&
                    isSelected &&
                    "bg-primary text-primary-foreground font-bold shadow-md ring-2 ring-primary ring-offset-2 scale-[1.02] cursor-pointer"
                )}
              >
                <div className="h-5 flex items-center justify-center">
                  {pillLabel ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-tight leading-none",
                        !isAvailable
                          ? "bg-muted text-muted-foreground"
                          : isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : day.isToday
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                      )}
                    >
                      {pillLabel}
                    </span>
                  ) : null}
                </div>

                <div className="my-1 flex flex-col items-center">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold leading-none my-0.5">
                    {day.dayNum}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}
                  >
                    {day.monthName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session-Based Time Slot Chips */}
      {form.date ? (
        <div className="space-y-5 pt-1">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>Pilih Waktu Kunjungan</span>
          </div>

          <div className="space-y-4">
            {SESSION_KEYS.map((key) => {
              const session = SESSION_TIME_SLOTS[key];
              const Icon = SESSION_ICONS[key];
              return (
                <div
                  key={key}
                  className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{session.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {session.period}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {session.slots.map((slot) => {
                      const isSelected = form.time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => updateField("time", slot)}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "bg-card border border-border/80 hover:border-primary/50 text-foreground"
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          Pilih tanggal kunjungan di atas untuk melihat slot waktu yang tersedia.
        </div>
      )}

      {/* Bottom navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>
        <button
          type="button"
          disabled={!canAdvance || !form.date || !form.time}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          Lanjutkan <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
