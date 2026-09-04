"use client";

import { signOut } from "next-auth/react";
import { LogOut, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  organizationName: string;
  branchName?: string | null;
  role: string;
  branches?: Array<{ id: string; name: string }>;
}

export function PortalHeader({
  organizationName,
  branchName,
  role,
  branches = [],
}: HeaderProps) {
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";

  return (
    <header className="hidden md:flex h-14 items-center justify-between border-b bg-card px-8 shadow-none sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-foreground text-sm tracking-tight">
          {organizationName}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>Cabang:</span>
          {isDirector && branches.length > 0 ? (
            <div className="relative inline-flex items-center gap-1 font-semibold text-foreground bg-muted/50 px-2.5 py-1 rounded-md text-xs cursor-pointer hover:bg-muted transition-colors">
              <span>{branchName || "Semua Cabang"}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          ) : (
            <strong className="text-foreground font-semibold text-xs">
              {branchName || "Semua Cabang"}
            </strong>
          )}
        </div>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs font-semibold gap-1.5 h-8 px-2.5"
          title="Keluar dari akun"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </Button>
      </div>
    </header>
  );
}
