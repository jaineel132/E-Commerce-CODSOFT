'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeStock(productId: string, initialStock: number) {
  const [stockCount, setStockCount] = useState(initialStock)

  useEffect(() => {
    setStockCount(initialStock)
  }, [initialStock])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          const newStock = (payload.new as { stock_count: number }).stock_count
          setStockCount(newStock)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId])

  return stockCount
}
