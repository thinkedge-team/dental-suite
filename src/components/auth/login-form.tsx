"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, LockKeyhole, ArrowRight, Activity } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email atau kata sandi salah. Periksa kembali dan coba lagi.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground font-medium text-sm flex items-center gap-2">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="nama@klinik.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="h-12 pl-10 bg-card border-border focus-visible:ring-primary shadow-sm"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground font-medium text-sm flex items-center gap-2">
              Kata Sandi
            </Label>
            <a href="#" className="text-xs text-primary font-medium hover:underline">Lupa sandi?</a>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Masukkan kata sandi (min. 8 karakter)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="h-12 pl-10 bg-card border-border focus-visible:ring-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div 
          role="alert" 
          aria-live="polite"
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg flex items-start gap-3"
        >
          <Activity className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="leading-tight">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-md group"
        disabled={loading}
      >
        {loading ? "Memverifikasi..." : "Masuk ke Dasbor"}
        {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
      </Button>

      {process.env.NODE_ENV !== "production" && (
        <div className="pt-6 border-t border-border/60 mt-8">
          <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3 font-bold">Kredensial Demo (Dev Mode)</p>
            <div className="space-y-2 text-xs text-muted-foreground font-medium">
              <button
                type="button"
                onClick={() => { setEmail("director@demo.com"); setPassword("demo123456"); }}
                className="w-full flex justify-between items-center group hover:text-foreground transition-colors text-left"
              >
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> director@demo.com</span>
                <span className="font-mono bg-background px-1.5 py-0.5 rounded text-[10px] border border-border">Isi Form</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("manager@demo.com"); setPassword("demo123456"); }}
                className="w-full flex justify-between items-center group hover:text-foreground transition-colors text-left"
              >
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> manager@demo.com</span>
                <span className="font-mono bg-background px-1.5 py-0.5 rounded text-[10px] border border-border">Isi Form</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("staff@demo.com"); setPassword("demo123456"); }}
                className="w-full flex justify-between items-center group hover:text-foreground transition-colors text-left"
              >
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> staff@demo.com</span>
                <span className="font-mono bg-background px-1.5 py-0.5 rounded text-[10px] border border-border">Isi Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}


