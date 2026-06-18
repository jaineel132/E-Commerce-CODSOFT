import Link from 'next/link'
import { Suspense, lazy } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getReviewStats } from '@/lib/reviews'
import { HeroBanner } from '@/components/layout/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/products/ProductCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Product } from '@/types'

const CategoryCards = lazy(() => import('@/components/layout/CategoryCards').then(m => ({ default: m.CategoryCards })))
const WhyShopSection = lazy(() => import('@/components/layout/WhyShopSection').then(m => ({ default: m.WhyShopSection })))
const RecentlyViewedSection = lazy(() => import('@/components/products/RecentlyViewedSection').then(m => ({ default: m.RecentlyViewedSection })))

async function getFeaturedProducts() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return (products || []) as Product[]
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
  const productIds = featuredProducts.map((p) => p.id)
  const ratingStats = await getReviewStats(productIds)

  return (
    <div className="flex min-h-screen flex-col">
      <HeroBanner />

      <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 bg-background">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10 border-b border-border pb-6">
            <div>
              <h2 className="display-md text-foreground">
                Featured Products
              </h2>
              <p className="mt-2 text-[16px] text-foreground-muted">
                Our latest arrivals and most popular choices
              </p>
            </div>
            <Link
              href="/products"
              className="text-[14px] font-medium text-primary hover:text-primary-hover transition-colors hidden sm:block"
            >
              View all products &rarr;
            </Link>
          </div>
        </ScrollReveal>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 80}>
                <ProductCard product={product} priority={i === 0} ratingStats={ratingStats.get(product.id)} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 border-border">
            <p className="text-sm text-muted-foreground">No products available yet.</p>
          </div>
        )}
        
        <div className="mt-8 sm:hidden flex justify-center">
          <Link
            href="/products"
            className="text-[14px] font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View all products &rarr;
          </Link>
        </div>
      </section>

      <ScrollReveal>
        <Suspense fallback={null}>
          <CategoryCards />
        </Suspense>
      </ScrollReveal>

      <Suspense fallback={null}>
        <RecentlyViewedSection />
      </Suspense>

      <ScrollReveal>
        <Suspense fallback={null}>
          <WhyShopSection />
        </Suspense>
      </ScrollReveal>

      <div className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-foreground-muted mb-8">
            Trusted by modern teams and shoppers worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale">
            {/* Simple geometric shapes mimicking logos for now since we don't have actual logos */}
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rounded bg-foreground"></div> ACME Corp</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rounded-full border-4 border-foreground"></div> Globalia</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-0 w-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-foreground"></div> Apex</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rotate-45 bg-foreground"></div> Vertex</div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
