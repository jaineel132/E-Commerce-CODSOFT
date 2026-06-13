import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StockBadge } from '@/components/products/StockBadge'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

interface ProductDetailPageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
    .eq('id', id)
    .single()

  if (error || !product) {
    return null
  }

  return product
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.name} | E-Commerce Store`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} for ${formatPrice(product.price)}`,
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const isOutOfStock = product.stock_count <= 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {product.category}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatPrice(product.price)}
            </p>
            <StockBadge stockCount={product.stock_count} />
          </div>

          <div className="mt-6 border-t pt-6 dark:border-zinc-800">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              Description
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              disabled={isOutOfStock}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Add to Wishlist
            </button>
          </div>

          <div className="mt-8 border-t pt-6 dark:border-zinc-800">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">Category</dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{product.category}</dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">Availability</dt>
                <dd className="mt-1 text-zinc-900 dark:text-zinc-100">
                  {isOutOfStock ? 'Out of stock' : `${product.stock_count} in stock`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
