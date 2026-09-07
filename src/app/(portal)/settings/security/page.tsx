import { redirect } from "next/navigation";
import { ShieldAlert, Lock, CheckCircle } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordForm } from "./password-form";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Keamanan Akun</h1>
        <p className="text-sm text-muted-foreground">
          Kelola kredensial akses dan perlindungan akun Anda di sistem klinik.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Security Guidelines Card */}
        <Card className="md:col-span-1 border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Kebijakan Password
            </CardTitle>
            <CardDescription className="text-xs">
              Pedoman standar keamanan sandi pengguna.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Panjang minimal 8 karakter.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Dianjurkan memadukan huruf besar, huruf kecil, serta angka.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Hindari memakai informasi pribadi atau kata yang mudah ditebak.</span>
            </div>

            <div className="p-3 mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Penting
              </div>
              <p className="text-[11px] leading-relaxed">
                Jangan pernah membagikan kredensial login Anda kepada siapa pun, termasuk staf lain.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Form Card */}
        <Card className="md:col-span-2 border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base">Ubah Password</CardTitle>
            <CardDescription className="text-xs">
              Pastikan Anda mengingat password baru sebelum memperbarui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
