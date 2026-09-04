"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { 
  LogOut, 
  Building2, 
  ChevronDown, 
  Search, 
  Bell, 
  Sparkles, 
  Check, 
  Calendar,
  User,
  Settings,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  organizationName: string;
  branchName?: string | null;
  role: string;
  userName?: string | null;
  branches?: Array<{ id: string; name: string }>;
}

export function PortalHeader({
  organizationName,
  branchName,
  role,
  userName,
  branches = [],
}: HeaderProps) {
  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";
  const [selectedBranch, setSelectedBranch] = useState<string>(branchName || "Semua Cabang");
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const displayName = userName || "Pengguna";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setBranchDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setBranchDropdownOpen(false);
        setNotificationsOpen(false);
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b border-border/60 bg-card/90 backdrop-blur-md px-6 lg:px-8 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <span className="font-bold text-foreground text-sm tracking-tight">
          {organizationName}
        </span>

        <div className="h-4 w-px bg-border/80 mx-0.5" />

        <div ref={branchRef} className="relative">
          <button
            type="button"
            onClick={() => isDirector && branches.length > 0 && setBranchDropdownOpen(!branchDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
              isDirector && branches.length > 0
                ? "bg-muted/40 hover:bg-muted border-border/70 text-foreground cursor-pointer"
                : "bg-muted/20 border-transparent text-muted-foreground cursor-default"
            )}
            title={isDirector ? "Ganti cabang aktif" : undefined}
          >
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[130px]">{selectedBranch}</span>
            {isDirector && branches.length > 0 && (
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", branchDropdownOpen && "rotate-180")} />
            )}
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 mt-2 w-52 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                Pilih Cabang Operasional
              </div>
              <button
                type="button"
                onClick={() => { setSelectedBranch("Semua Cabang"); setBranchDropdownOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/60 text-left transition-colors"
              >
                <span className={selectedBranch === "Semua Cabang" ? "text-primary font-semibold" : "text-foreground"}>
                  Semua Cabang
                </span>
                {selectedBranch === "Semua Cabang" && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { setSelectedBranch(b.name); setBranchDropdownOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/60 text-left transition-colors"
                >
                  <span className={selectedBranch === b.name ? "text-primary font-semibold" : "text-foreground"}>
                    {b.name}
                  </span>
                  {selectedBranch === b.name && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Cari pasien, no. rekam medis, dokter, atau janji..."
            className="w-full h-9 pl-9.5 pr-12 rounded-lg bg-muted/40 hover:bg-muted/60 focus:bg-card border border-border/70 focus:border-primary text-xs font-medium text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-mono text-muted-foreground pointer-events-none shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label="Pemberitahuan"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-bold text-foreground">Notifikasi Terkini</span>
                <span className="text-[10px] font-semibold text-primary">Tandai Dibaca</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 flex gap-2.5 items-start">
                  <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Janji Temu Baru Online</p>
                    <p className="text-[11px] text-muted-foreground">Sarah Wijaya memesan Scaling pkl 09:00.</p>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 block">5 menit lalu</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg hover:bg-muted/40 transition-colors flex gap-2.5 items-start">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Pembaruan Modul CONNECT</p>
                    <p className="text-[11px] text-muted-foreground">Integrasi WhatsApp pengingat otomatis aktif.</p>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 block">1 jam lalu</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border/80" />

        {/* Interactive User Profile Dropdown */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-label="Menu profil pengguna"
            aria-expanded={userDropdownOpen}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-xs shrink-0 group-hover:bg-primary/20 transition-colors">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 text-left hidden sm:flex">
              <span className="text-xs font-semibold text-foreground truncate max-w-[130px] leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-tight mt-0.5">
                {role.toLowerCase()}
              </span>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block", userDropdownOpen && "rotate-180")} />
          </button>

          {/* User Profile Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl bg-card border border-border shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-4 py-2 border-b border-border/60">
                <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{role.toLowerCase()} • {organizationName}</p>
              </div>

              <div className="py-1.5 px-1.5 space-y-0.5">
                <Link
                  href="/dashboard"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profil Pengguna</span>
                </Link>

                {isDirector && (
                  <Link
                    href="/settings/organization"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Pengaturan Klinik</span>
                  </Link>
                )}

                <a
                  href="#keamanan"
                  onClick={(e) => { e.preventDefault(); setUserDropdownOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <span>Keamanan Akun</span>
                </a>
              </div>

              <div className="border-t border-border/60 pt-1.5 px-1.5">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
