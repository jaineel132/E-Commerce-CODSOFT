'use client'

import Link from 'next/link'
import Image from 'next/image'
import { memo, useState } from 'react'

import { ShoppingCart, Check } from 'lucide-react'
import { StockBadge } from './StockBadge'
import { ReviewBadge } from './ReviewBadge'
import { FlyToCart } from '@/components/ui/FlyToCart'
import { formatPrice } from '@/lib/utils'
import { useRealtimeStock } from '@/hooks/useRealtimeStock'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  priority?: boolean
  ratingStats?: { averageRating: number; totalReviews: number }
}

export const ProductCard = memo(function ProductCard({ product, priority, ratingStats }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [added, setAdded] = useState(false)
  const stockCount = useRealtimeStock(product.id, product.stock_count)
  const isOutOfStock = stockCount <= 0

  const handleAddComplete = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
          {product.category?.name ?? ''}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 mb-2">
          <ReviewBadge
            productId={product.id}
            rating={ratingStats?.averageRating}
            reviewCount={ratingStats?.totalReviews}
          />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
            {formatPrice(product.price)}
          </p>
          <StockBadge stockCount={stockCount} />
        </div>
        <FlyToCart
          product={{ id: product.id, name: product.name, image_url: product.image_url, price: product.price }}
          isOutOfStock={isOutOfStock || added}
          onAdd={handleAddComplete}
          className="mt-3"
        >
          <button
            disabled={isOutOfStock || added}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${
              added
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </button>
        </FlyToCart>
      </div>
    </div>
  )
})
