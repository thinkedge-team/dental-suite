/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    branch: {
      findFirst: vi.fn(),
    },
    approvalRequest: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    inventoryItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    inventoryLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

import {
  validateApprovalPayload,
  canUserReviewRequest,
  isProcurementPayload,
  isMaintenancePayload,
  isOtherPayload,
  type ProcurementPayload,
  type MaintenancePayload,
  type OtherPayload,
} from "@/lib/approvals/types";
import {
  submitApprovalRequest,
  reviewApprovalRequest,
  fulfillProcurementToStock,
} from "@/lib/actions/approvals";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

describe("Approval Payload Validation (validateApprovalPayload)", () => {
  describe("PROCUREMENT payloads", () => {
    it("validates a complete valid procurement payload", () => {
      const payload: ProcurementPayload = {
        title: "Pengadaan Anestesi Lidocaine",
        itemId: "item-123",
        itemName: "Lidocaine HCl 2%",
        category: "Obat & Anestesi",
        currentStock: 5,
        minStock: 10,
        unit: "ampul",
        quantity: 30,
        estimatedCost: 450000,
        urgency: "URGENT",
        notes: "Stok kritis untuk tindakan bedah minor",
      };

      const res = validateApprovalPayload("PROCUREMENT", payload);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("rejects non-object or null payloads", () => {
      expect(validateApprovalPayload("PROCUREMENT", null).valid).toBe(false);
      expect(validateApprovalPayload("PROCUREMENT", "invalid").valid).toBe(false);
      expect(validateApprovalPayload("PROCUREMENT", undefined).valid).toBe(false);
    });

    it("rejects procurement payload with empty or missing title", () => {
      const res = validateApprovalPayload("PROCUREMENT", {
        title: "   ",
        itemName: "Masker Medis",
        unit: "box",
        quantity: 10,
        urgency: "NORMAL",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Judul permohonan pengadaan wajib diisi.");
    });

    it("rejects procurement payload with empty or missing itemName", () => {
      const res = validateApprovalPayload("PROCUREMENT", {
        title: "Beli Masker",
        itemName: "",
        unit: "box",
        quantity: 10,
        urgency: "NORMAL",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Nama barang wajib diisi.");
    });

    it("rejects procurement payload with invalid quantity (non-positive or non-integer)", () => {
      const resZero = validateApprovalPayload("PROCUREMENT", {
        title: "Beli Sarung Tangan",
        itemName: "Latex Gloves S",
        unit: "box",
        quantity: 0,
        urgency: "NORMAL",
      });
      expect(resZero.valid).toBe(false);
      expect(resZero.error).toBe("Jumlah barang harus berupa bilangan bulat positif lebih dari 0.");

      const resFloat = validateApprovalPayload("PROCUREMENT", {
        title: "Beli Sarung Tangan",
        itemName: "Latex Gloves S",
        unit: "box",
        quantity: 2.5,
        urgency: "NORMAL",
      });
      expect(resFloat.valid).toBe(false);
      expect(resFloat.error).toBe("Jumlah barang harus berupa bilangan bulat positif lebih dari 0.");
    });

    it("rejects procurement payload with invalid urgency", () => {
      const res = validateApprovalPayload("PROCUREMENT", {
        title: "Beli Jarum Suntik",
        itemName: "Needle 27G",
        unit: "box",
        quantity: 5,
        urgency: "VERY_URGENT",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Tingkat urgensi harus NORMAL atau URGENT.");
    });

    it("rejects procurement payload with negative estimated cost", () => {
      const res = validateApprovalPayload("PROCUREMENT", {
        title: "Beli Jarum Suntik",
        itemName: "Needle 27G",
        unit: "box",
        quantity: 5,
        urgency: "NORMAL",
        estimatedCost: -50000,
      });
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Estimasi biaya harus berupa angka non-negatif.");
    });
  });

  describe("MAINTENANCE payloads", () => {
    it("validates a complete valid maintenance payload", () => {
      const payload: MaintenancePayload = {
        title: "Perbaikan Selang Suction Unit 2",
        equipmentName: "Dental Unit Kursi 2",
        urgency: "URGENT",
        estimatedCost: 350000,
        description: "Selang suction bocor dan tekanan vakum menurun drastis.",
      };

      const res = validateApprovalPayload("MAINTENANCE", payload);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("rejects maintenance payload with missing equipment name or description", () => {
      const resEquipment = validateApprovalPayload("MAINTENANCE", {
        title: "Servis Alat",
        equipmentName: "",
        urgency: "NORMAL",
        description: "Servis rutin bulanan",
      });
      expect(resEquipment.valid).toBe(false);
      expect(resEquipment.error).toBe("Nama alat / unit wajib diisi.");

      const resDesc = validateApprovalPayload("MAINTENANCE", {
        title: "Servis Alat",
        equipmentName: "Autoclave",
        urgency: "NORMAL",
        description: "",
      });
      expect(resDesc.valid).toBe(false);
      expect(resDesc.error).toBe("Deskripsi perbaikan atau pemeliharaan wajib diisi.");
    });
  });

  describe("OTHER payloads", () => {
    it("validates a complete valid other operational payload", () => {
      const payload: OtherPayload = {
        title: "Penggantian Lampu Ruang Tunggu",
        estimatedCost: 150000,
        description: "Lampu LED di ruang tunggu pasien redup dan perlu diganti.",
      };

      const res = validateApprovalPayload("OTHER", payload);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("rejects other payload with missing description", () => {
      const res = validateApprovalPayload("OTHER", {
        title: "Beli Snack Dokter",
        description: "",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Deskripsi permohonan operasional wajib diisi.");
    });
  });

  describe("Unknown types", () => {
    it("rejects unsupported approval types", () => {
      const res = validateApprovalPayload("UNKNOWN_TYPE", { title: "Test" });
      expect(res.valid).toBe(false);
      expect(res.error).toBe("Tipe permohonan tidak dikenali.");
    });
  });
});

describe("Two-Tier Review Authorization (canUserReviewRequest)", () => {
  const branchA = "branch-kelapa-gading";
  const branchB = "branch-pluit";

  it("allows DIRECTOR to review requests across any branch", () => {
    expect(canUserReviewRequest("DIRECTOR", branchA, branchA)).toBe(true);
    expect(canUserReviewRequest("DIRECTOR", branchA, branchB)).toBe(true);
    expect(canUserReviewRequest("DIRECTOR", null, branchA)).toBe(true);
    expect(canUserReviewRequest("DIRECTOR", undefined, branchB)).toBe(true);
  });

  it("allows SUPER_ADMIN to review requests across any branch", () => {
    expect(canUserReviewRequest("SUPER_ADMIN", null, branchA)).toBe(true);
    expect(canUserReviewRequest("SUPER_ADMIN", branchA, branchB)).toBe(true);
  });

  it("allows MANAGER to review requests only from their assigned branch", () => {
    expect(canUserReviewRequest("MANAGER", branchA, branchA)).toBe(true);
    expect(canUserReviewRequest("MANAGER", branchB, branchB)).toBe(true);
    expect(canUserReviewRequest("MANAGER", branchA, branchB)).toBe(false);
    expect(canUserReviewRequest("MANAGER", null, branchA)).toBe(false);
    expect(canUserReviewRequest("MANAGER", undefined, branchA)).toBe(false);
  });

  it("denies review access to STAFF and DOCTOR roles", () => {
    expect(canUserReviewRequest("STAFF", branchA, branchA)).toBe(false);
    expect(canUserReviewRequest("STAFF", branchA, branchB)).toBe(false);
    expect(canUserReviewRequest("DOCTOR", branchA, branchA)).toBe(false);
    expect(canUserReviewRequest("DOCTOR", branchB, branchB)).toBe(false);
  });
});

describe("Typeguards", () => {
  it("correctly identifies payload variants", () => {
    const procPayload: ProcurementPayload = {
      title: "Pengadaan Obat",
      itemName: "Amoxicillin 500mg",
      unit: "strip",
      quantity: 20,
      urgency: "NORMAL",
    };
    const maintPayload: MaintenancePayload = {
      title: "Servis Compressor",
      equipmentName: "Air Compressor 1HP",
      urgency: "URGENT",
      description: "Oli kompresor bocor",
    };
    const otherPayload: OtherPayload = {
      title: "Langganan Internet",
      description: "Perpanjangan tagihan ISP klinik",
    };

    expect(isProcurementPayload(procPayload)).toBe(true);
    expect(isProcurementPayload(maintPayload)).toBe(false);

    expect(isMaintenancePayload(maintPayload)).toBe(true);
    expect(isMaintenancePayload(otherPayload)).toBe(false);

    expect(isOtherPayload(otherPayload)).toBe(true);
    expect(isOtherPayload(maintPayload)).toBe(false);
  });
});

describe("Server Actions: Approvals", () => {
  const mockOrgId = "org-1";
  const mockBranchA = "branch-a";
  const mockBranchB = "branch-b";

  const staffContext = {
    session: {
      user: {
        id: "user-staff",
        role: "STAFF",
        organizationId: mockOrgId,
        branchId: mockBranchA,
      },
    },
  };

  const managerContext = {
    session: {
      user: {
        id: "user-mgr",
        role: "MANAGER",
        organizationId: mockOrgId,
        branchId: mockBranchA,
      },
    },
  };

  const directorContext = {
    session: {
      user: {
        id: "user-dir",
        role: "DIRECTOR",
        organizationId: mockOrgId,
        branchId: null,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitApprovalRequest", () => {
    it("fails when unauthenticated", async () => {
      const res = await submitApprovalRequest(
        {
          branchId: mockBranchA,
          type: "PROCUREMENT",
          payload: {
            title: "Test",
            itemName: "Mask",
            unit: "box",
            quantity: 10,
            urgency: "NORMAL",
          },
        },
        { session: { user: { id: "x", role: "STAFF", organizationId: "" } } }
      );
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("enforces branch scoping for staff", async () => {
      const res = await submitApprovalRequest(
        {
          branchId: mockBranchB,
          type: "PROCUREMENT",
          payload: {
            title: "Test",
            itemName: "Mask",
            unit: "box",
            quantity: 10,
            urgency: "NORMAL",
          },
        },
        staffContext
      );
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Akses cabang tidak diizinkan.");
    });

    it("creates request successfully for staff on own branch", async () => {
      vi.mocked(prisma.branch.findFirst).mockResolvedValue({ id: mockBranchA } as never);
      vi.mocked(prisma.approvalRequest.create).mockResolvedValue({ id: "req-1" } as never);

      const res = await submitApprovalRequest(
        {
          branchId: mockBranchA,
          type: "PROCUREMENT",
          payload: {
            title: "Pengadaan Sarung Tangan",
            itemName: "Latex Glove",
            unit: "box",
            quantity: 10,
            urgency: "NORMAL",
          },
        },
        staffContext
      );

      expect(res.ok).toBe(true);
      expect(res.requestId).toBe("req-1");
      expect(prisma.approvalRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: mockOrgId,
            branchId: mockBranchA,
            requestedById: "user-staff",
            type: "PROCUREMENT",
            status: "PENDING",
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/operate/approvals");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("reviewApprovalRequest", () => {
    it("allows manager to review request from own branch", async () => {
      vi.mocked(prisma.approvalRequest.findFirst).mockResolvedValue({
        id: "req-1",
        branchId: mockBranchA,
        status: "PENDING",
      } as never);
      vi.mocked(prisma.approvalRequest.update).mockResolvedValue({ id: "req-1" } as never);

      const res = await reviewApprovalRequest(
        {
          requestId: "req-1",
          status: "APPROVED",
          reviewNote: "Disetujui untuk operasional",
        },
        managerContext
      );

      expect(res.ok).toBe(true);
      expect(prisma.approvalRequest.update).toHaveBeenCalledWith({
        where: { id: "req-1" },
        data: {
          status: "APPROVED",
          reviewNote: "Disetujui untuk operasional",
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/operate/approvals");
    });

    it("prevents manager from reviewing request from different branch", async () => {
      vi.mocked(prisma.approvalRequest.findFirst).mockResolvedValue({
        id: "req-2",
        branchId: mockBranchB,
        status: "PENDING",
      } as never);

      const res = await reviewApprovalRequest(
        {
          requestId: "req-2",
          status: "REJECTED",
        },
        managerContext
      );

      expect(res.ok).toBe(false);
      expect(res.error).toBe("Tidak memiliki izin untuk meninjau permohonan ini.");
      expect(prisma.approvalRequest.update).not.toHaveBeenCalled();
    });

    it("allows director to review requests across any branch", async () => {
      vi.mocked(prisma.approvalRequest.findFirst).mockResolvedValue({
        id: "req-2",
        branchId: mockBranchB,
        status: "PENDING",
      } as never);
      vi.mocked(prisma.approvalRequest.update).mockResolvedValue({ id: "req-2" } as never);

      const res = await reviewApprovalRequest(
        {
          requestId: "req-2",
          status: "APPROVED",
        },
        directorContext
      );

      expect(res.ok).toBe(true);
      expect(prisma.approvalRequest.update).toHaveBeenCalled();
    });
  });

  describe("fulfillProcurementToStock", () => {
    it("increments inventory item stock and logs RESTOCK mutation", async () => {
      vi.mocked(prisma.approvalRequest.findFirst).mockResolvedValue({
        id: "req-proc-1",
        branchId: mockBranchA,
        type: "PROCUREMENT",
        payload: {
          title: "Pengadaan Jarum",
          itemId: "item-needle",
          itemName: "Needle 27G",
          unit: "box",
          quantity: 20,
          urgency: "NORMAL",
        },
      } as never);

      vi.mocked(prisma.inventoryItem.findFirst).mockResolvedValue({
        id: "item-needle",
        stock: 5,
      } as never);

      vi.mocked(prisma.inventoryItem.update).mockResolvedValue({
        id: "item-needle",
        stock: 25,
      } as never);

      const res = await fulfillProcurementToStock(
        { requestId: "req-proc-1" },
        directorContext
      );

      expect(res.ok).toBe(true);
      expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: "item-needle" },
        data: { stock: { increment: 20 } },
      });
      expect(prisma.inventoryLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          itemId: "item-needle",
          userId: "user-dir",
          type: "RESTOCK",
          quantity: 20,
          previousStock: 5,
          currentStock: 25,
          notes: "Pengadaan barang disetujui: Pengadaan Jarum",
        }),
      });
      expect(prisma.approvalRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "req-proc-1" },
          data: expect.objectContaining({
            payload: expect.objectContaining({
              fulfilledAt: expect.any(String),
            }),
          }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith("/operate/approvals");
      expect(revalidatePath).toHaveBeenCalledWith("/operate/inventory");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("rejects fulfilling already fulfilled procurement", async () => {
      vi.mocked(prisma.approvalRequest.findFirst).mockResolvedValue({
        id: "req-proc-1",
        branchId: mockBranchA,
        type: "PROCUREMENT",
        payload: {
          title: "Pengadaan Jarum",
          itemId: "item-needle",
          itemName: "Needle 27G",
          unit: "box",
          quantity: 20,
          urgency: "NORMAL",
          fulfilledAt: "2026-09-06T10:00:00.000Z",
        },
      } as never);

      const res = await fulfillProcurementToStock(
        { requestId: "req-proc-1" },
        directorContext
      );

      expect(res.ok).toBe(false);
      expect(res.error).toBe("Permohonan pengadaan ini sudah diproses ke stok.");
    });
  });
});
