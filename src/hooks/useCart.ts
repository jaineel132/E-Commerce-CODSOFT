'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { CartItemWithProduct } from '@/types'

interface UseCartReturn {
  cartItems: CartItemWithProduct[]
  cartCount: number
  cartTotal: number
  loading: boolean
  fetchCart: () => Promise<void>
  addToCart: (productId: string) => Promise<boolean>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

export function useCart(): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setCartItems(data.cartItems || [])
      }
    } catch {
      console.error('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }, [])

  const addToCart = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      if (res.ok) {
        await fetchCart()
        toast.success('Added to cart')
        return true
      }
      toast.error('Failed to add to cart')
      return false
    } catch {
      toast.error('Failed to add to cart')
      return false
    }
  }, [fetchCart])

  const removeFromCart = useCallback(async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      if (res.ok) {
        await fetchCart()
        toast.success('Removed from cart')
      } else {
        toast.error('Failed to remove from cart')
      }
    } catch {
      toast.error('Failed to remove from cart')
    }
  }, [fetchCart])

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      })

      if (res.ok) {
        await fetchCart()
        toast.success('Cart updated')
      } else {
        toast.error('Failed to update cart')
      }
    } catch {
      toast.error('Failed to update cart')
    }
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    try {
      await fetch('/api/cart?all=true', { method: 'DELETE' })
      setCartItems([])
    } catch {
      console.error('Failed to clear cart')
    }
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
}
