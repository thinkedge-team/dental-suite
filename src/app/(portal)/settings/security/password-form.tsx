"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, KeySquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeUserPassword } from "@/lib/actions/account";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: "error", text: "Password baru minimal 8 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Konfirmasi password baru tidak cocok." });
      return;
    }

    setLoading(true);

    try {
      const res = await changeUserPassword({
        currentPassword,
        newPassword,
      });

      if (!res.ok) {
        setStatusMessage({ type: "error", text: res.error || "Gagal mengubah password." });
      } else {
        setStatusMessage({ type: "success", text: "Password berhasil diperbarui." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setStatusMessage({ type: "error", text: "Terjadi kesalahan saat memperbarui password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {statusMessage && (
        <div
          role="alert"
          className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Password Saat Ini</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Masukkan password saat ini"
          required
          disabled={loading}
          className="bg-card border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Password Baru</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          required
          minLength={8}
          disabled={loading}
          className="bg-card border-border"
        />
        <p className="text-xs text-muted-foreground">
          Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ketik ulang password baru"
          required
          minLength={8}
          disabled={loading}
          className="bg-card border-border"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={loading || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memperbarui...
            </>
          ) : (
            <>
              <KeySquare className="w-4 h-4 mr-1.5" />
              Ubah Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
