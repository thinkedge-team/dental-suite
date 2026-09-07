import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { SettingsNav } from "./settings-nav";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isDirector = session.user.role === "DIRECTOR" || session.user.role === "SUPER_ADMIN";

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Editorial Luxury Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
        {/* Subtle Ambient Light Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary" />
              Pusat Kontrol & Preferensi
            </div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">
              Pengaturan <span className="font-bold">Sistem & Akun</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kelola identitas akun staf, otentikasi keamanan sandi, dan status lisensi modul operasional klinik Anda.
            </p>
          </div>

          {/* Sub Navigation Segmented Tabs */}
          <div className="shrink-0">
            <SettingsNav isDirector={isDirector} />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}
