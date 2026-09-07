import { redirect } from "next/navigation";
import { CheckCircle2, XCircle, Globe, CalendarCheck, Package, BarChart3, ShieldCheck, Sparkles, Building2 } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { OrgProfileForm } from "./org-profile-form";

export default async function OrganizationSettingsPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: true,
      moduleIntelligence: true,
    },
  });

  if (!organization) {
    redirect("/login");
  }

  const isDirector = session.user.role === "DIRECTOR" || session.user.role === "SUPER_ADMIN";

  const modulesList = [
    {
      key: "grow",
      name: "GROW",
      pill: "Patient Discovery",
      icon: Globe,
      description: "Website publik klinik, CMS layanan gigi, direktori dokter, dan profil cabang multi-lokasi.",
      features: ["Website Publik Pasien", "CMS Layanan & Prosedur", "Katalog Spesialis"],
      enabled: organization.moduleGrow,
    },
    {
      key: "connect",
      name: "CONNECT",
      pill: "Acquisition Engine",
      icon: CalendarCheck,
      description: "Sistem reservasi online mandiri pasien, notifikasi WhatsApp real-time, dan manajemen antrean resepsionis.",
      features: ["Booking Pasien Mandiri", "Pengingat WhatsApp Otomatis", "Blokir Jadwal Dokter"],
      enabled: organization.moduleConnect,
    },
    {
      key: "operate",
      name: "OPERATE",
      pill: "Clinic Operations",
      icon: Package,
      description: "Manajemen inventaris obat/bahan medis atomik, jadwal shift mingguan staf, dan alur persetujuan bertingkat.",
      features: ["Inventaris & Stok Opname", "Jadwal Shift & Presensi", "Approval Pengadaan"],
      enabled: organization.moduleOperate,
    },
    {
      key: "intelligence",
      name: "INTELLIGENCE",
      pill: "Executive Analytics",
      icon: BarChart3,
      description: "Dasbor analitik performa eksekutif, rekam kunjungan longitudinal pasien, dan ekspor laporan CSV.",
      features: ["Analitik Omzet & No-Show", "Timeline Kunjungan Pasien", "Ekspor Laporan Keuangan"],
      enabled: organization.moduleIntelligence,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start">
      {/* Left Column: Clinic Profile Form Card */}
      <div className="lg:col-span-5">
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Building2 className="w-4 h-4" />
              </span>
              <CardTitle className="text-lg font-bold text-foreground">Profil Klinik</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed">
              {isDirector
                ? "Informasi identitas klinik ini digunakan di seluruh platform dan website publik pasien."
                : "Hanya Direktur atau Super Admin yang berwenang mengubah profil resmi klinik."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 pt-6">
            <OrgProfileForm
              initialName={organization.name}
              slug={organization.slug}
              logoUrl={organization.logoUrl}
              primaryColor={organization.primaryColor}
              isDirector={isDirector}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Module Entitlements License Cards */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Paket & Lisensi Modul Terdaftar</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Status hak akses modul berdasarkan paket lisensi operasional klinik Anda.
                </CardDescription>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Enterprise
              </span>
            </div>
          </CardHeader>

          <CardContent className="px-0 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {modulesList.map((mod) => {
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.key}
                    className="flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all hover:bg-muted/30"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-card border border-border/80 shadow-xs text-primary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm tracking-tight text-foreground block">{mod.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{mod.pill}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mod.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        {mod.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-[11px] text-foreground font-medium">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50">
                      {mod.enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Aktif · Berlisensi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700">
                          <XCircle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>Tidak Termasuk Paket</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="leading-relaxed">
                Status modul ditentukan berdasarkan paket langganan lisensi klinik Anda. Ingin menambah cabang atau memperluas modul?
              </p>
              <a
                href="https://thinkedge.id"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card border border-border text-foreground font-semibold hover:border-primary transition-colors shrink-0 text-xs text-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Bantuan Lisensi</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
