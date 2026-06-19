'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartContext } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { AddressPicker } from '@/components/address/AddressPicker'
import { ArrowLeft, Lock, ShoppingCart } from 'lucide-react'
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
      <div className="mb-10 pb-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="display-md text-foreground">
            Checkout
          </h1>
        </div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground-muted hover:text-foreground transition-colors bg-secondary px-4 py-2 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-inset ring-border/50">
            <h2 className="mb-6 text-[18px] font-semibold text-foreground">
              Shipping Address
            </h2>
            <AddressPicker
              selectedId={addressId}
              onSelect={setAddressId}
            />
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-inset ring-border/50">
            <h2 className="mb-6 text-[18px] font-semibold text-foreground">
              Order Items
            </h2>

            <div className="divide-y divide-border">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] bg-muted ring-1 ring-inset ring-border/50">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="80px"
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
                  <div className="flex flex-1 justify-between items-start">
                    <div>
                      <p className="text-[15px] font-medium text-foreground">
                        {item.product.name}
                      </p>
                      <p className="text-[13px] text-foreground-muted mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-[15px] font-medium text-foreground tabular-nums">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-inset ring-border/50">
            <h2 className="text-[18px] font-semibold text-foreground">
              Payment Details
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-foreground-muted">Subtotal</span>
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

            {error && (
              <div className="mt-6 rounded-[12px] bg-destructive/10 p-4 text-[14px] text-destructive ring-1 ring-inset ring-destructive/20">
                {error}
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={loading || cartItems.length === 0}
              className="mt-8 relative flex w-full overflow-hidden items-center justify-center gap-2 rounded-full bg-primary px-4 py-4 text-[15px] font-medium text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 group"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Pay {formatPrice(total)}
                </>
              )}
            </button>

            <div className="mt-6 border-t border-border pt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[12px] font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
                <Lock className="h-3.5 w-3.5" />
                256-bit SSL Encrypted
              </div>
              <div className="flex gap-2 opacity-60 grayscale">
                <div className="h-6 w-10 rounded border border-border flex items-center justify-center text-[10px] font-bold">VISA</div>
                <div className="h-6 w-10 rounded border border-border flex items-center justify-center text-[10px] font-bold">MC</div>
                <div className="h-6 w-10 rounded border border-border flex items-center justify-center text-[10px] font-bold">AMEX</div>
              </div>
            </div>

            <p className="mt-6 text-center text-[12px] text-foreground-muted">
              Test mode — use card 4242 4242 4242 4242
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
