export default function MarketingLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16 space-y-12">
      {/* Centered header with tag pulse */}
      <div className="mx-auto max-w-2xl text-center space-y-4 animate-pulse">
        <div className="mx-auto h-6 w-32 rounded-full bg-muted/60" />
        <div className="mx-auto h-10 w-3/4 rounded-lg bg-muted/60" />
        <div className="mx-auto h-4 w-5/6 rounded bg-muted/60" />
      </div>

      {/* Responsive 3-column card grid skeleton with image container pulse */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse flex flex-col"
          >
            {/* Image container pulse */}
            <div className="h-48 w-full bg-muted/60" />

            {/* Content area */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-muted/60" />
                  <div className="h-4 w-16 rounded bg-muted/60" />
                </div>
                <div className="h-6 w-3/4 rounded bg-muted/60" />
                <div className="h-4 w-full rounded bg-muted/60" />
                <div className="h-4 w-2/3 rounded bg-muted/60" />
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="h-5 w-28 rounded bg-muted/60" />
                <div className="h-8 w-24 rounded-lg bg-muted/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
