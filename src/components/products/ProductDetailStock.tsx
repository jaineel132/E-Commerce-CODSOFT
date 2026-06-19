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
    <div className="flex flex-col gap-6 rounded-[20px] bg-card p-6 ring-1 ring-inset ring-border/50 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-foreground">Availability</span>
        <StockBadge stockCount={stockCount} />
      </div>

      <AddToCartButton productId={productId} isOutOfStock={isOutOfStock} />
    </div>
  )
}
