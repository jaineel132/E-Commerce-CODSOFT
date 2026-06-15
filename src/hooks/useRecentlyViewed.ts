'use client'

import { useState, useCallback } from 'react'
import type { RecentlyViewedWithProduct } from '@/types'

interface UseRecentlyViewedReturn {
  recentlyViewed: RecentlyViewedWithProduct[]
  loading: boolean
  fetchRecentlyViewed: () => Promise<void>
  trackView: (productId: string) => Promise<void>
}

export function useRecentlyViewed(): UseRecentlyViewedReturn {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedWithProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecentlyViewed = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/recently-viewed')
      if (res.ok) {
        const data = await res.json()
        setRecentlyViewed(data.recentlyViewed || [])
      }
    } catch {
      console.error('Failed to fetch recently viewed')
    } finally {
      setLoading(false)
    }
  }, [])

  const trackView = useCallback(async (productId: string) => {
    try {
      await fetch('/api/recently-viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
    } catch {
      console.error('Failed to track view')
    }
  }, [])

  return {
    recentlyViewed,
    loading,
    fetchRecentlyViewed,
    trackView,
  }
}
