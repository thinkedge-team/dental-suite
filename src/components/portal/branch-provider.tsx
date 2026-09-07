"use client";

import React, { createContext, useContext, useState, useTransition, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { setActiveBranch as setActiveBranchAction } from "@/lib/branch-context";

export interface BranchOption {
  readonly id: string;
  readonly name: string;
}

interface BranchContextType {
  readonly branches: readonly BranchOption[];
  readonly selectedBranchId: string | null;
  readonly selectedBranch: BranchOption | null;
  readonly selectBranch: (branchId: string | null) => void;
  readonly isDirector: boolean;
  readonly isPending: boolean;
}

const BranchContext = createContext<BranchContextType | null>(null);

export function BranchProvider({
  children,
  branches,
  initialBranchId,
  isDirector,
}: {
  readonly children: React.ReactNode;
  readonly branches: readonly BranchOption[];
  readonly initialBranchId?: string | null;
  readonly isDirector: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() => {
    if (!isDirector) return null;
    return initialBranchId ?? null;
  });

  const branchParam = searchParams.get("branch");
  const [prevBranchParam, setPrevBranchParam] = useState(branchParam);

  if (branchParam !== prevBranchParam) {
    setPrevBranchParam(branchParam);
    if (branchParam === "all" || branchParam === "semua" || branchParam === "") {
      setSelectedBranchId(null);
    } else if (branchParam !== null) {
      setSelectedBranchId(branchParam);
    }
  }

  const selectedBranch = useMemo(() => {
    if (!selectedBranchId) return null;
    return branches.find((b) => b.id === selectedBranchId || b.name === selectedBranchId) ?? null;
  }, [selectedBranchId, branches]);

  function selectBranch(branchId: string | null) {
    const cleanId = !branchId || branchId === "all" || branchId === "semua" ? null : branchId;
    setSelectedBranchId(cleanId);

    // Update client cookie synchronously so any subsequent link click immediately has the cookie
    if (typeof document !== "undefined") {
      if (!cleanId) {
        document.cookie = "portal_branch=; path=/; max-age=0";
      } else {
        document.cookie = `portal_branch=${encodeURIComponent(cleanId)}; path=/; max-age=2592000; SameSite=Lax`;
      }
    }

    startTransition(async () => {
      await setActiveBranchAction(cleanId);
      const params = new URLSearchParams(searchParams.toString());
      if (!cleanId) {
        params.delete("branch");
      } else {
        params.set("branch", cleanId);
      }
      const q = params.toString();
      router.push(`${pathname}${q ? `?${q}` : ""}`);
      router.refresh();
    });
  }

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId,
        selectedBranch,
        selectBranch,
        isDirector,
        isPending,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return ctx;
}
