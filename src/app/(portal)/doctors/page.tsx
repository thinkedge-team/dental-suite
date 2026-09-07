import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DoctorsClient, type DoctorListItem } from "./doctors-client";

export default async function DoctorsPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { organizationId, role } = session.user;
  const canManage = role === "DIRECTOR" || role === "SUPER_ADMIN";

  const [rawDoctors, rawBranches] = await Promise.all([
    prisma.doctor.findMany({
      where: {
        organizationId,
      },
      include: {
        branches: {
          include: {
            branch: {
              select: { id: true, name: true },
            },
          },
        },
        schedules: {
          select: {
            dayOfWeek: true,
          },
        },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { name: "asc" },
      ],
    }),
    prisma.branch.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const doctors: DoctorListItem[] = rawDoctors.map((doc) => ({
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    title: doc.title,
    specialty: doc.specialty,
    bio: doc.bio,
    photoUrl: doc.photoUrl,
    sipNumber: doc.sipNumber,
    strNumber: doc.strNumber,
    yearsExperience: doc.yearsExperience,
    isActive: doc.isActive,
    branches: doc.branches.map((b) => ({
      branchId: b.branch.id,
      branchName: b.branch.name,
    })),
    schedules: doc.schedules,
    appointmentCount: doc._count.appointments,
  }));

  const branches = rawBranches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Tim Klinis</p>
        <h1 className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
          Manajemen <span className="font-semibold">Dokter & Staf Medis</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil dokter, spesialisasi, izin praktik (SIP/STR), dan penugasan cabang
        </p>
      </header>

      <DoctorsClient
        initialDoctors={doctors}
        branches={branches}
        canManage={canManage}
      />
    </div>
  );
}
