import { Calendar, Users, TrendingUp, Clock, ArrowRight, UserPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  accent?: boolean;
  positive?: boolean;
}

const UPCOMING_APPOINTMENTS = [
  { id: "apt-1", time: "09:00", name: "Sarah Wijaya", type: "Pembersihan Gigi", status: "Menunggu", color: "bg-amber-100 text-amber-800" },
  { id: "apt-2", time: "09:45", name: "Budi Santoso", type: "Konsultasi Implant", status: "Diperiksa", color: "bg-orange-100 text-orange-800" },
  { id: "apt-3", time: "10:30", name: "Rina Kartika", type: "Penambalan", status: "Terkonfirmasi", color: "bg-emerald-100 text-emerald-800" },
  { id: "apt-4", time: "11:15", name: "Anton Prabowo", type: "Cabut Gigi", status: "Terkonfirmasi", color: "bg-emerald-100 text-emerald-800" },
];

export default function DashboardPage() {
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
            Selamat pagi, <span className="font-semibold text-white">Dr. Budi</span>.
          </h1>
          <p className="text-background/80 text-base md:text-lg leading-relaxed max-w-lg mb-6">
            Klinik beroperasi optimal hari ini. Ada 24 janji temu yang dijadwalkan di seluruh cabang.
          </p>
          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10 px-5 shadow-sm border-0">
              Lihat Jadwal Hari Ini
            </Button>
            <Button variant="outline" className="border-background/30 text-background hover:bg-background/10 h-10 px-5 bg-transparent">
              <UserPlus className="mr-2 h-4 w-4" /> Pasien Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Janji" 
          value="24" 
          trend="+2 dari kemarin" 
          icon={<Calendar className="h-4 w-4 text-foreground" />} 
          positive={true}
        />
        <MetricCard 
          title="Pasien Hadir" 
          value="18" 
          trend="75% tingkat kehadiran" 
          icon={<Users className="h-4 w-4 text-foreground" />} 
          positive={true}
        />
        <MetricCard 
          title="Pasien Baru" 
          value="5" 
          trend="Bulan ini: 42" 
          icon={<UserPlus className="h-4 w-4 text-foreground" />} 
          positive={true}
        />
        <MetricCard 
          title="Pendapatan Estimasi" 
          value="Rp4,2M" 
          trend="Berdasarkan janji selesai" 
          icon={<TrendingUp className="h-4 w-4 text-primary" />} 
          accent={true}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column - Schedule */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight text-foreground">Jadwal Mendatang</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80 h-8 px-3 text-xs font-semibold">Lihat Semua <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </div>
          
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {UPCOMING_APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="flex items-center p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-16 shrink-0 text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {apt.time}
                  </div>
                  <div className="flex-1 min-w-0 px-4">
                    <p className="text-sm font-medium text-foreground truncate">{apt.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{apt.type}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${apt.color}`}>
                    {apt.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Alerts */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium tracking-tight text-foreground">Aksi Cepat</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-2 bg-card border-border hover:border-primary hover:text-primary transition-colors shadow-sm">
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-semibold">Buat Janji</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-card border-border hover:border-primary hover:text-primary transition-colors shadow-sm">
                <FileText className="h-5 w-5" />
                <span className="text-xs font-semibold">Rekam Medis</span>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Peringatan Sistem</h3>
            
            <div className="flex gap-3 items-start">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Stok Anestesi Menipis</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cabang Kelapa Gading (Sisa: 12 vial)</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
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




