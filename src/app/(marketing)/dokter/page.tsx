import { prisma } from "@/lib/prisma";
import { DoctorsClient } from "./doctors-client";

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    where: {
      organization: { slug: "senyum-sehat" },
      isActive: true,
    },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
      schedules: true,
    },
  });

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

  return <DoctorsClient doctors={mappedDoctors} />;
}
