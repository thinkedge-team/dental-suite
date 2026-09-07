import { prisma } from "@/lib/prisma";
import { ServicesClient } from "./services-client";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { organization: { slug: "senyum-sehat" }, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const mappedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    categoryLabel: s.seoTitle ?? "Perawatan Gigi",
    shortDesc: s.seoDescription ?? s.description,
    description: s.description,
    durationMin: s.durationMin,
    durationMinutes: s.durationMin ?? 45,
    price: s.price ? Number(s.price) : 0,
    basePrice: s.price ? Number(s.price) : 0,
    insuranceCovered: true,
    imageUrl: s.imageUrl,
  }));

  return <ServicesClient services={mappedServices} />;
}
