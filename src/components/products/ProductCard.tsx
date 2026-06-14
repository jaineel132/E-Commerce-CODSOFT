'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { StockBadge } from './StockBadge'
import { formatPrice } from '@/lib/utils'
import { useCartContext } from '@/context/CartContext'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCartContext()
  const isOutOfStock = product.stock_count <= 0

  const handleAddToCart = async () => {
    if (isOutOfStock || added) return
    const success = await addToCart(product.id)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {product.image_url && !imageError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {product.category}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {formatPrice(product.price)}
          </p>
          <StockBadge stockCount={product.stock_count} />
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || added}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
      </div>
    </div>
  )
}
