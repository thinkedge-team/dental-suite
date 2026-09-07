"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWibDayBounds } from "@/lib/appointments/day-bounds";

export interface PortalNotificationItem {
  id: string;
  type: "appointment" | "inventory" | "approval";
  title: string;
  description: string;
  timeLabel: string;
  href: string;
  urgency: "normal" | "warning" | "urgent";
}

export async function getPortalNotifications(): Promise<{
  ok: boolean;
  notifications: PortalNotificationItem[];
  unreadCount: number;
}> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { ok: false, notifications: [], unreadCount: 0 };
  }

  const { organizationId, role, branchId } = session.user;
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  const branchFilter = isDirector || !branchId ? {} : { branchId };
  const { start: startOfToday, end: endOfToday } = getWibDayBounds();

  try {
    const [recentAppointments, lowStockItems, pendingApprovals] = await Promise.all([
      // 1. Confirmed appointments today
      prisma.appointment.findMany({
        where: {
          organizationId,
          ...branchFilter,
          status: "CONFIRMED",
          scheduledAt: { gte: startOfToday, lte: endOfToday },
        },
        select: {
          id: true,
          patientName: true,
          service: true,
          scheduledAt: true,
          branch: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 3,
      }),

      // 2. Low-stock inventory items
      prisma.inventoryItem.findMany({
        where: {
          branch: {
            organizationId,
            ...(isDirector || !branchId ? {} : { id: branchId }),
          },
          stock: { lte: 10 },
        },
        select: {
          id: true,
          name: true,
          stock: true,
          minStock: true,
          unit: true,
          branch: { select: { name: true } },
        },
        orderBy: { stock: "asc" },
        take: 3,
      }),

      // 3. Pending approvals
      prisma.approvalRequest.findMany({
        where: {
          organizationId,
          ...branchFilter,
          status: "PENDING",
        },
        select: {
          id: true,
          type: true,
          payload: true,
          requestedBy: { select: { name: true } },
          branch: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const items: PortalNotificationItem[] = [];

    // Map appointments
    for (const apt of recentAppointments) {
      const timeStr = apt.scheduledAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
        hour12: false,
      });

      items.push({
        id: `apt-${apt.id}`,
        type: "appointment",
        title: `Janji Temu: ${apt.patientName}`,
        description: `${apt.service || "Pemeriksaan"} pkl ${timeStr} WIB · ${apt.branch.name}`,
        timeLabel: "Hari ini",
        href: `/appointments/${apt.id}`,
        urgency: "normal",
      });
    }

    // Map low stock (only items where stock <= minStock)
    for (const item of lowStockItems) {
      if (item.stock <= item.minStock) {
        items.push({
          id: `inv-${item.id}`,
          type: "inventory",
          title: item.stock === 0 ? `Stok Habis: ${item.name}` : `Stok Menipis: ${item.name}`,
          description: `Sisa ${item.stock} ${item.unit} di Cabang ${item.branch.name}`,
          timeLabel: "Perlu restok",
          href: "/operate/inventory",
          urgency: item.stock === 0 ? "urgent" : "warning",
        });
      }
    }

    // Map pending approvals
    for (const req of pendingApprovals) {
      const payloadObj = typeof req.payload === "object" && req.payload !== null ? (req.payload as { title?: string }) : {};
      const title = payloadObj.title || `Permohonan #${req.id.slice(0, 6)}`;

      items.push({
        id: `app-${req.id}`,
        type: "approval",
        title: `Persetujuan: ${title}`,
        description: `Diajukan oleh ${req.requestedBy.name} (${req.branch.name})`,
        timeLabel: "Menunggu",
        href: "/operate/approvals",
        urgency: "warning",
      });
    }

    return {
      ok: true,
      notifications: items,
      unreadCount: items.length,
    };
  } catch (error) {
    console.error("Failed to load notifications:", error);
    return { ok: false, notifications: [], unreadCount: 0 };
  }
}
