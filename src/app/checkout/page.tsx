'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartContext } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { AddressPicker } from '@/components/address/AddressPicker'
import { CreditCard, ArrowLeft, Lock, ShoppingCart } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function CheckoutPage() {
  const { cartItems, cartTotal, loading: cartLoading } = useCartContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addressId, setAddressId] = useState<string | null>(null)

  const shipping = cartTotal > 50 ? 0 : 9.99
  const tax = cartTotal * 0.08
  const total = cartTotal + shipping + tax

  const handlePayNow = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: addressId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create checkout session')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="skeleton-shimmer h-8 w-40 rounded" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="skeleton-shimmer h-64 rounded-xl border border-border" />
          </div>
          <div className="lg:col-span-1">
            <div className="skeleton-shimmer h-80 rounded-xl border border-border" />
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0 && !loading) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Add some items to your cart before checking out."
        actionLabel="Browse Products"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/cart"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Checkout
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <AddressPicker
              selectedId={addressId}
              onSelect={setAddressId}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">
              Order Summary
            </h2>

            <div className="divide-y divide-border">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Payment Details
            </h2>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
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

            {error && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={loading || cartItems.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {formatPrice(total)}
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Secure checkout powered by Stripe
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Test mode — use card 4242 4242 4242 4242
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
