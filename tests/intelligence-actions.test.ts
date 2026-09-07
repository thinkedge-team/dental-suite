import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patient: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    visit: {
      findMany: vi.fn(),
    },
    doctor: {
      findMany: vi.fn(),
    },
    inventoryLog: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { updatePatientNotes } from "@/lib/actions/intelligence";
import {
  exportAppointmentsCsv,
  exportVisitsCsv,
  exportInventoryCsv,
} from "@/lib/actions/reports";

describe("Intelligence Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updatePatientNotes", () => {
    it("returns unauthorized if user is not authenticated", async () => {
      const res = await updatePatientNotes("pat-1", "Allo", {
        session: { user: { organizationId: "", role: "STAFF" } },
      });
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("returns error if patient is not found", async () => {
      vi.mocked(prisma.patient.findFirst).mockResolvedValue(null);

      const res = await updatePatientNotes("pat-1", "Notes", {
        session: { user: { organizationId: "org-1", role: "STAFF" } },
      });

      expect(res.ok).toBe(false);
      expect(res.error).toBe("Pasien tidak ditemukan.");
    });

    it("trims notes and sets empty string to null", async () => {
      vi.mocked(prisma.patient.findFirst).mockResolvedValue({
        id: "pat-1",
        organizationId: "org-1",
        name: "Budi",
        phone: "0812",
        email: null,
        dob: null,
        notes: null,
        consentedAt: null,
        consentIp: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.patient.update).mockResolvedValue({
        id: "pat-1",
        organizationId: "org-1",
        name: "Budi",
        phone: "0812",
        email: null,
        dob: null,
        notes: null,
        consentedAt: null,
        consentIp: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await updatePatientNotes("pat-1", "   ", {
        session: { user: { organizationId: "org-1", role: "STAFF" } },
      });

      expect(res.ok).toBe(true);
      expect(prisma.patient.update).toHaveBeenCalledWith({
        where: { id: "pat-1" },
        data: { notes: null },
      });
    });

    it("stores valid trimmed notes", async () => {
      vi.mocked(prisma.patient.findFirst).mockResolvedValue({
        id: "pat-1",
        organizationId: "org-1",
        name: "Budi",
        phone: "0812",
        email: null,
        dob: null,
        notes: null,
        consentedAt: null,
        consentIp: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.patient.update).mockResolvedValue({
        id: "pat-1",
        organizationId: "org-1",
        name: "Budi",
        phone: "0812",
        email: null,
        dob: null,
        notes: "Alergi Penicilin",
        consentedAt: null,
        consentIp: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await updatePatientNotes("pat-1", "  Alergi Penicilin  ", {
        session: { user: { organizationId: "org-1", role: "STAFF" } },
      });

      expect(res.ok).toBe(true);
      expect(prisma.patient.update).toHaveBeenCalledWith({
        where: { id: "pat-1" },
        data: { notes: "Alergi Penicilin" },
      });
    });
  });

  describe("Reports CSV Actions", () => {
    describe("exportAppointmentsCsv", () => {
      it("rejects unauthorized role STAFF", async () => {
        const res = await exportAppointmentsCsv(
          { startDate: "2026-09-01", endDate: "2026-09-07" },
          { session: { user: { id: "u-1", organizationId: "org-1", role: "STAFF" } } }
        );
        expect(res.ok).toBe(false);
        expect(res.error).toBe("Akses ditolak. Peran tidak diizinkan.");
      });

      it("locks branch for MANAGER", async () => {
        vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

        const res = await exportAppointmentsCsv(
          { branchId: "other-branch", startDate: "2026-09-01", endDate: "2026-09-07" },
          {
            session: {
              user: {
                id: "u-1",
                organizationId: "org-1",
                role: "MANAGER",
                branchId: "mgr-branch",
              },
            },
          }
        );

        expect(res.ok).toBe(true);
        expect(res.filename).toBe("laporan-janji-temu-2026-09-01-2026-09-07.csv");
        expect(prisma.appointment.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              branchId: "mgr-branch",
            }),
          })
        );
      });

      it("exports appointments into valid CSV", async () => {
        vi.mocked(prisma.appointment.findMany).mockResolvedValue([
          {
            id: "appt-1",
            scheduledAt: new Date("2026-09-02T02:00:00.000Z"),
            branch: { name: "Cabang Tebet" },
            doctor: { name: "drg. Budi", specialty: "Konservasi" },
            patient: { name: "Andi", phone: "0812345678" },
            service: "Cabut Gigi",
            status: "CONFIRMED",
            walkin: false,
            reasonForVisit: "Sakit gigi",
          },
        ] as unknown as Awaited<ReturnType<typeof prisma.appointment.findMany>>);

        const res = await exportAppointmentsCsv(
          { startDate: "2026-09-01", endDate: "2026-09-07" },
          {
            session: {
              user: {
                id: "u-1",
                organizationId: "org-1",
                role: "DIRECTOR",
              },
            },
          }
        );

        expect(res.ok).toBe(true);
        expect(res.csv).toBeDefined();
        expect(res.csv).toContain("ID Janji");
        expect(res.csv).toContain("Cabang Tebet");
        expect(res.csv).toContain("drg. Budi");
        expect(res.csv).toContain("Andi");
      });
    });

    describe("exportVisitsCsv", () => {
      it("exports visits into valid CSV with formatted payment", async () => {
        vi.mocked(prisma.visit.findMany).mockResolvedValue([
          {
            id: "v-1",
            createdAt: new Date("2026-09-03T04:30:00.000Z"),
            branch: { name: "Cabang Menteng" },
            patient: { name: "Siti", phone: "081999999" },
            doctorId: "doc-1",
            appointment: null,
            service: { name: "Scaling" },
            paymentAmount: 350000,
            paymentMethod: "QRIS",
            notes: "Gigi bersih, karang terangkat",
          },
        ] as unknown as Awaited<ReturnType<typeof prisma.visit.findMany>>);

        vi.mocked(prisma.doctor.findMany).mockResolvedValue([
          { id: "doc-1", name: "drg. Rina", specialty: null },
        ] as unknown as Awaited<ReturnType<typeof prisma.doctor.findMany>>);

        const res = await exportVisitsCsv(
          { startDate: "2026-09-01", endDate: "2026-09-07" },
          {
            session: {
              user: {
                id: "u-1",
                organizationId: "org-1",
                role: "SUPER_ADMIN",
              },
            },
          }
        );

        expect(res.ok).toBe(true);
        expect(res.filename).toBe("laporan-kunjungan-pendapatan-2026-09-01-2026-09-07.csv");
        expect(res.csv).toContain("ID Kunjungan");
        expect(res.csv).toContain("Cabang Menteng");
        expect(res.csv).toContain("drg. Rina");
        expect(res.csv).toContain("350000");
        expect(res.csv).toContain("QRIS");
      });
    });

    describe("exportInventoryCsv", () => {
      it("exports inventory mutation logs into valid CSV", async () => {
        vi.mocked(prisma.inventoryLog.findMany).mockResolvedValue([
          {
            id: "log-1",
            createdAt: new Date("2026-09-04T05:00:00.000Z"),
            item: {
              name: "Kapas Gulung",
              sku: "KPS-001",
              category: "Konsumabel",
              branch: { name: "Cabang Tebet" },
            },
            type: "RESTOCK",
            quantity: 50,
            previousStock: 10,
            currentStock: 60,
            user: { name: "Staff Gudang" },
            notes: "Restock mingguan",
          },
        ] as unknown as Awaited<ReturnType<typeof prisma.inventoryLog.findMany>>);

        const res = await exportInventoryCsv(
          { startDate: "2026-09-01", endDate: "2026-09-07" },
          {
            session: {
              user: {
                id: "u-1",
                organizationId: "org-1",
                role: "DIRECTOR",
              },
            },
          }
        );

        expect(res.ok).toBe(true);
        expect(res.filename).toBe("laporan-mutasi-inventaris-2026-09-01-2026-09-07.csv");
        expect(res.csv).toContain("ID Log");
        expect(res.csv).toContain("Kapas Gulung");
        expect(res.csv).toContain("KPS-001");
        expect(res.csv).toContain("RESTOCK");
      });
    });
  });
});
