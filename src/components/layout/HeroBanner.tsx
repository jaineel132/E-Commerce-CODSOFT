'use client'

import Link from 'next/link'

export function HeroBanner() {
  return (
    <section className="animate-fade-in relative overflow-hidden bg-primary text-primary-foreground">
      <div
        className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-15 animate-gradient-blob"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="animate-fade-in-up delay-200 font-serif text-5xl font-bold tracking-tighter md:text-6xl lg:text-7xl">
            Discover Something{' '}
            <span className="text-accent">Amazing</span>
          </h1>
          <p className="animate-fade-in-up delay-400 mt-6 text-lg leading-8 text-primary-foreground/80">
            Shop the latest trends across Electronics, Clothing, Books, and Home
            &amp; Kitchen. Quality products at unbeatable prices.
          </p>
          <div className="animate-fade-in-up delay-600 mt-10 flex items-center gap-x-6">
            <Link
              href="/products"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="text-sm font-semibold leading-6 text-primary-foreground/70 hover:text-primary-foreground"
            >
              Browse Catalog →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
