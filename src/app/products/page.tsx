import { createClient } from '@/lib/supabase/server'
import { ProductList } from '@/components/products/ProductList'
import { ProductFilter } from '@/components/products/ProductFilter'
import { getReviewStats } from '@/lib/reviews'
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

  const categorySlug = typeof searchParams.category === 'string' ? searchParams.category : ''
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''
  const page = Math.max(1, parseInt(typeof searchParams.page === 'string' ? searchParams.page : '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(typeof searchParams.limit === 'string' ? searchParams.limit : '20', 10)))
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : 'created_at'
  const sortOrder = typeof searchParams.sortOrder === 'string' ? searchParams.sortOrder : 'desc'

  let countQuery = supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)
  let dataQuery = supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('is_active', true)

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) {
      countQuery = countQuery.eq('category_id', cat.id)
      dataQuery = dataQuery.eq('category_id', cat.id)
    }
  }

  if (minPrice) {
    countQuery = countQuery.gte('price', parseFloat(minPrice))
    dataQuery = dataQuery.gte('price', parseFloat(minPrice))
  }

  if (maxPrice) {
    countQuery = countQuery.lte('price', parseFloat(maxPrice))
    dataQuery = dataQuery.lte('price', parseFloat(maxPrice))
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const allowedSorts = ['created_at', 'price', 'name']
  const actualSortBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at'

  const [{ count, error: countError }, { data: products, error }] = await Promise.all([
    countQuery,
    dataQuery.order(actualSortBy, { ascending: sortOrder === 'asc' }).range(from, to),
  ])

  if (countError) {
    console.error('Error counting products:', countError)
    return { products: [], total: 0, page: 1, limit, totalPages: 0 }
  }

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0, page: 1, limit, totalPages: 0 }
  }

  const total = count ?? 0

  return {
    products: (products || []) as Product[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, total, page, totalPages } = await getProducts(searchParams)
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : ''
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : ''
  const filterKey = `${category}-${minPrice}-${maxPrice}-${page}`

  // Fetch review stats for all displayed products in one query
  const productIds = products.map((p) => p.id)
  const ratingStats = await getReviewStats(productIds)

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
          <ProductList
            key={filterKey}
            initialProducts={products}
            initialQuery={q}
            total={total}
            page={page}
            totalPages={totalPages}
            initialReviewStats={ratingStats}
          />
        </div>
      </div>
    </div>
  )
}
