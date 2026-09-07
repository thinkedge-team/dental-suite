"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle, User as UserIcon, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/lib/actions/account";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setStatusMessage({ type: "error", text: "Nama lengkap minimal 2 karakter." });
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateUserProfile({ name: cleanName });
        if (!res.ok) {
          setStatusMessage({ type: "error", text: res.error || "Gagal memperbarui profil." });
        } else {
          setStatusMessage({ type: "success", text: "Nama profil Anda berhasil disimpan." });
        }
      } catch {
        setStatusMessage({ type: "error", text: "Terjadi kendala saat menyimpan data profil." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMessage && (
        <div
          role="alert"
          className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-medium border animate-in fade-in-0 zoom-in-95 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nama Lengkap Tampilan
        </Label>
        <div className="relative group">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="displayName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            required
            minLength={2}
            disabled={isPending}
            className="h-11 pl-10 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card border-border/80 focus:border-primary text-sm font-medium transition-all"
          />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Nama ini akan tercantum di seluruh dokumen internal, riwayat mutasi obat, dan catatan tindakan pasien.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isPending || name.trim().length < 2 || name.trim() === initialName}
          className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs uppercase tracking-wider shadow-sm shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              <span>Simpan Profil</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
