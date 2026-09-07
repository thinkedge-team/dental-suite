"use client";

import { useState, useTransition } from "react";
import { updatePatientNotes } from "@/lib/actions/intelligence";
import { Check, AlertCircle, Loader2 } from "lucide-react";

interface PatientNotesFormProps {
  patientId: string;
  initialNotes?: string | null;
}

export function PatientNotesForm({
  patientId,
  initialNotes = "",
}: PatientNotesFormProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = () => {
    setStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      const res = await updatePatientNotes(patientId, notes);
      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        setErrorMessage(res.error || "Gagal menyimpan catatan.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan riwayat alergi, kondisi sistemik, atau instruksi klinis khusus pasien ini..."
          className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          disabled={isPending}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "success" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Tersimpan
            </span>
          )}

          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMessage}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Catatan"
          )}
        </button>
      </div>
    </div>
  );
}