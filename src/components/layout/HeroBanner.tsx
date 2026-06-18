'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-mesh border-b border-border">
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="animate-fade-in-up delay-100 mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
            <Star className="mr-2 h-4 w-4 fill-primary" />
            <span>Discover the new Verdant collection</span>
          </div>
          
          <h1 className="animate-fade-in-up delay-200 display-hero text-foreground">
            Thoughtfully curated for your <br className="hidden md:block" />
            <span className="text-primary font-medium">modern lifestyle</span>
          </h1>
          
          <p className="animate-fade-in-up delay-300 mt-6 max-w-2xl text-lg leading-relaxed text-foreground-secondary">
            Shop the latest trends across Electronics, Clothing, Books, and Home
            &amp; Kitchen. Experience quality products at unbeatable prices.
          </p>
          
          <div className="animate-fade-in-up delay-400 mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/products"
              className="group flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-[15px] font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 w-full sm:w-auto"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center rounded-full bg-background/50 px-8 py-3.5 text-[15px] font-medium text-foreground ring-1 ring-inset ring-border backdrop-blur-sm transition-all hover:bg-background/80 w-full sm:w-auto"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </div>
      
      {/* Trust Indicator Strip */}
      <div className="border-t border-border/50 bg-background/40 backdrop-blur-md hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 md:gap-16 text-sm font-medium text-foreground-muted">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              Fast Shipping
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Secure Checkout
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent"></div>
              Curated Selection
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
