'use client'

import { useRealtimeStock } from '@/hooks/useRealtimeStock'
import { StockBadge } from './StockBadge'

interface ProductStockProps {
  productId: string
  initialStock: number
}

export function ProductStock({ productId, initialStock }: ProductStockProps) {
  const stockCount = useRealtimeStock(productId, initialStock)

  return <StockBadge stockCount={stockCount} />
}
