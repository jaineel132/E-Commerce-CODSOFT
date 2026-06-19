'use client'

import Link from 'next/link'
import { useCartContext } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'

import { Lock } from 'lucide-react'

export function CartSummary() {
  const { cartCount, cartTotal } = useCartContext()

  const shippingThreshold = 50
  const shipping = cartTotal > shippingThreshold ? 0 : 9.99
  const tax = cartTotal * 0.08
  const total = cartTotal + shipping + tax
  const progressPercentage = Math.min((cartTotal / shippingThreshold) * 100, 100)
  const amountToFreeShipping = Math.max(shippingThreshold - cartTotal, 0)

  return (
    <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm ring-1 ring-inset ring-border/50">
      <h2 className="text-[18px] font-semibold text-foreground">
        Order Summary
      </h2>

      {amountToFreeShipping > 0 ? (
        <div className="mt-6 mb-2">
          <p className="text-[13px] font-medium text-primary mb-2">
            You&apos;re {formatPrice(amountToFreeShipping)} away from free shipping!
          </p>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6 mb-2">
          <p className="text-[13px] font-medium text-success mb-2">
            You&apos;ve unlocked free shipping!
          </p>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-success w-full" />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex justify-between text-[14px]">
          <span className="text-foreground-muted">
            Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {formatPrice(cartTotal)}
          </span>
        </div>

        <div className="flex justify-between text-[14px]">
          <span className="text-foreground-muted">Shipping</span>
          <span className="font-medium text-foreground tabular-nums">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex justify-between text-[14px]">
          <span className="text-foreground-muted">Tax (est.)</span>
          <span className="font-medium text-foreground tabular-nums">
            {formatPrice(tax)}
          </span>
        </div>

        <div className="border-t border-border pt-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-[16px] font-medium text-foreground">Total</span>
            <span className="text-[24px] font-semibold tracking-tight text-foreground tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/checkout"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-primary/25"
        >
          <Lock className="h-4 w-4" />
          Proceed to Checkout
        </Link>
      </div>

      <Link
        href="/products"
        className="mt-4 flex w-full items-center justify-center text-[14px] font-medium text-foreground-muted transition-colors hover:text-foreground"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
