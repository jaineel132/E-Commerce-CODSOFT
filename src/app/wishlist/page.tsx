'use client'

import { useWishlistContext } from '@/context/WishlistContext'
import { formatPrice } from '@/lib/utils'
import { Heart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlistContext()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-40 skeleton-shimmer rounded" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="aspect-square skeleton-shimmer" />
              <div className="p-4 space-y-3">
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">
            Your wishlist is empty
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Save products you love to revisit them later.
          </p>
          <Link
            href="/products"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          My Wishlist
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {wishlistItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
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
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link href={`/products/${item.product_id}`}>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-card-foreground transition-colors hover:text-primary">
                    {item.product.name}
                  </h3>
                </Link>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(item.product.price)}
                  </p>
                  <motion.button
                    onClick={() => removeFromWishlist(item.product_id)}
                    whileTap={{ scale: 0.9 }}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
