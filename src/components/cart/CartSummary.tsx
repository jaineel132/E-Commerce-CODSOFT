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
    <div className="rounded-lg border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Order Summary
      </h2>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatPrice(cartTotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Tax (est.)</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatPrice(tax)}
          </span>
        </div>

        <div className="border-t pt-3 dark:border-zinc-800">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Total</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {shipping > 0 && (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Free shipping on orders over $50
        </p>
      )}

      <Link
        href="/checkout"
        className="mt-6 flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/products"
        className="mt-3 flex w-full items-center justify-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
