'use client'

import { useEffect } from 'react'
import { useRealtimeStock } from '@/hooks/useRealtimeStock'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { StockBadge } from './StockBadge'
import { AddToCartButton } from './AddToCartButton'

interface ProductDetailStockProps {
  productId: string
  initialStock: number
}

export function ProductDetailStock({ productId, initialStock }: ProductDetailStockProps) {
  const stockCount = useRealtimeStock(productId, initialStock)
  const isOutOfStock = stockCount <= 0
  const { trackView } = useRecentlyViewed()

  useEffect(() => {
    trackView(productId)
  }, [productId, trackView])

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <StockBadge stockCount={stockCount} />
      </div>

      <div className="mt-8">
        <AddToCartButton productId={productId} isOutOfStock={isOutOfStock} />
      </div>

      <div className="mt-8 border-t pt-6 border-border">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Availability</dt>
            <dd className="mt-1 text-foreground">
              {isOutOfStock ? 'Out of stock' : `${stockCount} in stock`}
            </dd>
          </div>
        </dl>
      </div>
    </>
  )
}
