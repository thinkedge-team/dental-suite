import { redirect } from "next/navigation";
import { ShieldCheck, Lock, CheckCircle2, ShieldAlert } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordForm } from "./password-form";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Left Column: Security Policy & Guidelines */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs relative">
          <div className="h-28 bg-gradient-to-br from-foreground via-[#1c1f1e] to-foreground relative overflow-hidden flex items-end p-6">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f38218_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
          </div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="-mt-12 mb-4 flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl bg-card p-1.5 shadow-md border border-border/80">
                <div className="w-full h-full rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Bcrypt 12 Salt
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Kebijakan Keamanan</h2>
              <p className="text-xs text-muted-foreground">Standar perlindungan data sandi staf klinik.</p>
            </div>

            <div className="space-y-3.5 text-xs text-muted-foreground pt-4 border-t border-border/60">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Panjang kata sandi minimal 8 karakter.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Disarankan memadukan huruf besar, huruf kecil, serta angka/simbol.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Tersimpan dengan enkripsi aman standar industri perbankan (bcrypt).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Sesi aktif login otomatis dilindungi token JWT terenkripsi.</span>
              </div>

              <div className="p-4 mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Peringatan Keamanan</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/90 mt-1">
                  Jangan pernah membagikan kata sandi akun Anda kepada siapa pun, termasuk pihak yang mengatasnamakan tim teknis Think Edge.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Password Form Card */}
      <div className="lg:col-span-7">
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-border/60">
            <CardTitle className="text-lg font-bold text-foreground">Perbarui Kata Sandi</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Masukkan kata sandi lama Anda untuk verifikasi identitas, lalu tentukan kata sandi baru yang kuat.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6">
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
