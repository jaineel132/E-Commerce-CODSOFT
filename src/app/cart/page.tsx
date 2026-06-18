'use client'

import { ShoppingCart } from 'lucide-react'

import { useCartContext } from '@/context/CartContext'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { EmptyState } from '@/components/ui/EmptyState'

export default function CartPage() {
  const { cartItems, loading } = useCartContext()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="skeleton-shimmer h-8 w-32 rounded" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-lg border border-border" />
            ))}
          </div>
          <div className="skeleton-shimmer h-64 rounded-lg border border-border" />
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Looks like you haven&apos;t added anything to your cart yet."
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="display-md text-foreground">
          Your Cart
        </h1>
        <p className="mt-2 text-[16px] text-foreground-muted">
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
