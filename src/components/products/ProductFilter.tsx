'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen']

interface ProductFilterProps {
  className?: string
}

export function ProductFilter({ className }: ProductFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleCategoryChange = (category: string) => {
    updateParams('category', category === activeCategory ? '' : category)
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
  }

  const handleClearFilters = () => {
    setLocalMinPrice('')
    setLocalMaxPrice('')
    router.push('/products')
  }

  const hasActiveFilters = activeCategory || minPrice || maxPrice

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold font-serif text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">Category</h3>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-foreground">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
            min="0"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
            min="0"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="mt-3 w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Apply Price
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-foreground">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {activeCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {activeCategory}
                <button onClick={() => handleCategoryChange(activeCategory)} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Min: {formatPrice(parseFloat(minPrice))}
                <button onClick={() => { setLocalMinPrice(''); updateParams('minPrice', '') }} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Max: {formatPrice(parseFloat(maxPrice))}
                <button onClick={() => { setLocalMaxPrice(''); updateParams('maxPrice', '') }} className="ml-0.5 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
