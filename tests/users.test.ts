import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("mocked_hashed_password"),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    branch: {
      findFirst: vi.fn(),
    },
  },
}));

import { createUser, updateUser, toggleUserActive } from "@/lib/actions/users";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";

describe("User Management Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("rejects unauthenticated user", async () => {
      const res = await createUser(
        {
          name: "Staf Baru",
          email: "staf@test.com",
          password: "password123",
          role: Role.STAFF,
        },
        { session: { user: { id: "u1", organizationId: "", role: "STAFF" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toBe("Unauthorized");
    });

    it("rejects unauthorized staff role from creating users", async () => {
      const res = await createUser(
        {
          name: "Staf Baru",
          email: "staf@test.com",
          password: "password123",
          role: Role.STAFF,
        },
        { session: { user: { id: "u1", organizationId: "org-1", role: "STAFF" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Hanya Direktur atau Manajer");
    });

    it("rejects manager from creating non-staff role", async () => {
      const res = await createUser(
        {
          name: "Manager Baru",
          email: "mgr@test.com",
          password: "password123",
          role: Role.MANAGER,
        },
        { session: { user: { id: "u2", organizationId: "org-1", role: "MANAGER", branchId: "b-1" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("peran Staf");
    });

    it("validates email format", async () => {
      const res = await createUser(
        {
          name: "Staf Baru",
          email: "invalid-email-format",
          password: "password123",
          role: Role.STAFF,
        },
        { session: { user: { id: "u1", organizationId: "org-1", role: "DIRECTOR" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Format alamat email");
    });

    it("validates minimum password length", async () => {
      const res = await createUser(
        {
          name: "Staf Baru",
          email: "staf@test.com",
          password: "123",
          role: Role.STAFF,
        },
        { session: { user: { id: "u1", organizationId: "org-1", role: "DIRECTOR" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("minimal 6 karakter");
    });

    it("rejects existing email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: "existing-u",
      } as unknown as ReturnType<typeof prisma.user.findUnique>);

      const res = await createUser(
        {
          name: "Staf Baru",
          email: "existing@test.com",
          password: "password123",
          role: Role.STAFF,
        },
        { session: { user: { id: "u1", organizationId: "org-1", role: "DIRECTOR" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Email sudah terdaftar");
    });

    it("creates staff user successfully as Director", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.branch.findFirst).mockResolvedValueOnce({ id: "b-1" } as unknown as ReturnType<typeof prisma.branch.findFirst>);
      vi.mocked(prisma.user.create).mockResolvedValueOnce({ id: "new-user-id" } as unknown as ReturnType<typeof prisma.user.create>);

      const res = await createUser(
        {
          name: "Staf Valid",
          email: "valid@test.com",
          password: "password123",
          role: Role.STAFF,
          branchId: "b-1",
        },
        { session: { user: { id: "dir-1", organizationId: "org-1", role: "DIRECTOR" } } },
      );
      expect(res.ok).toBe(true);
      expect(res.userId).toBe("new-user-id");
    });
  });

  describe("updateUser", () => {
    it("prevents self deactivation", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
        id: "u1",
        role: Role.DIRECTOR,
        branchId: null,
        isActive: true,
      } as unknown as ReturnType<typeof prisma.user.findFirst>);

      const res = await updateUser(
        "u1",
        { isActive: false },
        { session: { user: { id: "u1", organizationId: "org-1", role: "DIRECTOR" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Tidak dapat menonaktifkan akun sendiri");
    });

    it("prevents deactivating last active director", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
        id: "target-dir",
        role: Role.DIRECTOR,
        branchId: null,
        isActive: true,
      } as unknown as ReturnType<typeof prisma.user.findFirst>);

      vi.mocked(prisma.user.count).mockResolvedValueOnce(1);

      const res = await updateUser(
        "target-dir",
        { isActive: false },
        { session: { user: { id: "superadmin", organizationId: "org-1", role: "SUPER_ADMIN" } } },
      );
      expect(res.ok).toBe(false);
      expect(res.error).toContain("minimal satu Direktur aktif");
    });

    it("updates user successfully", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
        id: "u-staff",
        role: Role.STAFF,
        branchId: "b-1",
        isActive: true,
      } as unknown as ReturnType<typeof prisma.user.findFirst>);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({ id: "u-staff" } as unknown as ReturnType<typeof prisma.user.update>);

      const res = await updateUser(
        "u-staff",
        { name: "Nama Diperbarui" },
        { session: { user: { id: "dir-1", organizationId: "org-1", role: "DIRECTOR" } } },
      );
      expect(res.ok).toBe(true);
    });
  });

  describe("toggleUserActive", () => {
    it("toggles active state", async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
        id: "u-target",
        isActive: true,
      } as unknown as ReturnType<typeof prisma.user.findFirst>);

      vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
        id: "u-target",
        role: Role.STAFF,
        branchId: "b-1",
        isActive: true,
      } as unknown as ReturnType<typeof prisma.user.findFirst>);

      vi.mocked(prisma.user.update).mockResolvedValueOnce({ id: "u-target" } as unknown as ReturnType<typeof prisma.user.update>);

      const res = await toggleUserActive("u-target", {
        session: { user: { id: "dir-1", organizationId: "org-1", role: "DIRECTOR" } },
      });
      expect(res.ok).toBe(true);
    });
  });
});
