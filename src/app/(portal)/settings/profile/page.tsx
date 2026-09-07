import { redirect } from "next/navigation";
import { Mail, Shield, Building2, BadgeCheck, Clock, UserCheck } from "lucide-react";

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
      branch: { select: { name: true, city: true } },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const roleLabels: Record<string, { label: string; desc: string }> = {
    SUPER_ADMIN: { label: "Super Administrator", desc: "Akses penuh platform dan manajemen multi-organisasi" },
    DIRECTOR: { label: "Direktur Klinik", desc: "Wewenang operasional penuh seluruh cabang dan pelaporan" },
    MANAGER: { label: "Manajer Cabang", desc: "Pengelolaan operasional, staf, dan stok di cabang penugasan" },
    STAFF: { label: "Staf Resepsionis", desc: "Pencatatan janji temu, registrasi pasien, dan presensi harian" },
    DOCTOR: { label: "Dokter Spesialis", desc: "Akses jadwal praktik, rekam tindakan, dan anamnesa medis" },
  };

  const roleInfo = roleLabels[user.role] ?? { label: user.role, desc: "Akses pengguna klinik" };
  const branchLabel = user.branch ? `${user.branch.name} (${user.branch.city || "Pusat"})` : "Semua Cabang (Akses Konsolidasi)";

  const initials = (user.name || user.email || "DS")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinedDateStr = user.createdAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Left Column: Executive Identity Card */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs relative">
          {/* Top Decorative Ambient Pattern */}
          <div className="h-28 bg-gradient-to-br from-foreground via-[#1c1f1e] to-foreground relative overflow-hidden flex items-end p-6">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f38218_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            {/* Avatar Studio Badge */}
            <div className="-mt-14 mb-4 flex items-end justify-between">
              <div className="w-24 h-24 rounded-2xl bg-card p-1.5 shadow-md border border-border/80">
                <div className="w-full h-full rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                  {initials}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                <UserCheck className="w-3.5 h-3.5" />
                Akun Aktif
              </span>
            </div>

            {/* Name & Role Header */}
            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            {/* Identity Details List */}
            <div className="space-y-4 text-xs pt-4 border-t border-border/60">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Hak Akses & Peran
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">{roleInfo.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{roleInfo.desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Penugasan Cabang
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">{branchLabel}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{user.organization.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Status Email
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-foreground truncate">{user.email}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-border/60">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Terdaftar Sejak
                  </span>
                  <p className="font-medium text-muted-foreground mt-0.5">{joinedDateStr}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Editable Profile Settings Card */}
      <div className="lg:col-span-7">
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-border/60">
            <CardTitle className="text-lg font-bold text-foreground">Sunting Informasi Pribadi</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Perbarui identitas profil yang terhubung dengan akun operasional klinik Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6">
            <ProfileForm initialName={user.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
