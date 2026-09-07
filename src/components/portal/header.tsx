"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LogOut, 
  Building2, 
  ChevronDown, 
  Search, 
  Bell, 
  Check, 
  Calendar,
  User,
  Settings,
  ShieldCheck,
  AlertTriangle,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPortalNotifications, type PortalNotificationItem } from "@/lib/actions/notifications";
import { setActiveBranch } from "@/lib/branch-context";

interface HeaderProps {
  organizationName: string;
  branchName?: string | null;
  role: string;
  userName?: string | null;
  branches?: Array<{ id: string; name: string }>;
  initialBranchId?: string | null;
}

export function PortalHeader({
  organizationName,
  branchName,
  role,
  userName,
  branches = [],
  initialBranchId,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDirector = role === "DIRECTOR" || role === "SUPER_ADMIN";
  
  const currentBranchParam = searchParams.get("branch") || initialBranchId;
  const activeBranch = useMemo(() => {
    if (!isDirector) return { id: undefined, name: branchName || "Cabang Utama" };
    if (!currentBranchParam || currentBranchParam === "all") return { id: undefined, name: "Semua Cabang (Konsolidasi)" };
    const found = branches.find((b) => b.id === currentBranchParam || b.name === currentBranchParam);
    return found ? found : { id: currentBranchParam, name: "Semua Cabang" };
  }, [isDirector, branchName, currentBranchParam, branches]);

  const selectedBranchName = activeBranch.name;

  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState<PortalNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

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

  // Load real notifications on mount and when navigating
  useEffect(() => {
    let mounted = true;
    getPortalNotifications()
      .then((res) => {
        if (mounted && res.ok) {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
      });

    return () => {
      mounted = false;
    };
  }, [pathname, currentBranchParam]);

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

  async function handleSelectBranch(branch?: { id: string; name: string }) {
    setBranchDropdownOpen(false);
    await setActiveBranch(branch?.id || null);
    const params = new URLSearchParams(searchParams.toString());
    if (!branch) {
      params.delete("branch");
    } else {
      params.set("branch", branch.id);
    }
    const q = params.toString();
    router.push(`${pathname}${q ? `?${q}` : ""}`);
    router.refresh();
  }

  return (
    <header className="hidden md:flex h-16 items-center justify-between border-b border-border/60 bg-card/90 backdrop-blur-md px-6 lg:px-8 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <span className="font-bold text-foreground text-sm tracking-tight">
          {organizationName}
        </span>

        <div className="h-4 w-px bg-border/80 mx-0.5" />

        {/* Branch Context Switcher */}
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
            title={isDirector ? "Ganti cabang aktif operasional" : undefined}
          >
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[140px]">{selectedBranchName}</span>
            {isDirector && branches.length > 0 && (
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", branchDropdownOpen && "rotate-180")} />
            )}
          </button>

          {branchDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                Pilih Cabang Operasional
              </div>
              <button
                type="button"
                onClick={() => handleSelectBranch(undefined)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/60 text-left transition-colors"
              >
                <span className={!currentBranchParam ? "text-primary font-semibold" : "text-foreground"}>
                  Semua Cabang (Konsolidasi)
                </span>
                {!currentBranchParam && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
              {branches.map((b) => {
                const isSelected = currentBranchParam === b.id || currentBranchParam === b.name;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBranch(b)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/60 text-left transition-colors"
                  >
                    <span className={isSelected ? "text-primary font-semibold" : "text-foreground"}>
                      Cabang {b.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Global quick search bar */}
      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Cari pasien, no. rekam medis, dokter, atau layanan..."
            className="w-full h-9 pl-9.5 pr-12 rounded-lg bg-muted/40 hover:bg-muted/60 focus:bg-card border border-border/70 focus:border-primary text-xs font-medium text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-mono text-muted-foreground pointer-events-none shadow-xs">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            aria-label="Pemberitahuan"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-bold text-foreground">Notifikasi Sistem</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUnreadCount(0)}
                    className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>

              <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Tidak ada pemberitahuan baru saat ini.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUrgent = n.urgency === "urgent";
                    const isWarning = n.urgency === "warning";

                    return (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setNotificationsOpen(false)}
                        className={cn(
                          "block p-2.5 rounded-lg border transition-colors hover:bg-muted/50",
                          isUrgent
                            ? "bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900"
                            : isWarning
                            ? "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                            : "bg-primary/5 border-primary/10"
                        )}
                      >
                        <div className="flex gap-2.5 items-start">
                          {n.type === "appointment" && <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                          {n.type === "inventory" && <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                          {n.type === "approval" && <CheckSquare className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{n.description}</p>
                            <span className="text-[9px] text-muted-foreground/70 mt-1 block font-medium">{n.timeLabel}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
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
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group cursor-pointer"
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
                <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{role.toLowerCase()} · {organizationName}</p>
              </div>

              <div className="py-1.5 px-1.5 space-y-0.5">
                <Link
                  href="/settings/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profil Pengguna</span>
                </Link>

                <Link
                  href="/settings/security"
                  onClick={() => setUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <span>Keamanan Akun</span>
                </Link>

                {isDirector && (
                  <Link
                    href="/settings/organization"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Pengaturan Klinik & Lisensi</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-border/60 pt-1.5 px-1.5">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-destructive" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
