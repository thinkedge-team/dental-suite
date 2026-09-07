"use server";

import { cookies } from "next/headers";

export async function getActiveBranchId(
  searchParamBranch?: string | null,
  userBranchId?: string | null,
  isDirector: boolean = false,
): Promise<string | undefined> {
  // If user is locked to a specific branch (STAFF, MANAGER, DOCTOR)
  if (!isDirector && userBranchId) {
    return userBranchId;
  }

  // 1. Explicit query parameter in URL has highest priority
  if (searchParamBranch && searchParamBranch.trim().length > 0) {
    const trimmed = searchParamBranch.trim();
    if (trimmed === "all" || trimmed === "semua") return undefined;
    return trimmed;
  }

  // 2. Global persistent cookie set by the header switcher
  const cookieStore = await cookies();
  const cookieBranch = cookieStore.get("portal_branch")?.value;
  if (cookieBranch && cookieBranch.trim().length > 0 && cookieBranch !== "all") {
    return cookieBranch.trim();
  }

  // 3. Fallback: all branches (consolidated view for Directors)
  return undefined;
}

export async function setActiveBranch(branchId?: string | null): Promise<void> {
  const cookieStore = await cookies();
  if (!branchId || branchId === "all" || branchId === "semua") {
    cookieStore.delete("portal_branch");
  } else {
    cookieStore.set("portal_branch", branchId.trim(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days persistence
      sameSite: "lax",
    });
  }
}
