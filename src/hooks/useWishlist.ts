'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { WishlistItemWithProduct } from '@/types'

interface UseWishlistReturn {
  wishlistItems: WishlistItemWithProduct[]
  loading: boolean
  fetchWishlist: () => Promise<void>
  addToWishlist: (productId: string) => Promise<boolean>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

export function useWishlist(): UseWishlistReturn {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/wishlist')
      if (res.ok) {
        const data = await res.json()
        setWishlistItems(data.wishlistItems || [])
      }
    } catch {
      console.error('Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }, [])

  const addToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      if (res.ok) {
        await fetchWishlist()
        toast.success('Added to wishlist')
        return true
      }
      toast.error('Failed to add to wishlist')
      return false
    } catch {
      toast.error('Failed to add to wishlist')
      return false
    }
  }, [fetchWishlist])

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      if (res.ok) {
        await fetchWishlist()
        toast.success('Removed from wishlist')
      } else {
        toast.error('Failed to remove from wishlist')
      }
    } catch {
      toast.error('Failed to remove from wishlist')
    }
  }, [fetchWishlist])

  const isInWishlist = useCallback(
    (productId: string) => wishlistItems.some((item) => item.product_id === productId),
    [wishlistItems],
  )

  return {
    wishlistItems,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }
}
