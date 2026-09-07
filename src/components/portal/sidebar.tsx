"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  Settings,
  Menu,
  X,
  Stethoscope,
  Building2,
  Package,
  CheckSquare,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
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

function ToothMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      name: "Jadwal Praktik", 
      href: "/schedule", 
      icon: Clock, 
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
      name: "Inventaris Medis", 
      href: "/operate/inventory", 
      icon: Package, 
      show: userModules.operate 
    },
    { 
      name: "Persetujuan", 
      href: "/operate/approvals", 
      icon: CheckSquare, 
      show: userModules.operate 
    },
    { 
      name: "Jadwal Shift", 
      href: "/operate/shifts", 
      icon: CalendarDays, 
      show: userModules.operate 
    },
    {
      name: "Presensi Staf",
      href: "/operate/attendance",
      icon: UserCheck,
      show: userModules.operate
    },
    {
      name: "Analitik & KPI",
      href: "/operate/analytics",
      icon: BarChart3,
      show: userModules.intelligence
    },
    {
      name: "Laporan & Ekspor",
      href: "/operate/reports",
      icon: FileSpreadsheet,
      show: userModules.intelligence
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
          <ToothMark size={24} />
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
          "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground/80 transition-all duration-300 ease-in-out md:relative md:h-screen md:sticky md:top-0 flex flex-col shrink-0 overflow-hidden",
          mobileMenuOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-[68px]" : "md:w-60"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-sidebar-border transition-all shrink-0",
          isCollapsed ? "justify-center px-2" : "justify-between px-5"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <ToothMark size={26} />
            {!isCollapsed && (
              <div className="flex flex-col leading-tight transition-opacity duration-200">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  Dental Suite
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest truncate">
                  Think Edge
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Perluas sidebar" : "Kecilkan sidebar"}
            className={cn(
              "hidden md:flex p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-sidebar-accent transition-colors",
              isCollapsed && "mt-1"
            )}
            title={isCollapsed ? "Perluas (Expand)" : "Kecilkan (Collapse)"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-2.5 flex-1 overflow-y-auto overflow-x-hidden">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all group relative",
                  isCollapsed ? "justify-center h-10 w-full px-0" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-transform",
                    isActive ? "opacity-100 scale-105" : "opacity-60 group-hover:opacity-100"
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate transition-opacity duration-200">
                    {item.name}
                  </span>
                )}

                {isCollapsed && (
                  <div className="hidden md:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-background text-xs font-semibold rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none items-center">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2.5 border-t border-sidebar-border shrink-0">
          <div className={cn(
            "flex items-center rounded-lg transition-all",
            isCollapsed ? "justify-center p-1" : "justify-between px-2 py-2"
          )}>
            <div 
              className={cn("flex items-center gap-3 min-w-0", isCollapsed && "justify-center")}
              title={isCollapsed ? `${displayName} (${role})` : undefined}
            >
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-bold text-xs shrink-0 border border-sidebar-border">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {role}
                  </span>
                </div>
              )}
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