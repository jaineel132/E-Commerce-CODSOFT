import Link from 'next/link'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Discover Something{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Amazing
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300">
            Shop the latest trends across Electronics, Clothing, Books, and Home &amp; Kitchen.
            Quality products at unbeatable prices.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/products"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100"
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="text-sm font-semibold leading-6 text-zinc-300 hover:text-white"
            >
              Browse Catalog →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
