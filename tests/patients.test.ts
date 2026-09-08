import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patient: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { anonymizePatient } from "@/lib/actions/patients";
import { prisma } from "@/lib/prisma";

describe("Patient Anonymization Action (UU PDP)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized user", async () => {
    const res = await anonymizePatient("pat-1", {
      session: { user: { id: "u1", organizationId: "", role: "STAFF" } },
    });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("rejects staff without permission", async () => {
    const res = await anonymizePatient("pat-1", {
      session: { user: { id: "u1", organizationId: "org-1", role: "STAFF" } },
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Hanya Direktur atau Manajer");
  });

  it("returns error if patient not found", async () => {
    vi.mocked(prisma.patient.findFirst).mockResolvedValueOnce(null);

    const res = await anonymizePatient("pat-not-found", {
      session: { user: { id: "u1", organizationId: "org-1", role: "DIRECTOR" } },
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("tidak ditemukan");
  });

  it("anonymizes patient PII and sets deletedAt successfully as Director", async () => {
    vi.mocked(prisma.patient.findFirst).mockResolvedValueOnce({
      id: "pat-123456",
      name: "Budi Santoso",
    } as unknown as Awaited<ReturnType<typeof prisma.patient.findFirst>>);

    vi.mocked(prisma.patient.update).mockResolvedValueOnce({
      id: "pat-123456",
    } as unknown as Awaited<ReturnType<typeof prisma.patient.update>>);

    const res = await anonymizePatient("pat-123456", {
      session: { user: { id: "u1", organizationId: "org-1", role: "DIRECTOR" } },
    });

    expect(res.ok).toBe(true);
    expect(prisma.patient.update).toHaveBeenCalledWith({
      where: { id: "pat-123456" },
      data: expect.objectContaining({
        name: expect.stringContaining("Pasien Anonim"),
        phone: expect.stringContaining("080000000000-"),
        email: null,
        dob: null,
        deletedAt: expect.any(Date),
      }),
    });
  });
});
