'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'
import type { CartItemWithProduct } from '@/types'

interface CartContextValue {
  cartItems: CartItemWithProduct[]
  cartCount: number
  cartTotal: number
  loading: boolean
  addToCart: (productId: string) => Promise<boolean>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue>({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  loading: false,
  addToCart: async () => false,
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const cart = useCart()

  useEffect(() => {
    if (!authLoading && user) {
      cart.fetchCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  return useContext(CartContext)
}
