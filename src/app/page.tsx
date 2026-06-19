import Link from 'next/link'
import { Suspense, lazy } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getReviewStats } from '@/lib/reviews'
import { HeroBanner } from '@/components/layout/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/products/ProductCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Product } from '@/types'
import Image from 'next/image'

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

      <ScrollReveal>
        <Suspense fallback={null}>
          <CategoryCards />
        </Suspense>
      </ScrollReveal>

      {/* Summer Sale Banner */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary overflow-hidden p-12 md:p-16 flex flex-col md:flex-row items-center justify-between">
            {/* Background elements */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <span className="text-[15rem] font-black tracking-tighter text-white select-none pointer-events-none whitespace-nowrap">
                SUMMER
              </span>
            </div>
            
            <div className="relative z-10 w-full flex flex-col md:flex-row items-center">
              <div className="text-white text-center md:text-left md:w-1/3 mb-8 md:mb-0">
                <p className="text-lg font-medium opacity-90 mb-2">20% OFF</p>
                <h2 className="text-6xl md:text-7xl font-black uppercase leading-[1.1]">
                  FINE<br />SMILE
                </h2>
                <p className="mt-4 text-sm opacity-80">15 Nov To 7 Dec</p>
              </div>
              
              <div className="relative z-20 flex-1 flex justify-center h-[300px] w-full max-w-md mx-auto my-8 md:my-0 md:-mt-24 md:-mb-24 scale-125">
                 <Image 
                   src="/headphone-removebg-preview.png" 
                   alt="Red Headphone" 
                   fill
                   className="object-contain drop-shadow-2xl"
                 />
              </div>
              
              <div className="text-white text-center md:text-left md:w-1/3 mt-8 md:mt-0 flex flex-col md:items-start items-center">
                <p className="text-sm font-medium opacity-90 mb-2">Beats Solo Air</p>
                <h3 className="text-4xl font-bold mb-4">Summer Sale</h3>
                <p className="text-sm opacity-80 mb-6 max-w-[250px]">
                  Company that&apos;s grown from 270 to 480 employees in the last 12 months.
                </p>
                <Link
                  href="/products"
                  className="inline-block rounded-full bg-white text-primary px-8 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-105"
                >
                  Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-background text-center border-t border-border mt-8">
        <ScrollReveal>
          <div className="mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tight text-foreground">
              Best Seller Products
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground max-w-2xl mx-auto">
              Shop the latest trends across Electronics, Clothing, Books, and Home & Kitchen.
            </p>
          </div>
        </ScrollReveal>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-left">
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
        
        <div className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="text-[14px] font-medium text-primary hover:text-primary-hover transition-colors"
          >
            View all products &rarr;
          </Link>
        </div>
      </section>

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

