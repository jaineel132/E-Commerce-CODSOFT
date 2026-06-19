'use client'

import { useEffect } from 'react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/lib/utils'
import { History } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { EmptyState } from '@/components/ui/EmptyState'

export default function RecentlyViewedPage() {
  const { recentlyViewed, loading, fetchRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    fetchRecentlyViewed()
  }, [fetchRecentlyViewed])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-56 skeleton-shimmer rounded" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
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

  if (recentlyViewed.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No recently viewed products"
        description="Products you view will appear here for quick access."
        actionLabel="Browse Products"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Recently Viewed
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {recentlyViewed.length} product{recentlyViewed.length !== 1 ? 's' : ''} viewed
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recentlyViewed.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.product_id}`}
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
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
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-card-foreground transition-colors group-hover:text-primary">
                {item.product.name}
              </h3>
              <p className="mt-auto text-lg font-bold text-foreground">
                {formatPrice(item.product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
