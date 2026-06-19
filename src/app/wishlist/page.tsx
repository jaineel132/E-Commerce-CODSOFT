'use client'

import { useWishlistContext } from '@/context/WishlistContext'
import { useCartContext } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { EmptyState } from '@/components/ui/EmptyState'

export default function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlistContext()
  const { addToCart } = useCartContext()

  const handleMoveToCart = async (productId: string) => {
    const success = await addToCart(productId)
    if (success) {
      await removeFromWishlist(productId)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-border">
          <div className="h-8 w-40 skeleton-shimmer rounded" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="aspect-square skeleton-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                <div className="h-5 w-1/3 skeleton-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save products you love to revisit them later."
        actionLabel="Browse Products"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 pb-6 border-b border-border">
        <h1 className="display-md text-foreground">
          My Wishlist
        </h1>
        <p className="mt-2 text-[16px] text-foreground-muted">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="animate-fade-in-up group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm ring-1 ring-inset ring-border/50 transition-shadow hover:shadow-md"
            >
              <Link href={`/products/${item.product_id}`} className="relative aspect-square overflow-hidden bg-muted">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-foreground-muted">
                    <svg className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Remove button overlay */}
              <button
                onClick={() => removeFromWishlist(item.product_id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground-muted hover:text-destructive hover:bg-background transition-all ring-1 ring-inset ring-border/50 shadow-sm z-10"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex flex-1 flex-col p-5">
                <Link href={`/products/${item.product_id}`}>
                  <h3 className="mb-3 line-clamp-2 text-[15px] font-medium leading-snug text-foreground transition-colors hover:text-primary">
                    {item.product.name}
                  </h3>
                </Link>
                <div className="mt-auto space-y-4">
                  <p className="text-[20px] font-semibold text-foreground tabular-nums">
                    {formatPrice(item.product.price)}
                  </p>
                  <button
                    onClick={() => handleMoveToCart(item.product_id)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-[14px] font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
