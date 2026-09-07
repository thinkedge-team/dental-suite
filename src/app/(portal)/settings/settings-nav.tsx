"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShieldCheck, Building2 } from "lucide-react";

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
      icon: User,
      visible: true,
    },
    {
      href: "/settings/security",
      label: "Keamanan Akun",
      icon: ShieldCheck,
      visible: true,
    },
    {
      href: "/settings/organization",
      label: "Klinik & Lisensi",
      icon: Building2,
      visible: isDirector,
    },
  ];

  return (
    <div className="border-b border-border/80">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs Pengaturan">
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
                  "inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
