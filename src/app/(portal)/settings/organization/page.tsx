import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
      description: "Website Publik Pasien, SEO Schema, dan CMS Layanan",
      enabled: organization.moduleGrow,
    },
    {
      key: "connect",
      name: "CONNECT",
      description: "Reservasi Online Mandiri Pasien, WhatsApp Reminder, dan Blokir Jadwal Dokter",
      enabled: organization.moduleConnect,
    },
    {
      key: "operate",
      name: "OPERATE",
      description: "Inventaris Medis, Mutasi Stok, Jadwal Shift, Presensi Staf, dan Persetujuan",
      enabled: organization.moduleOperate,
    },
    {
      key: "intelligence",
      name: "INTELLIGENCE",
      description: "Dasbor Analitik Eksekutif, Rekam Kunjungan Pasien, dan Ekspor CSV",
      enabled: organization.moduleIntelligence,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Clinic Profile */}
        <div className="lg:col-span-5">
          <OrgProfileForm
            initialName={organization.name}
            slug={organization.slug}
            logoUrl={organization.logoUrl}
            primaryColor={organization.primaryColor}
            isDirector={isDirector}
          />
        </div>

        {/* Right Column: Module Entitlements */}
        <div className="lg:col-span-7">
          <Card className="border-border/80 bg-card h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Paket & Lisensi Modul Terdaftar</CardTitle>
              <CardDescription className="text-xs">
                Status aktif modul berdasarkan lisensi operasional organisasi klinik Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {modulesList.map((mod) => (
                  <div
                    key={mod.key}
                    className="flex flex-col justify-between gap-3 p-3.5 rounded-lg border border-border/70 bg-muted/20"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm tracking-wide text-foreground">{mod.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      {mod.enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          Aktif · Berlisensi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700">
                          <XCircle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          Tidak Termasuk Paket
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Status modul ditentukan berdasarkan paket langganan lisensi klinik Anda. Untuk penambahan modul atau cabang baru, silakan hubungi tim Think Edge Enterprise.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
