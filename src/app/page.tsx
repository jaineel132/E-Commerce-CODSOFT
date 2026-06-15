import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroBanner } from '@/components/layout/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/products/ProductCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { CategoryCards } from '@/components/layout/CategoryCards'
import { WhyShopSection } from '@/components/layout/WhyShopSection'
import type { Product } from '@/types'

async function getFeaturedProducts() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
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

  return (
    <div className="flex min-h-screen flex-col">
      <HeroBanner />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                Featured Products
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Check out our latest arrivals
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              View all →
            </Link>
          </div>
        </ScrollReveal>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 80}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 border-border">
            <p className="text-sm text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </section>

      <ScrollReveal>
        <CategoryCards />
      </ScrollReveal>

      <ScrollReveal>
        <WhyShopSection />
      </ScrollReveal>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
