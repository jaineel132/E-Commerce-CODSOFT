import Link from 'next/link'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <svg
          className="h-full w-full"
          viewBox="0 0 800 600"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1.5" fill="currentColor" />
              <path d="M0 0L16 0L0 16Z" fill="currentColor" />
              <path d="M80 80L64 80L80 64Z" fill="currentColor" />
              <rect x="38" y="38" width="4" height="4" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#geo)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tighter md:text-6xl lg:text-7xl">
            Discover Something{' '}
            <span className="text-accent">Amazing</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
            Shop the latest trends across Electronics, Clothing, Books, and Home
            &amp; Kitchen. Quality products at unbeatable prices.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/products"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="text-sm font-semibold leading-6 text-white/70 hover:text-white"
            >
              Browse Catalog →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
