import { prisma } from "@/lib/prisma";
import { BookingWizard } from "./booking-wizard";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const orgSlug = process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG ?? "senyum-sehat";

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true, slug: true, moduleConnect: true },
  });

  const [branches, doctors, services] = org && org.moduleConnect
    ? await Promise.all([
        prisma.branch.findMany({
          where: { organizationId: org.id, isActive: true },
          select: { id: true, name: true, address: true, whatsapp: true },
          orderBy: { name: "asc" },
        }),
        prisma.doctor.findMany({
          where: { organizationId: org.id, isActive: true },
          select: {
            id: true,
            name: true,
            specialty: true,
            photoUrl: true,
            branches: { select: { branchId: true } },
            schedules: { select: { dayOfWeek: true, isActive: true } },
          },
          orderBy: { name: "asc" },
        }),
        prisma.service.findMany({
          where: { organizationId: org.id, isActive: true },
          select: { id: true, name: true, durationMin: true },
          orderBy: { sortOrder: "asc" },
        }),
      ])
    : [[], [], []];

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        <header className="max-w-2xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            Reservasi Kunjungan Klinik
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Buat Janji Temu
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Pilih cabang, dokter, dan waktu yang paling sesuai. Tim resepsionis akan mengonfirmasi jadwal Anda melalui WhatsApp dalam 15 menit setelah reservasi terkirim.
          </p>
        </header>

        <div className="mt-10 sm:mt-14 flex justify-center">
          {org && branches.length > 0 ? (
            <BookingWizard
              org={org}
              branches={branches}
              doctors={doctors}
              services={services}
            />
          ) : (
            <div className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                Belum ada cabang aktif untuk pemesanan saat ini.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Silakan hubungi resepsionis melalui kanal WhatsApp resmi klinik untuk konfirmasi jadwal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
