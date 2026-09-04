import { Sidebar } from "@/components/portal/sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex h-14 items-center justify-between border-b bg-card px-8 shadow-none">
          <div className="font-semibold text-foreground text-sm">
            Klinik Gigi Senyum Sehat
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Cabang:{" "}
              <strong className="text-foreground font-semibold">
                Semua Cabang
              </strong>
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}

