'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Monitor, Shirt, BookOpen, Home, Loader2 } from 'lucide-react'
import type { Category } from '@/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  electronics: Monitor,
  clothing: Shirt,
  books: BookOpen,
  'home-kitchen': Home,
}

const colorPairs = [
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
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
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          Browse by Category
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Find what you&apos;re looking for
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        {categories.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          categories.map((category, i) => {
            const Icon = iconMap[category.slug] || Monitor
            const color = colorPairs[i % colorPairs.length]
            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="font-serif text-base font-medium text-foreground">
                  {category.name}
                </span>
              </Link>
            )
          })
        )}
      </div>
    </section>
  )
}
