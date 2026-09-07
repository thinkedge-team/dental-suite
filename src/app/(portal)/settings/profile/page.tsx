import { redirect } from "next/navigation";
import { Mail, Shield, Building, KeyRound, BadgeCheck } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organization: { select: { name: true } },
      branch: { select: { name: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    DIRECTOR: "Direktur",
    MANAGER: "Manajer",
    STAFF: "Staf Klinik",
    DOCTOR: "Dokter Gigi",
  };

  const branchLabel = user.branch?.name ?? "Semua Cabang (Pusat)";

  // Compute initials for avatar
  const initials = (user.name || user.email || "DS")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Account Info Card */}
        <Card className="md:col-span-1 border-border/80 bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">{user.name}</CardTitle>
                <CardDescription className="text-xs truncate">{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs pt-2">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5" /> Email Akun
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground break-all">{user.email}</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Terverifikasi
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5" /> Peran Akun
              </span>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {roleLabels[user.role] ?? user.role}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Building className="w-3.5 h-3.5" /> Cabang Penugasan
              </span>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border">
                  {branchLabel}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3.5 h-3.5" /> ID Pengguna
              </span>
              <p className="font-mono text-[11px] text-muted-foreground break-all">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit Form Card */}
        <Card className="md:col-span-2 border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Pengaturan Data Pribadi</CardTitle>
            <CardDescription className="text-xs">
              Ubah nama tampilan yang digunakan pada seluruh catatan sistem dan rekam aktivitas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm initialName={user.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
