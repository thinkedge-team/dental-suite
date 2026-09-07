import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ServicesClient, type ServiceListItem } from "./services-client";

export default async function ServicesPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { organizationId, role } = session.user;
  const canManage = role === "DIRECTOR" || role === "SUPER_ADMIN" || role === "MANAGER";

  const rawServices = await prisma.service.findMany({
    where: {
      organizationId,
    },
    orderBy: [
      { isActive: "desc" },
      { name: "asc" },
    ],
  });

  const services: ServiceListItem[] = rawServices.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    price: s.price !== null ? Number(s.price) : null,
    durationMin: s.durationMin,
    description: s.description,
    isActive: s.isActive,
  }));

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Katalog Medis</p>
        <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
          Katalog <span className="font-semibold">Layanan Gigi</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola daftar prosedur medis, estimasi durasi, dan tarif klinik Anda
        </p>
      </header>

      <ServicesClient initialServices={services} canManage={canManage} />
    </div>
  );
}
