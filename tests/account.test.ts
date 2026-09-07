import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { updateUserProfile, changeUserPassword } from "@/lib/actions/account";

describe("Account Actions - updateUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not authenticated", async () => {
    const ctx = { session: null };
    const result = await updateUserProfile({ name: "Budi Santoso" }, ctx);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Tidak terautentikasi");
  });

  it("fails if name has less than 2 characters", async () => {
    const ctx = {
      session: {
        user: {
          id: "user-123",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const result = await updateUserProfile({ name: " A " }, ctx);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("minimal 2 karakter");
  });

  it("updates user profile and revalidates paths when input is valid", async () => {
    const ctx = {
      session: {
        user: {
          id: "user-123",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user-123",
      name: "Budi Santoso",
    } as unknown as Awaited<ReturnType<typeof prisma.user.update>>);

    const result = await updateUserProfile({ name: "  Budi Santoso  " }, ctx);

    expect(result.ok).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { name: "Budi Santoso" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/settings/profile");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

describe("Account Actions - changeUserPassword and bcryptjs logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("correctly compares and hashes password using bcryptjs", async () => {
    const rawPassword = "ValidPassword123!";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const match = await bcrypt.compare(rawPassword, hash);
    const wrongMatch = await bcrypt.compare("WrongPassword", hash);

    expect(match).toBe(true);
    expect(wrongMatch).toBe(false);
  });

  it("fails if unauthenticated", async () => {
    const ctx = { session: null };

    const result = await changeUserPassword(
      {
        currentPassword: "oldpassword",
        newPassword: "newpassword123",
      },
      ctx
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Tidak terautentikasi");
  });

  it("fails if new password is under 8 characters", async () => {
    const ctx = {
      session: {
        user: {
          id: "user-123",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const result = await changeUserPassword(
      {
        currentPassword: "oldpassword",
        newPassword: "short",
      },
      ctx
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain("minimal 8 karakter");
  });

  it("returns error if current password does not match", async () => {
    const ctx = {
      session: {
        user: {
          id: "user-123",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const correctHash = await bcrypt.hash("correct-old-password", 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      passwordHash: correctHash,
    } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);

    const result = await changeUserPassword(
      {
        currentPassword: "wrong-password",
        newPassword: "newpassword123",
      },
      ctx
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Password saat ini salah.");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("hashes new password and updates database if current password matches", async () => {
    const ctx = {
      session: {
        user: {
          id: "user-123",
          organizationId: "org-1",
          role: "STAFF",
        },
      },
    };

    const currentPlain = "correct-old-password";
    const currentHash = await bcrypt.hash(currentPlain, 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      passwordHash: currentHash,
    } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);

    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user-123",
      passwordHash: "dummy-new-hash",
    } as unknown as Awaited<ReturnType<typeof prisma.user.update>>);

    const result = await changeUserPassword(
      {
        currentPassword: currentPlain,
        newPassword: "newsecretpassword123",
      },
      ctx
    );

    expect(result.ok).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledTimes(1);

    const updateCall = vi.mocked(prisma.user.update).mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: "user-123" });
    const savedHash = updateCall.data.passwordHash as string;
    const isNewPasswordValid = await bcrypt.compare("newsecretpassword123", savedHash);
    expect(isNewPasswordValid).toBe(true);
  });
});
