import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductDetailStock } from '@/components/products/ProductDetailStock'
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
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
          <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {product.category}
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-bold text-foreground">
            {formatPrice(product.price)}
          </p>

          <div className="mt-6 border-t pt-6 border-border">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          <ProductDetailStock productId={product.id} initialStock={product.stock_count} />

          <div className="mt-8 border-t pt-6 border-border">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="mt-1 text-foreground">{product.category}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
