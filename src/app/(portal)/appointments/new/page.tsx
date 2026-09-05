import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewAppointmentForm } from "./new-appointment-form";

export default async function NewAppointmentPage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { organizationId } = session.user;

  const [doctors, branches, services] = await Promise.all([
    prisma.doctor.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, specialty: true },
      orderBy: { name: "asc" },
    }),
    prisma.branch.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, durationMin: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 pb-10">
      <NewAppointmentForm
        doctors={doctors}
        branches={branches}
        services={services}
      />
    </div>
  );
}
