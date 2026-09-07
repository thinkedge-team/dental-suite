import { redirect } from "next/navigation";
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20 w-fit">
          Pusat Kontrol
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pengaturan & Preferensi
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola identitas profil staf, keamanan akun login, dan profil operasional klinik.
        </p>
      </div>

      {/* Sub Navigation */}
      <SettingsNav isDirector={isDirector} />

      {/* Content */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}
