import { describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    service: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    doctor: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    branchDoctor: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      return callback({
        doctor: {
          create: vi.fn().mockResolvedValue({ id: "doc-created-1" }),
          update: vi.fn().mockResolvedValue({ id: "doc-updated-1" }),
        },
        branchDoctor: {
          createMany: vi.fn().mockResolvedValue({ count: 2 }),
          deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      });
    }),
  },
}));

import {
  generateServiceSlug,
  createService,
  updateService,
} from "@/lib/actions/services";
import {
  generateDoctorSlug,
  createDoctor,
  updateDoctor,
} from "@/lib/actions/doctors";
import { prisma } from "@/lib/prisma";

describe("Services & Doctors - Slug Generation", () => {
  describe("generateServiceSlug", () => {
    it("converts service name to clean slug", async () => {
      const slug = await generateServiceSlug("Scaling & Polishing Gigi");
      expect(slug).toBe("scaling-polishing-gigi");
    });

    it("strips punctuation and accents", async () => {
      const slug = await generateServiceSlug("Perawatan Saluran Akar (Endodontik) - Level 1");
      expect(slug).toBe("perawatan-saluran-akar-endodontik-level-1");
    });

    it("does not contain any em-dashes or unicode dashes", async () => {
      const slug = await generateServiceSlug("Tambal Gigi \u2014 Komposit Estetik \u2013 Depan");
      expect(slug).toBe("tambal-gigi-komposit-estetik-depan");
      expect(slug).not.toContain("\u2014");
      expect(slug).not.toContain("\u2013");
    });

    it("falls back to service if empty", async () => {
      const slug = await generateServiceSlug("!@#$%");
      expect(slug).toBe("service");
    });
  });

  describe("generateDoctorSlug", () => {
    it("converts doctor name to clean slug", async () => {
      const slug = await generateDoctorSlug("drg. Anisa Rahmawati, Sp.KG");
      expect(slug).toBe("drg-anisa-rahmawati-sp-kg");
    });

    it("does not contain em-dashes", async () => {
      const slug = await generateDoctorSlug("drg. Budi Santoso \u2014 Sp.BM");
      expect(slug).toBe("drg-budi-santoso-sp-bm");
      expect(slug).not.toContain("\u2014");
    });

    it("falls back to doctor if empty", async () => {
      const slug = await generateDoctorSlug("***");
      expect(slug).toBe("doctor");
    });
  });
});

describe("createService action", () => {
  it("rejects unauthorized user without organizationId", async () => {
    const ctx = {
      session: {
        user: {
          id: "u1",
          organizationId: "",
          role: "DIRECTOR",
        },
      },
    };

    const res = await createService({ name: "Scaling", price: 300000, durationMin: 30 }, ctx);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("restricts creation to DIRECTOR, SUPER_ADMIN, and MANAGER", async () => {
    const staffCtx = {
      session: {
        user: {
          id: "u2",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const res = await createService({ name: "Scaling", price: 300000, durationMin: 30 }, staffCtx);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Hanya DIRECTOR, SUPER_ADMIN, atau MANAGER");
  });

  it("validates price and duration", async () => {
    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    const negativePrice = await createService(
      { name: "Scaling", price: -1000, durationMin: 30 },
      directorCtx,
    );
    expect(negativePrice.ok).toBe(false);
    expect(negativePrice.error).toContain("Harga layanan harus berupa angka positif");

    const zeroDuration = await createService(
      { name: "Scaling", price: 200000, durationMin: 0 },
      directorCtx,
    );
    expect(zeroDuration.ok).toBe(false);
    expect(zeroDuration.error).toContain("Durasi layanan minimal 1 menit");
  });

  it("creates service successfully for MANAGER role with auto-slug", async () => {
    vi.mocked(prisma.service.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.service.create).mockResolvedValueOnce({ id: "srv-1" } as unknown as never);

    const managerCtx = {
      session: {
        user: {
          id: "u-mgr",
          organizationId: "org-1",
          role: "MANAGER",
        },
      },
    };

    const res = await createService(
      {
        name: "Cabut Gigi Bungsu",
        price: 750000,
        durationMin: 45,
        description: "Odontektomi minor",
      },
      managerCtx,
    );

    expect(res.ok).toBe(true);
    expect(res.serviceId).toBe("srv-1");
    expect(prisma.service.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-1",
        name: "Cabut Gigi Bungsu",
        slug: "cabut-gigi-bungsu",
        price: 750000,
        durationMin: 45,
        isActive: true,
      }),
      select: { id: true },
    });
  });
});

describe("updateService action", () => {
  it("rejects unauthorized user", async () => {
    const ctx = {
      session: {
        user: {
          id: "u1",
          organizationId: "",
          role: "DIRECTOR",
        },
      },
    };

    const res = await updateService("srv-1", { name: "New Name", price: 100000, durationMin: 20 }, ctx);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("updates service successfully", async () => {
    vi.mocked(prisma.service.findFirst).mockResolvedValueOnce({
      id: "srv-1",
      name: "Scaling",
      slug: "scaling",
    } as unknown as never);
    vi.mocked(prisma.service.update).mockResolvedValueOnce({ id: "srv-1" } as unknown as never);

    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    const res = await updateService(
      "srv-1",
      {
        name: "Scaling",
        price: 350000,
        durationMin: 40,
        isActive: true,
      },
      directorCtx,
    );

    expect(res.ok).toBe(true);
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: "srv-1" },
      data: expect.objectContaining({
        name: "Scaling",
        price: 350000,
        durationMin: 40,
        isActive: true,
      }),
    });
  });
});

describe("createDoctor action", () => {
  it("restricts creation to DIRECTOR and SUPER_ADMIN (MANAGER not allowed)", async () => {
    const managerCtx = {
      session: {
        user: {
          id: "u-mgr",
          organizationId: "org-1",
          role: "MANAGER",
        },
      },
    };

    const res = await createDoctor(
      {
        name: "drg. Budi",
        title: "drg.",
        specialty: "Umum",
        branchIds: ["branch-1"],
      },
      managerCtx,
    );

    expect(res.ok).toBe(false);
    expect(res.error).toContain("Hanya DIRECTOR atau SUPER_ADMIN");
  });

  it("creates doctor with branch relations in transaction", async () => {
    vi.mocked(prisma.doctor.findFirst).mockResolvedValueOnce(null);

    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    const res = await createDoctor(
      {
        name: "drg. Anisa Rahmawati",
        title: "drg.",
        specialty: "Sp.KG",
        sipNumber: "SIP/123/2026",
        strNumber: "STR/456/2026",
        yearsExperience: 7,
        bio: "Spesialis konservasi gigi lulusan UI",
        branchIds: ["branch-1", "branch-2"],
      },
      directorCtx,
    );

    expect(res.ok).toBe(true);
    expect(res.doctorId).toBe("doc-created-1");
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe("updateDoctor action", () => {
  it("rejects unauthorized user", async () => {
    const ctx = {
      session: {
        user: {
          id: "u1",
          organizationId: "",
          role: "DIRECTOR",
        },
      },
    };

    const res = await updateDoctor(
      "doc-1",
      {
        name: "drg. Anisa",
        title: "drg.",
        specialty: "Sp.KG",
        branchIds: [],
      },
      ctx,
    );
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("updates doctor and replaces branch relations in transaction", async () => {
    vi.mocked(prisma.doctor.findFirst).mockResolvedValueOnce({
      id: "doc-1",
      name: "drg. Anisa Rahmawati",
      slug: "drg-anisa-rahmawati",
    } as unknown as never);

    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    const res = await updateDoctor(
      "doc-1",
      {
        name: "drg. Anisa Rahmawati",
        title: "drg.",
        specialty: "Sp.KG",
        yearsExperience: 8,
        branchIds: ["branch-2", "branch-3"],
        isActive: true,
      },
      directorCtx,
    );

    expect(res.ok).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
