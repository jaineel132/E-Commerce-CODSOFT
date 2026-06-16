import { createClient } from '@/lib/supabase/server'
import { ProductList } from '@/components/products/ProductList'
import { ProductFilter } from '@/components/products/ProductFilter'
import type { Product } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | Verdant',
  description: 'Browse our collection of products across Electronics, Clothing, Books, and Home & Kitchen.',
}

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
    .eq('is_active', true)

  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''

  if (category) {
    query = query.eq('category', category)
  }

  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice))
  }

  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice))
  }

  const { data: products, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (products || []) as Product[]
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts(searchParams)
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''
  const filterKey = `${category}-${minPrice}-${maxPrice}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          All Products
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search with AI or browse with filters
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-64 lg:shrink-0">
          <div className="sticky top-24 rounded-xl bg-card border border-border p-4 shadow-sm">
            <ProductFilter />
          </div>
        </aside>

        <div className="flex-1">
          <ProductList key={filterKey} initialProducts={products} initialQuery={q} />
        </div>
      </div>
    </div>
  )
}
