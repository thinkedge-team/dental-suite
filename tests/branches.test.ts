import { describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    branch: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import {
  generateBranchSlug,
  createBranch,
  updateBranch,
} from "@/lib/actions/branches";
import { prisma } from "@/lib/prisma";

describe("generateBranchSlug", () => {
  it("converts basic name to lowercase hyphenated slug", async () => {
    expect(await generateBranchSlug("Cabang Kelapa Gading")).toBe("cabang-kelapa-gading");
  });

  it("handles multiple spaces and trims whitespace", async () => {
    expect(await generateBranchSlug("   Cabang   Pluit    Indah   ")).toBe("cabang-pluit-indah");
  });

  it("removes special characters and punctuation", async () => {
    expect(await generateBranchSlug("Cabang & Klinik #1 (Utama)!")).toBe("cabang-klinik-1-utama");
  });

  it("handles numbers and alphanumeric tokens", async () => {
    expect(await generateBranchSlug("Klinik Gigi 24 Jam Sector 5")).toBe("klinik-gigi-24-jam-sector-5");
  });

  it("handles dashes, underscores and dots cleanly without em-dashes", async () => {
    expect(await generateBranchSlug("Klinik--Sehat__Plus..Center")).toBe("klinik-sehat-plus-center");
  });

  it("falls back to branch when name yields empty slug", async () => {
    expect(await generateBranchSlug("!!! @@@ ### $$$")).toBe("branch");
  });

  it("does not contain any em-dashes or unicode dashes", async () => {
    const slug = await generateBranchSlug("Cabang - Barat \u2014 Timur \u2013 Selatan");
    expect(slug).toBe("cabang-barat-timur-selatan");
    expect(slug).not.toContain("\u2014");
    expect(slug).not.toContain("\u2013");
  });
});

describe("createBranch action", () => {
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

    const res = await createBranch({ name: "Cabang Baru" }, ctx);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("restricts creation to DIRECTOR and SUPER_ADMIN roles", async () => {
    const staffCtx = {
      session: {
        user: {
          id: "u2",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const res = await createBranch({ name: "Cabang Staff" }, staffCtx);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Hanya DIRECTOR atau SUPER_ADMIN");
  });

  it("creates branch successfully for DIRECTOR with unique slug", async () => {
    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    vi.mocked(prisma.branch.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.branch.create).mockResolvedValueOnce({
      id: "branch-new-1",
      organizationId: "org-1",
      name: "Cabang Senopati",
      slug: "cabang-senopati",
      address: null,
      city: "Jakarta Selatan",
      province: null,
      postalCode: null,
      whatsapp: null,
      latitude: null,
      longitude: null,
      openingHours: null,
      parkingInfo: null,
      googleMapsUrl: null,
      photoUrls: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await createBranch(
      {
        name: "Cabang Senopati",
        city: "Jakarta Selatan",
      },
      directorCtx,
    );

    expect(res.ok).toBe(true);
    expect(res.branchId).toBe("branch-new-1");
    expect(prisma.branch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Cabang Senopati",
          slug: "cabang-senopati",
          organizationId: "org-1",
          city: "Jakarta Selatan",
          isActive: true,
        }),
      }),
    );
  });
});

describe("updateBranch action", () => {
  it("allows MANAGER assigned to the branch to update", async () => {
    const managerCtx = {
      session: {
        user: {
          id: "mgr-1",
          organizationId: "org-1",
          role: "MANAGER",
          branchId: "branch-1",
        },
      },
    };

    vi.mocked(prisma.branch.findFirst).mockResolvedValueOnce({
      id: "branch-1",
      name: "Cabang Lama",
      slug: "cabang-lama",
    } as unknown as ReturnType<typeof prisma.branch.findFirst> extends Promise<infer T> ? T : never);
    vi.mocked(prisma.branch.update).mockResolvedValueOnce({
      id: "branch-1",
      organizationId: "org-1",
      name: "Cabang Lama Updated",
      slug: "cabang-lama",
      address: null,
      city: null,
      province: null,
      postalCode: null,
      whatsapp: null,
      latitude: null,
      longitude: null,
      openingHours: null,
      parkingInfo: null,
      googleMapsUrl: null,
      photoUrls: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await updateBranch(
      "branch-1",
      {
        name: "Cabang Lama Updated",
        isActive: true,
      },
      managerCtx,
    );

    expect(res.ok).toBe(true);
    expect(prisma.branch.update).toHaveBeenCalled();
  });

  it("denies MANAGER assigned to a different branch", async () => {
    const managerCtx = {
      session: {
        user: {
          id: "mgr-1",
          organizationId: "org-1",
          role: "MANAGER",
          branchId: "branch-2",
        },
      },
    };

    vi.mocked(prisma.branch.findFirst).mockResolvedValueOnce({
      id: "branch-1",
      name: "Cabang 1",
      slug: "cabang-1",
    } as unknown as ReturnType<typeof prisma.branch.findFirst> extends Promise<infer T> ? T : never);

    const res = await updateBranch(
      "branch-1",
      {
        name: "Cabang 1 Edit",
      },
      managerCtx,
    );

    expect(res.ok).toBe(false);
    expect(res.error).toContain("tidak memiliki wewenang");
  });
});
