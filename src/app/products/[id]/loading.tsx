export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="skeleton-shimmer h-4 w-48 rounded" />
      </div>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="aspect-square skeleton-shimmer rounded-xl" />
        <div className="flex flex-col gap-4">
          <div className="skeleton-shimmer h-4 w-24 rounded" />
          <div className="skeleton-shimmer h-8 w-3/4 rounded" />
          <div className="skeleton-shimmer h-8 w-32 rounded" />
          <div className="mt-4 space-y-2">
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-full rounded" />
            <div className="skeleton-shimmer h-4 w-2/3 rounded" />
          </div>
          <div className="mt-6 skeleton-shimmer h-12 w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-16">
        <div className="skeleton-shimmer h-6 w-48 rounded mb-6" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
