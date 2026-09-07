import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWibDayBounds } from "@/lib/appointments/day-bounds";
import { BranchesClient, type BranchListItem } from "./branches-client";

export default async function BranchesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const branches = await prisma.branch.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      _count: {
        select: {
          appointments: true,
          branchDoctors: true,
          users: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const branchIds = branches.map((b) => b.id);
  const { start: startOfToday, end: endOfToday } = getWibDayBounds();
  const todayCounts = branchIds.length
    ? await prisma.appointment.groupBy({
        by: ["branchId"],
        where: {
          branchId: { in: branchIds },
          scheduledAt: { gte: startOfToday, lte: endOfToday },
        },
        _count: { _all: true },
      })
    : [];

  const todayCountByBranch = new Map<string, number>(
    todayCounts.map((row) => [row.branchId, row._count._all]),
  );

  const canCreate =
    session.user.role === "DIRECTOR" || session.user.role === "SUPER_ADMIN";

  const mappedBranches: BranchListItem[] = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    slug: branch.slug,
    address: branch.address,
    city: branch.city,
    province: branch.province,
    whatsapp: branch.whatsapp,
    googleMapsUrl: branch.googleMapsUrl,
    isActive: branch.isActive,
    openingHours:
      branch.openingHours && typeof branch.openingHours === "object"
        ? (branch.openingHours as Record<string, string>)
        : null,
    doctorCount: branch._count.branchDoctors,
    userCount: branch._count.users,
    todayAppointments: todayCountByBranch.get(branch.id) ?? 0,
  }));

  return (
    <BranchesClient
      initialBranches={mappedBranches}
      canCreate={canCreate}
      userRole={session.user.role}
      userBranchId={session.user.branchId}
    />
  );
}
