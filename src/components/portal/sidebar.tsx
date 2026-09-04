"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  Menu,
  X,
  Stethoscope,
  Building2,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user?: {
    name?: string | null;
    role?: string;
    branchName?: string | null;
  };
  modules?: {
    grow: boolean;
    connect: boolean;
    operate: boolean;
    intelligence: boolean;
  };
}

function ToothMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 3C10.5 3 7 5.5 7 9c0 2 .8 3.5 1.5 5C9.5 16 10 18 10 21c0 1.5.5 3 2 3s2-2 2-3.5c0-.8.4-1.5 1-1.5s1 .7 1 1.5C16 22 16.5 24 18 24s2-1.5 2-3c0-3 .5-5 1.5-7C22.2 12.5 23 11 23 9c0-3.5-3.5-6-9-6z"
        fill="var(--color-primary)"
        fillOpacity="1"
      />
    </svg>
  );
}

export function Sidebar({ user, modules }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role ?? "DIRECTOR";
  const userModules = modules ?? { grow: true, connect: true, operate: false, intelligence: false };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, show: true },
    { 
      name: "Jadwal Janji", 
      href: "/appointments", 
      icon: CalendarDays, 
      show: userModules.connect 
    },
    { 
      name: "Pasien", 
      href: "/patients", 
      icon: Users, 
      show: userModules.connect || userModules.operate 
    },
    { 
      name: "Dokter", 
      href: "/doctors", 
      icon: Stethoscope, 
      show: userModules.connect 
    },
    { 
      name: "Cabang", 
      href: "/branches", 
      icon: Building2, 
      show: role === "DIRECTOR" || role === "MANAGER" || role === "SUPER_ADMIN" 
    },
    { 
      name: "Pengaturan", 
      href: "/settings/organization", 
      icon: Settings, 
      show: role === "DIRECTOR" || role === "SUPER_ADMIN" 
    },
  ].filter((item) => item.show);

  const displayName = user?.name || "Admin Klinik";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-sidebar">
        <div className="flex items-center gap-2">
          <ToothMark />
          <span className="font-semibold text-base text-sidebar-foreground tracking-tight">
            Think Edge Dental
          </span>
        </div>
        <button
          type="button"
          aria-label="Buka menu navigasi"
          aria-expanded={mobileMenuOpen}
          aria-controls="sidebar-drawer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-sidebar-foreground/70 hover:text-sidebar-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        id="sidebar-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-sidebar text-sidebar-foreground/80 transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
          <ToothMark />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-white tracking-tight">
              Dental Suite
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">
              Think Edge
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? "opacity-100" : "opacity-60"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-bold text-xs shrink-0">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  {role}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-white/40 hover:text-destructive p-1 rounded transition-colors md:hidden"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-foreground/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}