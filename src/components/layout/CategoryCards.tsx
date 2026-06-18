'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Monitor, Shirt, BookOpen, Home, Loader2, ArrowRight } from 'lucide-react'
import type { Category } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electronics: Monitor,
  clothing: Shirt,
  books: BookOpen,
  'home-kitchen': Home,
}

const colorPairs = [
  'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/30 text-blue-600 dark:text-blue-400',
  'bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-800/30 text-orange-600 dark:text-orange-400',
  'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400',
  'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800/30 text-purple-600 dark:text-purple-400',
]

export function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {})
  }, [])

  return (
    <section className="bg-secondary/50 py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="display-md text-foreground">
            Browse by Category
          </h2>
          <p className="mt-3 text-[16px] text-foreground-muted max-w-2xl">
            Find exactly what you're looking for by exploring our curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            categories.map((category, i) => {
              const Icon = iconMap[category.slug] || Monitor
              const colorClass = colorPairs[i % colorPairs.length]
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[20px] border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/80 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-12">
                    <h3 className="heading-md text-foreground">
                      {category.name}
                    </h3>
                    <p className="mt-1.5 text-[14px] font-medium text-foreground-muted group-hover:text-foreground transition-colors">
                      Explore collection &rarr;
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
