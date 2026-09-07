import { describe, it, expect, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: {
      update: vi.fn(),
    },
  },
}));

import { updateOrganizationProfile } from "@/lib/actions/settings";
import { prisma } from "@/lib/prisma";

describe("updateOrganizationProfile action", () => {
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

    const res = await updateOrganizationProfile({ name: "Klinik Baru" }, ctx);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("restricts updates to DIRECTOR and SUPER_ADMIN roles, rejecting STAFF", async () => {
    const staffCtx = {
      session: {
        user: {
          id: "u2",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const res = await updateOrganizationProfile({ name: "Klinik Baru" }, staffCtx);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Hanya DIRECTOR atau SUPER_ADMIN");
  });

  it("restricts updates rejecting DOCTOR role", async () => {
    const doctorCtx = {
      session: {
        user: {
          id: "u3",
          organizationId: "org-1",
          role: "DOCTOR",
        },
      },
    };

    const res = await updateOrganizationProfile({ name: "Klinik Baru" }, doctorCtx);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Hanya DIRECTOR atau SUPER_ADMIN");
  });

  it("validates organization name length (must be >= 2 characters)", async () => {
    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    const resEmpty = await updateOrganizationProfile({ name: " " }, directorCtx);
    expect(resEmpty.ok).toBe(false);
    expect(resEmpty.error).toContain("minimal terdiri dari 2 karakter");

    const resShort = await updateOrganizationProfile({ name: "A" }, directorCtx);
    expect(resShort.ok).toBe(false);
    expect(resShort.error).toContain("minimal terdiri dari 2 karakter");
  });

  it("updates organization profile successfully for DIRECTOR", async () => {
    const directorCtx = {
      session: {
        user: {
          id: "u1",
          organizationId: "org-1",
          role: "DIRECTOR",
        },
      },
    };

    vi.mocked(prisma.organization.update).mockResolvedValueOnce({
      id: "org-1",
      name: "Klinik Gigi Maju Jaya",
      slug: "klinik-gigi-maju-jaya",
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#0D9488",
      seoTitle: null,
      seoDescription: null,
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: true,
      moduleIntelligence: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await updateOrganizationProfile(
      {
        name: "  Klinik Gigi Maju Jaya  ",
        primaryColor: " #0D9488 ",
        logoUrl: " https://example.com/logo.png ",
      },
      directorCtx,
    );

    expect(res.ok).toBe(true);
    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: "org-1" },
      data: {
        name: "Klinik Gigi Maju Jaya",
        primaryColor: "#0D9488",
        logoUrl: "https://example.com/logo.png",
      },
    });
  });

  it("updates organization profile successfully for SUPER_ADMIN with empty optional fields", async () => {
    const adminCtx = {
      session: {
        user: {
          id: "admin-1",
          organizationId: "org-1",
          role: "SUPER_ADMIN",
        },
      },
    };

    vi.mocked(prisma.organization.update).mockResolvedValueOnce({
      id: "org-1",
      name: "Klinik Gigi Sehat",
      slug: "klinik-gigi-sehat",
      logoUrl: null,
      primaryColor: null,
      seoTitle: null,
      seoDescription: null,
      moduleGrow: true,
      moduleConnect: true,
      moduleOperate: false,
      moduleIntelligence: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await updateOrganizationProfile(
      {
        name: "Klinik Gigi Sehat",
        primaryColor: "",
        logoUrl: "",
      },
      adminCtx,
    );

    expect(res.ok).toBe(true);
    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: "org-1" },
      data: {
        name: "Klinik Gigi Sehat",
        primaryColor: null,
        logoUrl: null,
      },
    });
  });
});
