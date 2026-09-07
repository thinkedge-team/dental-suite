"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
          text: "Profil organisasi berhasil disimpan.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Gagal memperbarui profil organisasi.",
        });
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Profil Klinik</CardTitle>
          <CardDescription>
            {isDirector
              ? "Informasi identitas klinik ini digunakan di seluruh platform dan website publik."
              : "Hanya Director atau Super Admin yang memiliki hak akses untuk mengubah informasi klinik."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {statusMessage && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-destructive/15 text-destructive border border-destructive/30"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="orgName">Nama Klinik</Label>
            <Input
              id="orgName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isDirector || isPending}
              required
              minLength={2}
              className="bg-card border-border"
              placeholder="Contoh: Klinik Gigi Senyum Sehat"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              disabled
              className="bg-muted text-muted-foreground border-border cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Slug dibuat saat pendaftaran organisasi dan bersifat permanen.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL (Opsional)</Label>
            <Input
              id="logoUrl"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              disabled={!isDirector || isPending}
              className="bg-card border-border"
              placeholder="https://domain.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Warna Primer (Opsional)</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={!isDirector || isPending}
                className="bg-card border-border font-mono"
                placeholder="#0D9488"
              />
              {color && (
                <div
                  className="w-10 h-10 rounded border shrink-0"
                  style={{ backgroundColor: color }}
                  title="Pratinjau warna"
                />
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={!isDirector || isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Profil"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
