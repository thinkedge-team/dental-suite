import { PieChart } from "lucide-react";
import { formatRupiah } from "@/lib/intelligence/analytics";

export interface ServiceBreakdownItem {
  id: string;
  name: string;
  visitCount: number;
  revenue: number;
  percentage: number;
}

interface ServiceBreakdownProps {
  services: ServiceBreakdownItem[];
  totalRevenue: number;
}

export function ServiceBreakdown({
  services,
  totalRevenue,
}: ServiceBreakdownProps) {
  // Sorted by revenue descending
  const sortedServices = [...services].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              Distribusi Layanan Medis
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pangsa omzet dan volume tindakan per kategori perawatan gigi
            </p>
          </div>
          <span className="text-xs font-semibold text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {formatRupiah(totalRevenue)}
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {sortedServices.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Belum ada data tindakan layanan pada periode ini.
            </div>
          ) : (
            sortedServices.map((service) => (
              <div key={service.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-xs">
                      {service.name}
                    </span>
                    <span className="text-muted-foreground">
                      · {service.visitCount} tindakan
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-foreground">
                      {formatRupiah(service.revenue)}
                    </span>
                    <span className="w-11 text-right text-muted-foreground font-mono">
                      {service.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, service.percentage))}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
        <span>Total Layanan Terlayani</span>
        <span className="font-medium text-foreground">
          {services.reduce((acc, s) => acc + s.visitCount, 0)} Tindakan
        </span>
      </div>
    </div>
  );
}
