export default function InventoryLoading() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Branch Selector Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-pulse">
        <div className="space-y-1.5">
          <div className="h-8 w-48 rounded-lg bg-muted/60" />
          <div className="h-3.5 w-80 rounded bg-muted/60" />
        </div>
        <div className="h-9 w-52 rounded-xl bg-muted/60" />
      </div>

      {/* 4 KPI bar metric pulse boxes */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-2 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-muted/60" />
              <div className="size-7 rounded-lg bg-muted/60" />
            </div>
            <div className="h-7 w-16 rounded bg-muted/60" />
            <div className="h-2.5 w-24 rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Search input pulse box & action button */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-pulse">
          <div className="h-9 w-full max-w-md rounded-lg bg-muted/60" />
          <div className="h-9 w-36 rounded-lg bg-muted/60 shrink-0" />
        </div>

        {/* Category tabs shimmer bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/70 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-28 rounded-lg bg-muted/60 shrink-0" />
          ))}
        </div>

        {/* Table skeleton with 6 pulsing row placeholders */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20 animate-pulse">
            <div className="h-3.5 w-32 rounded bg-muted/60" />
            <div className="h-3.5 w-20 rounded bg-muted/60" />
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-3.5 w-20 rounded bg-muted/60" />
            <div className="h-3.5 w-24 rounded bg-muted/60" />
          </div>

          {/* 6 pulsing row placeholders */}
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 gap-4 animate-pulse"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-8 rounded-lg bg-muted/60 shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-4 w-44 rounded bg-muted/60" />
                    <div className="h-3 w-28 rounded bg-muted/60" />
                  </div>
                </div>
                <div className="h-5 w-24 rounded-full bg-muted/60 shrink-0 hidden sm:block" />
                <div className="h-4 w-16 rounded bg-muted/60 shrink-0 text-center" />
                <div className="h-5 w-20 rounded-full bg-muted/60 shrink-0 hidden md:block" />
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-7 w-16 rounded-md bg-muted/60" />
                  <div className="h-7 w-7 rounded-md bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
