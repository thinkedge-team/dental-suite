export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header with Title & Switcher Skeletons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5 animate-pulse">
          <div className="h-8 w-72 rounded-lg bg-muted/60" />
          <div className="h-4 w-96 rounded bg-muted/60" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 animate-pulse">
          <div className="h-8 w-36 rounded-lg bg-muted/60" />
          <div className="h-8 w-64 rounded-lg bg-muted/60" />
        </div>
      </div>

      {/* 4 KPI metric cards pulse boxes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-muted/60" />
              <div className="size-8 rounded-lg bg-muted/60" />
            </div>
            <div className="h-8 w-36 rounded-md bg-muted/60" />
            <div className="h-3.5 w-44 rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Large rounded rectangular chart box with pulsing gradient shimmer */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 animate-pulse">
          <div className="space-y-1.5">
            <div className="h-5 w-48 rounded bg-muted/60" />
            <div className="h-3.5 w-64 rounded bg-muted/60" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded bg-muted/60" />
            <div className="h-7 w-20 rounded bg-muted/60" />
          </div>
        </div>

        {/* Pulsing gradient shimmer chart canvas */}
        <div className="relative h-64 w-full rounded-lg bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-pulse flex items-end justify-between px-6 pb-4 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-full rounded-t bg-muted/80"
              style={{
                height: `${25 + ((i * 17 + 11) % 65)}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Dual-column table skeleton for doctor rankings and service share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Doctor Ranking Skeleton */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-5 w-40 rounded bg-muted/60" />
            <div className="h-4 w-24 rounded bg-muted/60" />
          </div>
          <div className="divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted/60 shrink-0" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 rounded bg-muted/60" />
                    <div className="h-3 w-20 rounded bg-muted/60" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-24 rounded bg-muted/60" />
                  <div className="h-3 w-16 rounded bg-muted/60" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Share Breakdown Skeleton */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-5 w-44 rounded bg-muted/60" />
            <div className="h-4 w-20 rounded bg-muted/60" />
          </div>
          <div className="space-y-4 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-36 rounded bg-muted/60" />
                  <div className="h-3.5 w-20 rounded bg-muted/60" />
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
