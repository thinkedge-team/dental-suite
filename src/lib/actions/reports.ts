"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encodeCsv } from "@/lib/intelligence/csv";

const WIB_OFFSET_HOURS = 7;

function formatWibDateTime(date: Date): string {
  const wib = new Date(date.getTime() + WIB_OFFSET_HOURS * 60 * 60 * 1000);
  const yyyy = wib.getUTCFullYear();
  const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(wib.getUTCDate()).padStart(2, "0");
  const hh = String(wib.getUTCHours()).padStart(2, "0");
  const min = String(wib.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function parseWibDayBounds(startDateStr: string, endDateStr: string): { start: Date; end: Date } {
  const startMatch = startDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const endMatch = endDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);

  let start: Date;
  let end: Date;

  if (startMatch) {
    const [, y, m, d] = startMatch;
    start = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 0 - WIB_OFFSET_HOURS, 0, 0, 0));
  } else {
    const s = new Date(startDateStr);
    start = new Date(s.setHours(0, 0, 0, 0));
  }

  if (endMatch) {
    const [, y, m, d] = endMatch;
    end = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 23 - WIB_OFFSET_HOURS, 59, 59, 999));
  } else {
    const e = new Date(endDateStr);
    end = new Date(e.setHours(23, 59, 59, 999));
  }

  return { start, end };
}

type ActionContext = {
  session: {
    user: {
      id?: string;
      organizationId: string;
      role: "SUPER_ADMIN" | "DIRECTOR" | "MANAGER" | "STAFF" | "DOCTOR";
      branchId?: string | null;
    };
  };
};

function getEffectiveBranchId(
  requestedBranchId: string | undefined,
  userRole: string,
  userBranchId: string | null | undefined
): string | undefined {
  if (userRole === "MANAGER") {
    return userBranchId ?? undefined;
  }
  return requestedBranchId;
}

export async function exportAppointmentsCsv(
  params: {
    branchId?: string;
    startDate: string;
    endDate: string;
  },
  ctx?: ActionContext
): Promise<{
  ok: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;

  if (role !== "DIRECTOR" && role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return { ok: false, error: "Akses ditolak. Peran tidak diizinkan." };
  }

  const effectiveBranchId = getEffectiveBranchId(params.branchId, role, userBranchId);
  const { start, end } = parseWibDayBounds(params.startDate, params.endDate);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        organizationId,
        ...(effectiveBranchId && { branchId: effectiveBranchId }),
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        branch: { select: { name: true } },
        doctor: { select: { name: true, specialty: true } },
        patient: { select: { name: true, phone: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    const headers = [
      "ID Janji",
      "Waktu Jadwal (WIB)",
      "Cabang",
      "Nama Pasien",
      "No. Telepon",
      "Dokter",
      "Layanan",
      "Status",
      "Tipe",
      "Catatan",
    ];

    const rows: (string | number | null | undefined)[][] = appointments.map((appt) => {
      const waktuJadwal = formatWibDateTime(appt.scheduledAt);
      const cabang = appt.branch?.name ?? "-";
      const namaPasien = appt.patient?.name ?? appt.patientName ?? "-";
      const noTelepon = appt.patient?.phone ?? appt.patientPhone ?? "-";
      const dokter = appt.doctor?.name ?? "-";
      const layanan = appt.service ?? "-";
      const status = appt.status ?? "-";
      const tipe = appt.walkin ? "Walk-in" : "Booking Online";
      const catatan = appt.reasonForVisit ?? "";

      return [
        appt.id,
        waktuJadwal,
        cabang,
        namaPasien,
        noTelepon,
        dokter,
        layanan,
        status,
        tipe,
        catatan,
      ];
    });

    const csvString = encodeCsv(headers, rows);
    const filename = `laporan-janji-temu-${params.startDate}-${params.endDate}.csv`;

    return { ok: true, csv: csvString, filename };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal mengekspor janji temu CSV.",
    };
  }
}

export async function exportVisitsCsv(
  params: {
    branchId?: string;
    startDate: string;
    endDate: string;
  },
  ctx?: ActionContext
): Promise<{
  ok: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;

  if (role !== "DIRECTOR" && role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return { ok: false, error: "Akses ditolak. Peran tidak diizinkan." };
  }

  const effectiveBranchId = getEffectiveBranchId(params.branchId, role, userBranchId);
  const { start, end } = parseWibDayBounds(params.startDate, params.endDate);

  try {
    const visits = await prisma.visit.findMany({
      where: {
        organizationId,
        ...(effectiveBranchId && { branchId: effectiveBranchId }),
        deletedAt: null,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        branch: { select: { name: true } },
        service: { select: { name: true } },
        patient: { select: { name: true, phone: true } },
        appointment: {
          include: {
            doctor: { select: { name: true, specialty: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const directDoctorIds = Array.from(
      new Set(
        visits
          .map((v) => v.doctorId)
          .filter((id): id is string => Boolean(id))
      )
    );

    const doctorsMap = new Map<string, string>();
    if (directDoctorIds.length > 0) {
      const doctors = await prisma.doctor.findMany({
        where: { id: { in: directDoctorIds } },
        select: { id: true, name: true },
      });
      for (const d of doctors) {
        doctorsMap.set(d.id, d.name);
      }
    }

    const headers = [
      "ID Kunjungan",
      "Waktu Tindakan (WIB)",
      "Cabang",
      "Nama Pasien",
      "No. Telepon",
      "Dokter",
      "Layanan",
      "Nominal Pembayaran (Rp)",
      "Metode Pembayaran",
      "Catatan Tindakan",
    ];

    const rows: (string | number | null | undefined)[][] = visits.map((visit) => {
      const waktuTindakan = formatWibDateTime(visit.createdAt);
      const cabang = visit.branch?.name ?? "-";
      const namaPasien = visit.patient?.name ?? "-";
      const noTelepon = visit.patient?.phone ?? "-";
      const dokter =
        (visit.doctorId ? doctorsMap.get(visit.doctorId) : undefined) ??
        visit.appointment?.doctor?.name ??
        "-";
      const layanan = visit.service?.name ?? "-";
      const nominalPembayaran = visit.paymentAmount
        ? Number(visit.paymentAmount)
        : 0;
      const metodePembayaran = visit.paymentMethod ?? "-";
      const catatanTindakan = visit.notes ?? "";

      return [
        visit.id,
        waktuTindakan,
        cabang,
        namaPasien,
        noTelepon,
        dokter,
        layanan,
        nominalPembayaran,
        metodePembayaran,
        catatanTindakan,
      ];
    });

    const csvString = encodeCsv(headers, rows);
    const filename = `laporan-kunjungan-pendapatan-${params.startDate}-${params.endDate}.csv`;

    return { ok: true, csv: csvString, filename };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal mengekspor kunjungan CSV.",
    };
  }
}

export async function exportInventoryCsv(
  params: {
    branchId?: string;
    startDate: string;
    endDate: string;
  },
  ctx?: ActionContext
): Promise<{
  ok: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}> {
  const session = ctx?.session ?? (await auth());
  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const { organizationId, role, branchId: userBranchId } = session.user;

  if (role !== "DIRECTOR" && role !== "MANAGER" && role !== "SUPER_ADMIN") {
    return { ok: false, error: "Akses ditolak. Peran tidak diizinkan." };
  }

  const effectiveBranchId = getEffectiveBranchId(params.branchId, role, userBranchId);
  const { start, end } = parseWibDayBounds(params.startDate, params.endDate);

  try {
    const inventoryLogs = await prisma.inventoryLog.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        item: {
          branch: {
            organizationId,
            ...(effectiveBranchId && { id: effectiveBranchId }),
          },
        },
      },
      include: {
        item: {
          select: {
            name: true,
            sku: true,
            category: true,
            branch: {
              select: {
                name: true,
              },
            },
          },
        },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID Log",
      "Waktu Mutasi (WIB)",
      "Cabang",
      "Nama Barang",
      "SKU",
      "Kategori",
      "Tipe Mutasi",
      "Perubahan Qty",
      "Stok Sebelum",
      "Stok Sesudah",
      "Petugas",
      "Catatan",
    ];

    const rows: (string | number | null | undefined)[][] = inventoryLogs.map((log) => {
      const waktuMutasi = formatWibDateTime(log.createdAt);
      const cabang = log.item?.branch?.name ?? "-";
      const namaBarang = log.item?.name ?? "-";
      const sku = log.item?.sku ?? "-";
      const kategori = log.item?.category ?? "-";
      const tipeMutasi = log.type ?? "-";
      const perubahanQty = log.quantity;
      const stokSebelum = log.previousStock;
      const stokSesudah = log.currentStock;
      const petugas = log.user?.name ?? "-";
      const catatan = log.notes ?? "";

      return [
        log.id,
        waktuMutasi,
        cabang,
        namaBarang,
        sku,
        kategori,
        tipeMutasi,
        perubahanQty,
        stokSebelum,
        stokSesudah,
        petugas,
        catatan,
      ];
    });

    const csvString = encodeCsv(headers, rows);
    const filename = `laporan-mutasi-inventaris-${params.startDate}-${params.endDate}.csv`;

    return { ok: true, csv: csvString, filename };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gagal mengekspor mutasi inventaris CSV.",
    };
  }
}