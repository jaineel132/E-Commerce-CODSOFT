'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/context/AuthContext'
import type { WishlistItemWithProduct } from '@/types'

interface WishlistContextValue {
  wishlistItems: WishlistItemWithProduct[]
  loading: boolean
  fetchWishlist: () => Promise<void>
  addToWishlist: (productId: string) => Promise<boolean>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlistItems: [],
  loading: false,
  fetchWishlist: async () => {},
  addToWishlist: async () => false,
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const wishlist = useWishlist()

  useEffect(() => {
    if (!authLoading && user) {
      wishlist.fetchWishlist()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  return (
    <WishlistContext.Provider value={wishlist}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlistContext() {
  return useContext(WishlistContext)
}
