"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, AlertCircle, CalendarPlus, Loader2 } from "lucide-react";
import { cancelWithToken } from "@/lib/actions/appointments";

export interface CancelFormProps {
  token: string;
  scheduledAt: Date;
  branchWhatsapp?: string | null;
}

const REASON_OPTIONS = [
  "Perubahan jadwal mendadak",
  "Kondisi kesehatan sudah membaik",
  "Kendala transportasi / cuaca",
  "Biaya / faktor finansial",
  "Lainnya",
];

export function CancelForm({ token, branchWhatsapp }: CancelFormProps) {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setErrorMessage("Silakan pilih alasan pembatalan.");
      return;
    }

    setErrorMessage(null);
    const finalReason = notes.trim() ? `${reason} - ${notes.trim()}` : reason;

    startTransition(async () => {
      try {
        const res = await cancelWithToken(token, finalReason);
        if (res.ok) {
          setIsSuccess(true);
        } else {
          setErrorMessage(res.error ?? "Gagal membatalkan janji temu. Silakan coba lagi.");
        }
      } catch {
        setErrorMessage("Terjadi kesalahan sistem. Silakan coba lagi nanti.");
      }
    });
  };

  const whatsappUrl = branchWhatsapp
    ? `https://wa.me/${branchWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Halo Klinik Gigi Senyum Sehat, saya ingin bertanya perihal pembatalan janji temu.")}`
    : null;

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Janji Temu Berhasil Dibatalkan
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Permintaan pembatalan Anda telah kami proses. Jika Anda membutuhkan jadwal baru di lain waktu, kami siap melayani Anda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 shadow-sm text-sm transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Buat Janji Baru</span>
          </Link>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background hover:bg-muted font-semibold h-11 px-6 text-sm text-foreground transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Klinik</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          Pilih Alasan Pembatalan <span className="text-destructive">*</span>
        </label>
        <div className="space-y-2.5">
          {REASON_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                reason === opt
                  ? "border-primary bg-primary/5 text-foreground font-medium shadow-xs"
                  : "border-border/70 hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name="cancellationReason"
                value={opt}
                checked={reason === opt}
                onChange={() => setReason(opt)}
                className="w-4 h-4 text-primary border-border focus:ring-primary"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-semibold text-foreground">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tuliskan keterangan lain jika diperlukan..."
          rows={3}
          className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending || !reason}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed text-destructive-foreground font-semibold h-11 px-6 shadow-sm text-sm transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses Pembatalan...</span>
            </>
          ) : (
            <span>Batalkan Janji Temu</span>
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2.5">
          Tindakan ini akan membatalkan slot reservasi dokter Anda.
        </p>
      </div>
    </form>
  );
}
