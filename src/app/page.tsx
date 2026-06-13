import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroBanner } from '@/components/layout/HeroBanner'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/products/ProductCard'
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Check out our latest arrivals
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View all →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed py-16 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No products available yet.</p>
          </div>
        )}
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
