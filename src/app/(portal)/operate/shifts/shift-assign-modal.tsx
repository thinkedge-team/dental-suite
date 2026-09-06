"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Calendar, Clock, Loader2, Trash2, User, X } from "lucide-react";

import { assignShift, deleteShift } from "@/lib/actions/shifts";
import { SHIFT_PRESETS, ShiftPresetKey } from "@/lib/attendance/punctuality";

export interface ShiftModalData {
  readonly id?: string;
  readonly userId: string;
  readonly userName: string;
  readonly userRole?: string;
  readonly branchId: string;
  readonly branchName?: string;
  readonly date: string; // YYYY-MM-DD
  readonly startTime?: string;
  readonly endTime?: string;
  readonly shiftType?: string;
  readonly notes?: string | null;
}

interface ShiftAssignModalProps {
  readonly isOpen: boolean;
  readonly shiftData: ShiftModalData | null;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

function formatIndonesianDate(isoDateStr: string): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-").map(Number);
  if (parts.length < 3) return isoDateStr;
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;

  // Local anchor
  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

export function ShiftAssignModal({
  isOpen,
  shiftData,
  onClose,
  onSuccess,
}: ShiftAssignModalProps) {
  const isEditing = Boolean(shiftData?.id);

  const [shiftType, setShiftType] = useState<string>("PAGI");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("15:00");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const modalRef = useRef<HTMLDivElement>(null);

  // Keydown listener for Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Controlled component reset when modal opens or shiftData changes
  // Using an internal key pattern based on shiftData identity to prevent synchronous setState inside useEffect
  const currentShiftId = shiftData?.id ?? "new";
  const currentDate = shiftData?.date ?? "";
  const [lastLoadedKey, setLastLoadedKey] = useState<string>("");

  if (isOpen && shiftData && `${currentShiftId}-${currentDate}` !== lastLoadedKey) {
    setLastLoadedKey(`${currentShiftId}-${currentDate}`);
    setShiftType(shiftData.shiftType ?? "PAGI");
    setStartTime(shiftData.startTime ?? "08:00");
    setEndTime(shiftData.endTime ?? "15:00");
    setNotes(shiftData.notes ?? "");
    setError(null);
  }

  if (!isOpen || !shiftData) {
    return null;
  }

  function handlePresetSelect(key: ShiftPresetKey) {
    const preset = SHIFT_PRESETS[key];
    setShiftType(key);
    setStartTime(preset.startTime);
    setEndTime(preset.endTime);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!startTime || !endTime) {
      setError("Jam mulai dan jam selesai wajib diisi.");
      return;
    }

    if (!shiftData) return;

    startTransition(async () => {
      const res = await assignShift({
        userId: shiftData.userId,
        branchId: shiftData.branchId,
        date: shiftData.date,
        startTime,
        endTime,
        shiftType,
        notes: notes.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.error ?? "Gagal menyimpan jadwal shift.");
        return;
      }

      onSuccess?.();
      onClose();
    });
  }

  function handleDelete() {
    if (!shiftData?.id) return;
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal shift ini?")) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteShift(shiftData.id as string);
      if (!res.ok) {
        setError(res.error ?? "Gagal menghapus jadwal shift.");
        return;
      }

      onSuccess?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-modal-title"
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-5" />
            </div>
            <div>
              <h2 id="shift-modal-title" className="text-base font-semibold text-foreground">
                {isEditing ? "Perbarui Jadwal Shift" : "Tetapkan Jadwal Shift"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Atur jam kerja dan jenis penugasan staf
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Tutup</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Staff and Date Info */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <User className="size-3.5" />
                Nama Staf
              </span>
              <span className="font-semibold text-foreground">
                {shiftData.userName} {shiftData.userRole ? `(${shiftData.userRole})` : ""}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                Tanggal Shift
              </span>
              <span className="font-medium text-foreground">
                {formatIndonesianDate(shiftData.date)}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Preset Pilihan Cepat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SHIFT_PRESETS) as ShiftPresetKey[]).map((key) => {
                const preset = SHIFT_PRESETS[key];
                const isSelected = shiftType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="mt-0.5 text-[10px] opacity-75">
                      {preset.startTime} - {preset.endTime}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="shift-start-time" className="text-xs font-medium text-foreground flex items-center gap-1 mb-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Jam Mulai
              </label>
              <input
                id="shift-start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (shiftType !== "CUSTOM") setShiftType("CUSTOM");
                }}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="shift-end-time" className="text-xs font-medium text-foreground flex items-center gap-1 mb-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Jam Selesai
              </label>
              <input
                id="shift-end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (shiftType !== "CUSTOM") setShiftType("CUSTOM");
                }}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label htmlFor="shift-notes" className="text-xs font-medium text-foreground block mb-1.5">
              Catatan Khusus (Opsional)
            </label>
            <input
              id="shift-notes"
              type="text"
              placeholder="Contoh: Menangani pasien ortodonti, jaga kasir, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <Trash2 className="size-3.5" />
                <span>Hapus Shift</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>{isEditing ? "Simpan Perubahan" : "Tetapkan Shift"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
