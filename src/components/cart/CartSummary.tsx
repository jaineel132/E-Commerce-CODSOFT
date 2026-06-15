'use client'

import Link from 'next/link'
import { useCartContext } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

export function CartSummary() {
  const { cartCount, cartTotal } = useCartContext()

  const shipping = cartTotal > 50 ? 0 : 9.99
  const tax = cartTotal * 0.08
  const total = cartTotal + shipping + tax

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground">
        Order Summary
      </h2>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </span>
          <span className="font-medium text-card-foreground">
            {formatPrice(cartTotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-card-foreground">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (est.)</span>
          <span className="font-medium text-card-foreground">
            {formatPrice(tax)}
          </span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="flex justify-between">
            <span className="text-base font-bold text-foreground">Total</span>
            <span className="text-base font-bold text-foreground">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {shipping > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Free shipping on orders over $50
        </p>
      )}

      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/products"
        className="mt-3 flex w-full items-center justify-center text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-foreground"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
