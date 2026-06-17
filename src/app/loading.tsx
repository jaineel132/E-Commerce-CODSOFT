export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="skeleton-shimmer h-12 w-3/4 rounded-lg" />
          <div className="mt-4 skeleton-shimmer h-6 w-1/2 rounded-lg" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="aspect-square skeleton-shimmer" />
              <div className="space-y-3 p-4">
                <div className="skeleton-shimmer h-3 w-16 rounded" />
                <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                <div className="skeleton-shimmer h-5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
