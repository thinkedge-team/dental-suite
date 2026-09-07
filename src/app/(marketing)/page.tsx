import { prisma } from "@/lib/prisma";
import { HomePageClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, doctors, branches] = await Promise.all([
    prisma.service.findMany({
      where: { organization: { slug: "senyum-sehat" }, isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.doctor.findMany({
      where: { organization: { slug: "senyum-sehat" }, isActive: true },
      include: {
        branches: { include: { branch: true } },
        schedules: true,
      },
      take: 3,
    }),
    prisma.branch.findMany({
      where: { organization: { slug: "senyum-sehat" }, isActive: true },
      include: {
        branchDoctors: { include: { doctor: true } },
      },
    }),
  ]);

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

  const mappedDoctors = doctors.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    title: d.title,
    specialty: d.specialty,
    bio: d.bio,
    photoUrl: d.photoUrl,
    sipNumber: d.sipNumber,
    strNumber: d.strNumber,
    experienceYears: d.yearsExperience ?? 5,
    yearsExperience: d.yearsExperience ?? 5,
    branches: d.branches.map((b) => b.branch.name),
  }));

  const mappedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    address: b.address,
    city: b.city,
    whatsapp: b.whatsapp,
    photoUrls: b.photoUrls,
    openingHours: b.openingHours,
  }));

  return (
    <HomePageClient
      services={mappedServices}
      doctors={mappedDoctors}
      branches={mappedBranches}
    />
  );
}
