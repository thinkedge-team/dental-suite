import { Zap, Building2, CreditCard } from "lucide-react";

export interface InsurancePartnerData {
  id: string;
  name: string;
  slug?: string;
  type?: "CASHLESS" | "REIMBURSEMENT";
  logoText?: string | null;
  logoUrl?: string | null;
  coverageDetails?: string | null;
  claimProcess?: string | null;
  supportedBranches?: string[];
}

interface InsuranceGridProps {
  insurances: InsurancePartnerData[];
}

export function InsuranceGrid({ insurances }: InsuranceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
      {insurances.map((partner) => {
        const isCashless = (partner.type ?? "CASHLESS") === "CASHLESS";
        const logoCode =
          partner.logoText ??
          partner.slug?.toUpperCase() ??
          partner.name.slice(0, 4).toUpperCase();
        const branches = partner.supportedBranches ?? ["Kelapa Gading", "Pluit"];
        const claimSpeedText =
          partner.claimProcess ??
          (isCashless
            ? "Verifikasi instan via EDC / Portal Asuransi"
            : "Penyelesaian berkas medis & kuitansi di hari yang sama");

        return (
          <article
            key={partner.id}
            className="flex flex-col justify-between rounded-2xl bg-card border border-border/70 p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300"
          >
            <div className="space-y-4">
              {/* Partner Header: Logo box and Claim Type Badge */}
              <div className="flex items-start justify-between gap-3">
                {/* Logo Box */}
                <div className="w-12 h-12 rounded-xl bg-muted/70 border border-border/60 flex items-center justify-center text-center p-2 shrink-0">
                  <CreditCard className="w-6 h-6 text-primary/80" />
                </div>

                {/* Claim Type Badge */}
                {isCashless ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    CASHLESS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    REIMBURSEMENT
                  </span>
                )}
              </div>

              {/* Partner Name */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  {partner.name}
                </h3>
                <span className="text-[11px] font-mono font-semibold text-muted-foreground tracking-wide">
                  ID KODE: {logoCode}
                </span>
              </div>

              {/* Claim Processing Speed Indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{claimSpeedText}</span>
              </div>
            </div>

            {/* Supported Branches Footer */}
            <div className="mt-5 pt-4 border-t border-border/60 space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Cabang yang Didukung:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {branches.map((branch) => (
                  <span
                    key={branch}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-foreground/85 font-medium"
                  >
                    {branch}
                  </span>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
