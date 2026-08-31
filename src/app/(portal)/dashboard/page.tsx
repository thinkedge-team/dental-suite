export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan aktivitas klinik hari ini.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Mock KPI Cards */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Total Janji Hari Ini</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900">24</div>
          <p className="text-xs text-slate-500">+2 dari kemarin</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Pasien Hadir</h3>
          </div>
          <div className="text-2xl font-bold text-emerald-600">18</div>
          <p className="text-xs text-slate-500">75% tingkat kehadiran</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Pasien Baru</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900">5</div>
          <p className="text-xs text-slate-500">Bulan ini: 42</p>
        </div>
         <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Pendapatan Estimasi</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900">Rp 4.2M</div>
          <p className="text-xs text-slate-500">Berdasarkan janji selesai</p>
        </div>
      </div>
    </div>
  );
}
