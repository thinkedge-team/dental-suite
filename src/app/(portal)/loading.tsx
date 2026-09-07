export default function PortalLoading() {
  return (
    <div className="space-y-8 pb-10">
      {/* Pulsing greeting card header placeholder */}
      <div className="relative overflow-hidden rounded-2xl bg-muted/60 px-8 py-10 md:py-12 shadow-[0_2px_20px_-4px_oklch(0.15_0.01_100_/_0.15)] animate-pulse">
        <div className="max-w-2xl space-y-4">
          <div className="h-4 w-36 rounded bg-muted/80" />
          <div className="h-10 w-80 rounded-lg bg-muted/80" />
          <div className="h-5 w-full max-w-lg rounded bg-muted/80" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-40 rounded-md bg-muted/80" />
            <div className="h-10 w-36 rounded-md bg-muted/80" />
          </div>
        </div>
      </div>

      {/* 4-card metric grid skeleton matching dashboard layout */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="h-3.5 w-24 rounded bg-muted/60 animate-pulse" />
              <div className="size-8 rounded-lg bg-muted/60 animate-pulse" />
            </div>
            <div className="h-9 w-20 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Pulsing schedule table placeholder with 5 row bars */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-44 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center p-4 gap-4 animate-pulse">
                <div className="w-16 shrink-0 h-4 rounded bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-muted/60" />
                  <div className="h-3 w-32 rounded bg-muted/60" />
                </div>
                <div className="h-5 w-20 rounded-full bg-muted/60 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Actions & Alerts Skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-6 w-28 rounded-md bg-muted/60 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-xl bg-card border border-border animate-pulse flex flex-col items-center justify-center gap-2">
                <div className="size-5 rounded bg-muted/60" />
                <div className="h-3 w-16 rounded bg-muted/60" />
              </div>
              <div className="h-20 rounded-xl bg-card border border-border animate-pulse flex flex-col items-center justify-center gap-2">
                <div className="size-5 rounded bg-muted/60" />
                <div className="h-3 w-16 rounded bg-muted/60" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex gap-3 items-start animate-pulse">
                <div className="size-2 mt-1.5 rounded-full bg-muted/60 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-40 rounded bg-muted/60" />
                  <div className="h-3 w-28 rounded bg-muted/60" />
                </div>
              </div>
              <div className="flex gap-3 items-start animate-pulse">
                <div className="size-2 mt-1.5 rounded-full bg-muted/60 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-44 rounded bg-muted/60" />
                  <div className="h-3 w-32 rounded bg-muted/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
