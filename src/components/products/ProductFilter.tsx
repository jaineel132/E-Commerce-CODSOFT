'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { X, Filter } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Category } from '@/types'

interface ProductFilterProps {
  className?: string
}

export function ProductFilter({ className }: ProductFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {})
  }, [])

  const activeCategory = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [localMinPrice, setLocalMinPrice] = useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice)

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/products?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleCategoryChange = (slug: string) => {
    updateParams('category', slug === activeCategory ? '' : slug)
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (localMinPrice) {
      params.set('minPrice', localMinPrice)
    } else {
      params.delete('minPrice')
    }
    if (localMaxPrice) {
      params.set('maxPrice', localMaxPrice)
    } else {
      params.delete('maxPrice')
    }
    router.push(`/products?${params.toString()}`)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    router.push('/products')
  }

  const hasActiveFilters = activeCategory || minPrice || maxPrice

  return (
    <>
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <Filter className="h-4 w-4" />
          {isOpen ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              !
            </span>
          )}
        </button>
      </div>

      <div className={`space-y-8 ${isOpen ? 'block' : 'hidden'} lg:block ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="heading-sm text-foreground">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-[13px] font-medium text-foreground-muted hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-foreground-muted">Active Filters</h3>
            <div className="flex flex-wrap gap-2">
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                  {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
                  <button onClick={() => handleCategoryChange(activeCategory)} className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minPrice && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                  Min: {formatPrice(parseFloat(minPrice))}
                  <button onClick={() => { setLocalMinPrice(''); updateParams('minPrice', '') }} className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary ring-1 ring-inset ring-primary/20">
                  Max: {formatPrice(parseFloat(maxPrice))}
                  <button onClick={() => { setLocalMaxPrice(''); updateParams('maxPrice', '') }} className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-foreground-muted">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                  activeCategory === category.slug
                    ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary'
                    : 'bg-secondary text-foreground-secondary hover:bg-muted hover:text-foreground ring-1 ring-inset ring-border/50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-foreground-muted">Price Range</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">$</span>
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full rounded-[10px] border border-input bg-background py-2.5 pl-7 pr-3 text-sm text-foreground shadow-sm placeholder:text-foreground-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                min="0"
              />
            </div>
            <span className="text-foreground-muted font-medium">–</span>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">$</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full rounded-[10px] border border-input bg-background py-2.5 pl-7 pr-3 text-sm text-foreground shadow-sm placeholder:text-foreground-muted focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                min="0"
              />
            </div>
          </div>
          <button
            onClick={handlePriceApply}
            className="mt-4 w-full rounded-[10px] bg-secondary px-4 py-2.5 text-[14px] font-medium text-foreground hover:bg-muted transition-colors ring-1 ring-inset ring-border"
          >
            Apply Range
          </button>
        </div>
      </div>
    </>
  )
}
