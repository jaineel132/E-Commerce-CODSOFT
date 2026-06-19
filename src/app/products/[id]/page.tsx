import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductDetailStock } from '@/components/products/ProductDetailStock'
import { ProductImage } from '@/components/products/ProductImage'
import { SimilarProducts } from '@/components/products/SimilarProducts'
import { ReviewSection } from '@/components/products/ReviewSection'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import type { Product } from '@/types'

interface ProductDetailPageProps {
  params: { id: string }
}

const getProduct = cache(async (id: string) => {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('id', id)
    .single()

  if (error || !product) {
    return null
  }

  return product
})

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.name} | Verdant`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} for ${formatPrice(product.price)}`,
  }
}

async function getSimilarProducts(productId: string): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data: product } = await supabase
      .from('products')
      .select('embedding')
      .eq('id', productId)
      .single()

    if (!product?.embedding) return []

    const { data: matches } = await supabase.rpc('match_products', {
      query_embedding: product.embedding,
      match_count: 5,
      match_threshold: 0.3,
    })

    if (!matches) return []

    return matches
      .filter((m: { id: string }) => m.id !== productId)
      .slice(0, 4)
      .map((m: { id: string; name: string; description: string; price: number; image_url: string; stock_count: number }) => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        price: m.price,
        image_url: m.image_url || '',
        stock_count: m.stock_count,
        category_id: '',
        category: null,
        is_active: true,
        created_at: '',
      }))
  } catch {
    return []
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, similarProducts] = await Promise.all([
    getProduct(params.id),
    getSimilarProducts(params.id),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-[13px] font-medium text-foreground-muted">
        <Link href="/" className="inline-flex items-center rounded-full bg-secondary px-3 py-1 hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="text-border">/</span>
        <Link href="/products" className="inline-flex items-center rounded-full bg-secondary px-3 py-1 hover:text-foreground transition-colors">
          Products
        </Link>
        <span className="text-border">/</span>
        <span className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-primary ring-1 ring-inset ring-primary/20">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-card ring-1 ring-inset ring-border/50 shadow-sm">
          {product.image_url ? (
            <ProductImage
              src={product.image_url}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-foreground-muted bg-card">
              <svg className="h-24 w-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col py-6">
          <span className="mb-4 inline-flex w-fit items-center rounded-full bg-secondary px-3 py-1 text-[12px] font-medium text-foreground-muted ring-1 ring-inset ring-border/50">
            {product.category?.name ?? 'General'}
          </span>

          <h1 className="display-lg text-foreground">
            {product.name}
          </h1>

          <p className="mt-6 text-[32px] font-medium tracking-tight text-foreground tabular-nums">
            {formatPrice(product.price)}
          </p>

          <div className="mt-8">
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-foreground-muted">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <div className="mt-10">
            <ProductDetailStock productId={product.id} initialStock={product.stock_count} />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ReviewSection productId={product.id} />
      </div>

      <SimilarProducts products={similarProducts} />
    </div>
  )
}
