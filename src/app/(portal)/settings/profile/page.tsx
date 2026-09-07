import { redirect } from "next/navigation";
import { User, Mail, Shield, Building, KeyRound } from "lucide-react";

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil Pengguna</h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi identitas akun dan penugasan operasional Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Account Info Card */}
        <Card className="md:col-span-1 border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Informasi Akun
            </CardTitle>
            <CardDescription className="text-xs">
              Detail otoritas dan keanggotaan pengguna.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <p className="font-semibold text-foreground break-all">{user.email}</p>
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
              Ubah nama tampilan yang digunakan pada seluruh catatan sistem.
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
