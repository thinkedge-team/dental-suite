"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, ShieldAlert, Trash2 } from "lucide-react";

import { anonymizePatient } from "@/lib/actions/patients";

interface AnonymizePatientButtonProps {
  readonly patientId: string;
  readonly patientName: string;
}

export function AnonymizePatientButton({ patientId, patientName }: AnonymizePatientButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await anonymizePatient(patientId);
      if (!res.ok) {
        setError(res.error ?? "Gagal memproses penghapusan data pasien.");
        return;
      }
      setIsOpen(false);
      router.push("/patients");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10"
      >
        <Trash2 className="size-3.5" />
        <span>Hapus Data Pribadi (UU PDP)</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={isPending ? undefined : () => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Hapus Data Pasien (Hak Dilupakan)
                </h3>
                <p className="text-xs text-muted-foreground">Kepatuhan UU PDP No. 27/2022</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Anda akan menganonimkan identitas pribadi pasien <strong className="text-foreground">{patientName}</strong> (nama, nomor telepon, email, tanggal lahir).
            </p>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                Riwayat transaksi klinis dan billing tetap dipertahankan tanpa data PII sesuai regulasi Permenkes No. 269/2008. Tindakan ini tidak dapat dibatalkan.
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Ya, Hapus & Anonimkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
