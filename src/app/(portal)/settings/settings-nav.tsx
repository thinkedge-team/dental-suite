"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShieldCheck, Building2, Users } from "lucide-react";

import { cn } from "@/lib/utils";

interface SettingsNavProps {
  isDirector: boolean;
}

export function SettingsNav({ isDirector }: SettingsNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/settings/profile",
      label: "Profil Saya",
      badge: "Akun",
      icon: User,
      visible: true,
    },
    {
      href: "/settings/security",
      label: "Keamanan Akun",
      badge: "Sandi & Auth",
      icon: ShieldCheck,
      visible: true,
    },
    {
      href: "/settings/organization",
      label: "Klinik & Lisensi",
      badge: "Enterprise",
      icon: Building2,
      visible: isDirector,
    },
    {
      href: "/settings/users",
      label: "Staf & Akses",
      badge: "Tim",
      icon: Users,
      visible: isDirector,
    },
  ];

  return (
    <div className="w-full">
      <nav 
        className="inline-flex p-1.5 rounded-2xl bg-muted/60 border border-border/80 shadow-xs gap-1.5 flex-wrap sm:flex-nowrap"
        aria-label="Tabs Pengaturan"
      >
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none relative group",
                  isActive
                    ? "bg-card text-foreground shadow-sm shadow-black/5 border border-border/80 ring-1 ring-black/[0.03]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
