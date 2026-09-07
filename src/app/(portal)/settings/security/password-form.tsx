"use client";

import { useState, useTransition, useMemo } from "react";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeUserPassword } from "@/lib/actions/account";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password strength calculation
  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "Belum diisi", color: "bg-muted" };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { score: 1, label: "Lemah", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Cukup", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Kuat", color: "bg-emerald-500" };
    return { score: 4, label: "Sangat Kuat", color: "bg-emerald-600" };
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: "error", text: "Kata sandi baru wajib minimal 8 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Konfirmasi kata sandi baru tidak sesuai." });
      return;
    }

    startTransition(async () => {
      try {
        const res = await changeUserPassword({
          currentPassword,
          newPassword,
        });

        if (!res.ok) {
          setStatusMessage({ type: "error", text: res.error || "Gagal mengubah kata sandi." });
        } else {
          setStatusMessage({ type: "success", text: "Kata sandi Anda berhasil diperbarui dengan aman." });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      } catch {
        setStatusMessage({ type: "error", text: "Terjadi kendala saat memproses kata sandi baru." });
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

      {/* Current Password Field */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Kata Sandi Saat Ini <span className="text-primary">*</span>
        </Label>
        <div className="relative group">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Masukkan kata sandi lama Anda"
            required
            disabled={isPending}
            className="h-11 pr-11 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card border-border/80 focus:border-primary text-sm font-medium transition-all"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
            title={showCurrent ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Kata Sandi Baru <span className="text-primary">*</span>
        </Label>
        <div className="relative group">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 8 karakter kombinasi"
            required
            minLength={8}
            disabled={isPending}
            className="h-11 pr-11 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card border-border/80 focus:border-primary text-sm font-medium transition-all"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
            title={showNew ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Dynamic Strength Meter Bar */}
        {newPassword.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground font-medium">Kekuatan Sandi:</span>
              <span className="font-bold text-foreground">{strength.label}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`rounded-full transition-colors ${
                    step <= strength.score ? strength.color : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Konfirmasi Kata Sandi Baru <span className="text-primary">*</span>
          </Label>
          {passwordsMatch && (
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Cocok
            </span>
          )}
        </div>
        <div className="relative group">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang kata sandi baru"
            required
            disabled={isPending}
            className={`h-11 pr-11 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card text-sm font-medium transition-all ${
              confirmPassword.length > 0 && !passwordsMatch
                ? "border-rose-400 focus:border-rose-500"
                : "border-border/80 focus:border-primary"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
            title={showConfirm ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-[11px] text-rose-600 font-medium">
            Konfirmasi kata sandi belum sama dengan kata sandi baru.
          </p>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={isPending || newPassword.length < 8 || !passwordsMatch}
          className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs uppercase tracking-wider shadow-sm shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Memperbarui Sandi...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span>Simpan Kata Sandi</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
