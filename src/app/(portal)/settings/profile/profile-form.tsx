"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/lib/actions/account";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await updateUserProfile({ name });
      if (!res.ok) {
        setStatusMessage({ type: "error", text: res.error || "Gagal memperbarui profil." });
      } else {
        setStatusMessage({ type: "success", text: "Profil berhasil diperbarui." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan profil." });
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
        <Label htmlFor="displayName">Nama Lengkap</Label>
        <Input
          id="displayName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lengkap"
          required
          minLength={2}
          disabled={loading}
          className="bg-card border-border"
        />
        <p className="text-xs text-muted-foreground">
          Nama ini akan ditampilkan pada sistem, jadwal, dan catatan aktivitas.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={loading || name.trim().length < 2}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );
}
