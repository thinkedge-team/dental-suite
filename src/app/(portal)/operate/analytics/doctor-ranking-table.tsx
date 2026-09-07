import { Stethoscope } from "lucide-react";
import { formatRupiah } from "@/lib/intelligence/analytics";

export interface DoctorRankingItem {
  id: string;
  name: string;
  specialty: string | null;
  branchName: string;
  visitCount: number;
  totalRevenue: number;
  avgRevenuePerVisit: number;
}

interface DoctorRankingTableProps {
  doctors: DoctorRankingItem[];
}

export function DoctorRankingTable({ doctors }: DoctorRankingTableProps) {
  // Sorted by total revenue descending
  const sortedDoctors = [...doctors].sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Stethoscope className="size-4 text-primary" />
            Peringkat Dokter & Kontribusi
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Performa dokter gigi berdasarkan volume tindakan dan total omzet
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {sortedDoctors.length} Dokter
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-2 text-center w-10">#</th>
              <th className="py-3 px-3">Nama Dokter & Spesialisasi</th>
              <th className="py-3 px-3">Cabang</th>
              <th className="py-3 px-3 text-right">Kunjungan</th>
              <th className="py-3 px-3 text-right">Total Kontribusi</th>
              <th className="py-3 px-3 text-right">Rata-rata/Pasien</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sortedDoctors.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Belum ada data tindakan dokter pada periode ini.
                </td>
              </tr>
            ) : (
              sortedDoctors.map((doc, idx) => (
                <tr
                  key={doc.id}
                  className="transition-colors hover:bg-muted/40 group"
                >
                  <td className="py-3.5 px-2 text-center text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {doc.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {doc.specialty ?? "Dokter Gigi Umum"}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-muted-foreground">
                    {doc.branchName}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-foreground">
                    {doc.visitCount}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-foreground">
                    {formatRupiah(doc.totalRevenue)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-xs text-muted-foreground">
                    {formatRupiah(doc.avgRevenuePerVisit)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
