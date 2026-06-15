'use client'

import Link from 'next/link'
import { Monitor, Shirt, BookOpen, Home } from 'lucide-react'

const categories = [
  { name: 'Electronics', slug: 'Electronics', icon: Monitor, color: 'bg-primary/10 text-primary' },
  { name: 'Clothing', slug: 'Clothing', icon: Shirt, color: 'bg-accent/10 text-accent' },
  { name: 'Books', slug: 'Books', icon: BookOpen, color: 'bg-primary/10 text-primary' },
  { name: 'Home & Kitchen', slug: 'Home & Kitchen', icon: Home, color: 'bg-accent/10 text-accent' },
]

export function CategoryCards() {
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
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link
              key={category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${category.color} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="font-serif text-base font-medium text-foreground">
                {category.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
