"use client";

import { useState, useTransition } from "react";
import {
  Download,
  Loader2,
  Calendar,
  Building2,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import {
  exportAppointmentsCsv,
  exportVisitsCsv,
  exportInventoryCsv,
} from "@/lib/actions/reports";

export type ReportType = "appointments" | "visits" | "inventory";

interface ReportCardProps {
  type: ReportType;
  title: string;
  description: string;
  icon: LucideIcon;
  branches: { id: string; name: string }[];
  isDirectorOrSuperAdmin: boolean;
  userBranchName?: string | null;
  userBranchId?: string | null;
}

export function ReportCard({
  type,
  title,
  description,
  icon: Icon,
  branches,
  isDirectorOrSuperAdmin,
  userBranchName,
  userBranchId,
}: ReportCardProps) {
  // Default dates: first day of current WIB month to today
  const getInitialDates = () => {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const yyyy = wib.getUTCFullYear();
    const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(wib.getUTCDate()).padStart(2, "0");

    const startDateStr = `${yyyy}-${mm}-01`;
    const endDateStr = `${yyyy}-${mm}-${dd}`;
    return { startDateStr, endDateStr };
  };

  const initialDates = getInitialDates();
  const [startDate, setStartDate] = useState(initialDates.startDateStr);
  const [endDate, setEndDate] = useState(initialDates.endDateStr);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isDirectorOrSuperAdmin ? "ALL" : userBranchId ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDownload = () => {
    setError(null);

    startTransition(async () => {
      try {
        const branchParam =
          isDirectorOrSuperAdmin && selectedBranchId !== "ALL"
            ? selectedBranchId
            : undefined;

        let result: {
          ok: boolean;
          csv?: string;
          filename?: string;
          error?: string;
        };

        if (type === "appointments") {
          result = await exportAppointmentsCsv({
            branchId: branchParam,
            startDate,
            endDate,
          });
        } else if (type === "visits") {
          result = await exportVisitsCsv({
            branchId: branchParam,
            startDate,
            endDate,
          });
        } else {
          result = await exportInventoryCsv({
            branchId: branchParam,
            startDate,
            endDate,
          });
        }

        if (!result.ok || !result.csv) {
          setError(result.error ?? "Gagal mengunduh laporan CSV.");
          return;
        }

        // Trigger client-side browser download using Blob
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", result.filename ?? `laporan-${type}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan saat memproses laporan."
        );
      }
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between transition-all hover:border-border/80">
      <div>
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 space-y-3.5">
          {/* Branch Filter */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Building2 className="size-3.5 text-muted-foreground" />
              Cabang Klinik
            </label>
            {isDirectorOrSuperAdmin ? (
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              >
                <option value="ALL">Semua Cabang (Konsolidasi)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {userBranchName ?? "Cabang Anda"}
              </div>
            )}
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="size-3 text-muted-foreground" />
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Calendar className="size-3 text-muted-foreground" />
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isPending || !startDate || !endDate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Menyiapkan CSV...
            </>
          ) : (
            <>
              <Download className="size-3.5" />
              Unduh CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
}
