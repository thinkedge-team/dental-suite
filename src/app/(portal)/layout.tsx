import { Sidebar } from "@/components/portal/sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm z-10">
            <div className="font-semibold text-slate-800">
                Klinik Gigi Senyum Sehat
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">Cabang: <strong className="text-slate-800">Semua Cabang</strong></span>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
}
