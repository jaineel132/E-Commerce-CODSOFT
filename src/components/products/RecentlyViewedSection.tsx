'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { History, ArrowRight } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/lib/utils'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useAuth } from '@/context/AuthContext'

export function RecentlyViewedSection() {
  const { user, loading: authLoading } = useAuth()
  const { recentlyViewed, loading, fetchRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    if (!authLoading && user) {
      fetchRecentlyViewed()
    }
  }, [user, authLoading, fetchRecentlyViewed])

  if (authLoading || loading || !user || recentlyViewed.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-4xl font-black uppercase tracking-tight text-foreground">
              Recently Viewed
            </h2>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Pick up where you left off
            </p>
          </div>
          <Link
            href="/recently-viewed"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold shadow-md transition-transform hover:scale-105"
          >
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {recentlyViewed.slice(0, 6).map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 60}>
            <Link
              href={`/products/${item.product_id}`}
              className="group flex flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <History className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-black leading-snug text-foreground transition-colors group-hover:text-primary">
                  {item.product.name}
                </h3>
                <p className="mt-auto pt-2 text-sm font-bold text-foreground">
                  {formatPrice(item.product.price)}
                </p>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
