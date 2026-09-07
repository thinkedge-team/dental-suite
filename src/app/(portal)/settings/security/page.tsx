import { redirect } from "next/navigation";
import { ShieldCheck, Lock, CheckCircle, ShieldAlert } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordForm } from "./password-form";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Security Guidelines Card */}
        <Card className="md:col-span-1 border-border/80 bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Kebijakan Password
            </CardTitle>
            <CardDescription className="text-xs">
              Pedoman standar keamanan sandi pengguna klinik.
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
              <span>Tersimpan dengan enkripsi aman standar industri (bcrypt).</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
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
              Pastikan Anda mengingat password baru sebelum memperbarui kredensial akun.
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
