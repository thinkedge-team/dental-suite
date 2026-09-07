import { Calendar, Users, Clock, ArrowRight, UserPlus, FileText, CheckCircle2, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/generated/prisma";
import Link from "next/link";
import { STATUS_STYLES } from "@/lib/appointments/status";
import { getWibDayBounds, getWibMonthStart } from "@/lib/appointments/day-bounds";
import { getActiveBranchId } from "@/lib/branch-context";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  accent?: boolean;
  positive?: boolean;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ branch?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orgId = session.user.organizationId;
  const userName = session.user.name ?? "Staf";

  const { branch: branchParam } = (await searchParams) || {};
  const isDirector = session.user.role === "DIRECTOR" || session.user.role === "SUPER_ADMIN";
  const effectiveBranchId = await getActiveBranchId(branchParam, session.user.branchId, isDirector);
  const branchFilter = effectiveBranchId ? { branchId: effectiveBranchId } : {};

  const now = new Date();
  const { start: startOfToday, end: endOfToday } = getWibDayBounds(now);
  const startOfMonth = getWibMonthStart(now);

  const [
    todayAppointments,
    checkedInCount,
    newPatientsThisMonth,
    completedVisitsThisMonth,
    upcomingAppointments,
    allInventoryItems,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { organizationId: orgId, ...branchFilter, scheduledAt: { gte: startOfToday, lte: endOfToday } },
    }),
    prisma.appointment.count({
      where: { organizationId: orgId, ...branchFilter, status: { in: [AppointmentStatus.CHECKED_IN, AppointmentStatus.COMPLETED] }, scheduledAt: { gte: startOfToday, lte: endOfToday } },
    }),
    prisma.patient.count({
      where: { organizationId: orgId, deletedAt: null, createdAt: { gte: startOfMonth } },
    }),
    prisma.appointment.count({
      where: { organizationId: orgId, ...branchFilter, status: AppointmentStatus.COMPLETED, scheduledAt: { gte: startOfMonth } },
    }),
    prisma.appointment.findMany({
      where: {
        organizationId: orgId,
        ...branchFilter,
        scheduledAt: { gte: now, lte: endOfToday },
        status: { not: AppointmentStatus.CANCELLED },
      },
      include: {
        doctor: { select: { name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.inventoryItem.findMany({
      where: {
        branch: {
          organizationId: orgId,
          ...(effectiveBranchId ? { id: effectiveBranchId } : {}),
          isActive: true,
        },
      },
      include: { branch: { select: { name: true } } },
      orderBy: { stock: "asc" },
      take: 20,
    }),
  ]);

  const lowStockItems = allInventoryItems.filter(
    (item) => item.stock <= item.minStock
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Greeting Section with background image */}
      <div className="relative overflow-hidden rounded-2xl bg-foreground px-8 py-10 md:py-12 shadow-[0_2px_20px_-4px_oklch(0.15_0.01_100_/_0.15)]">
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage: 'url("/images/dashboard-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.1) brightness(0.85)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-transparent z-0" />
        
        <div className="relative z-10 max-w-2xl text-background">
          <p className="text-sm font-semibold tracking-widest uppercase opacity-80 mb-2 text-primary">Aktivitas Hari Ini</p>
          <h1 className="text-4xl md:text-5xl font-light mb-4 leading-tight tracking-tight">
            Selamat pagi, <span className="font-semibold text-white">{userName}</span>.
          </h1>
          <p className="text-background/80 text-base md:text-lg leading-relaxed max-w-lg mb-6">
            Klinik beroperasi optimal hari ini. Ada {todayAppointments} janji temu yang dijadwalkan hari ini di seluruh cabang.
          </p>
          <div className="flex gap-3">
            <Link href="/appointments" className={buttonVariants({ className: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10 px-5 shadow-sm border-0" })}>
              Lihat Jadwal Hari Ini
            </Link>
            <Link href="/patients/new" className={buttonVariants({ variant: "outline", className: "border-background/30 text-background hover:bg-background/10 h-10 px-5 bg-transparent" })}>
              <UserPlus className="mr-2 h-4 w-4" /> Pasien Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Janji" 
          value={String(todayAppointments)} 
          trend="Jadwal hari ini" 
          icon={<Calendar className="h-4 w-4 text-foreground" />} 
          positive={true}
        />
        <MetricCard 
          title="Pasien Hadir" 
          value={String(checkedInCount)} 
          trend={`${todayAppointments > 0 ? Math.round((checkedInCount / todayAppointments) * 100) : 0}% tingkat kehadiran`} 
          icon={<Users className="h-4 w-4 text-foreground" />} 
          positive={true}
        />
        <MetricCard 
          title="Pasien Baru" 
          value={String(newPatientsThisMonth)} 
          trend="Bulan ini" 
          icon={<UserPlus className="h-4 w-4 text-foreground" />} 
          positive={true}
        />
        <MetricCard 
          title="Kunjungan Selesai" 
          value={String(completedVisitsThisMonth)} 
          trend="Total bulan ini" 
          icon={<CheckCircle2 className="h-4 w-4 text-primary" />} 
          accent={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column - Schedule */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight text-foreground">Jadwal Mendatang</h2>
            <Link href="/appointments" className={buttonVariants({ variant: "ghost", className: "text-primary hover:text-primary/80 h-8 px-3 text-xs font-semibold" })}>
              Lihat Semua <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Tidak ada jadwal mendatang hari ini.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingAppointments.map((apt) => {
                  const statusStyle = STATUS_STYLES[apt.status];
                  const time = apt.scheduledAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                    hour12: false,
                  });
                  const type = apt.service ?? apt.doctor?.name ?? "Kunjungan";

                  return (
                    <div key={apt.id} className="flex items-center p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-16 shrink-0 text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {time}
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                        <p className="text-xs text-muted-foreground truncate">{type}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle.className}`}>
                        {statusStyle.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions & Alerts */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight text-foreground">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/appointments/new"
                className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-colors shadow-sm"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-semibold">Buat Janji</span>
              </Link>
              <Link
                href="/patients"
                className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-card border border-border hover:border-primary hover:text-primary transition-colors shadow-sm"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs font-semibold">Data Pasien</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Peringatan Sistem
              </h3>
              {lowStockItems.length > 0 && (
                <Link
                  href="/operate/inventory"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat Semua
                </Link>
              )}
            </div>
            
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 3).map((item) => {
                const isOutOfStock = item.stock === 0;
                return (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div
                      className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        isOutOfStock ? "bg-rose-500" : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {isOutOfStock ? `Stok Habis: ${item.name}` : `Stok Menipis: ${item.name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.branch?.name ? `Cabang ${item.branch.name}` : "Klinik"} (Sisa: {item.stock} {item.unit})
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Stok Inventaris Aman</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Seluruh stok obat & bahan medis dalam batas aman.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 items-start border-t border-border/50 pt-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Pembaruan Sistem</p>
                <p className="text-xs text-muted-foreground mt-0.5">Jadwal maintenance nanti malam pkl 02:00.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, accent, positive }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
        <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
      </div>
      <div 
        className={`text-4xl font-light tabular-nums tracking-tight mb-1 ${accent ? 'text-primary' : 'text-foreground'}`}
      >
        {value}
      </div>
      <div className="flex items-center gap-1.5">
        {positive && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <TrendingUp className="h-2.5 w-2.5" />
          </span>
        )}
        <p className="text-[11px] text-muted-foreground font-medium">{trend}</p>
      </div>
    </div>
  );
}




