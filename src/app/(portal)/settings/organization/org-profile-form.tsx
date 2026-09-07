"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle, Building2, Link2, Palette, Image as ImageIcon, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateOrganizationProfile } from "@/lib/actions/settings";

interface OrgProfileFormProps {
  initialName: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  isDirector: boolean;
}

export function OrgProfileForm({
  initialName,
  slug,
  logoUrl,
  primaryColor,
  isDirector,
}: OrgProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [logo, setLogo] = useState(logoUrl || "");
  const [color, setColor] = useState(primaryColor || "");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirector) return;

    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateOrganizationProfile({
        name,
        logoUrl: logo || undefined,
        primaryColor: color || undefined,
      });

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "Profil klinik Anda berhasil diperbarui di seluruh sistem.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Gagal memperbarui profil klinik.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {/* Clinic Name */}
      <div className="space-y-2">
        <Label htmlFor="orgName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nama Resmi Klinik <span className="text-primary">*</span>
        </Label>
        <div className="relative group">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="orgName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isDirector || isPending}
            placeholder="Masukkan nama resmi klinik"
            required
            minLength={2}
            className="h-11 pl-10 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card border-border/80 focus:border-primary text-sm font-medium transition-all"
          />
        </div>
      </div>

      {/* URL Slug (Immutable) */}
      <div className="space-y-2">
        <Label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          URL Slug Publik (Permanen)
        </Label>
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            id="slug"
            value={slug}
            disabled
            className="h-11 pl-10 rounded-xl bg-muted/50 text-muted-foreground font-mono text-xs border-border/60 cursor-not-allowed"
          />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Digunakan sebagai pengenal domain dan akses API publik untuk reservasi pasien.
        </p>
      </div>

      {/* Primary Brand Color Accent */}
      <div className="space-y-2">
        <Label htmlFor="primaryColor" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Warna Aksen Brand (Hex Code)
        </Label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="primaryColor"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={!isDirector || isPending}
              placeholder="#f38218"
              className="h-11 pl-10 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card border-border/80 text-sm font-mono transition-all"
            />
          </div>
          <div
            className="w-11 h-11 rounded-xl border border-border/80 shrink-0 shadow-xs flex items-center justify-center"
            style={{ backgroundColor: color || "#f38218" }}
          />
        </div>
      </div>

      {/* Logo Image URL */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          URL Tautan Logo Klinik (Opsional)
        </Label>
        <div className="relative group">
          <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="logoUrl"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            disabled={!isDirector || isPending}
            placeholder="https://..."
            className="h-11 pl-10 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-card border-border/80 focus:border-primary text-sm transition-all"
          />
        </div>
      </div>

      {isDirector && (
        <div className="pt-3 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || name.trim().length < 2}
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
                <span>Simpan Profil Klinik</span>
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
