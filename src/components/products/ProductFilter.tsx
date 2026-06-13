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
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Category</h3>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            min="0"
          />
          <span className="text-zinc-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            min="0"
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Apply Price
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {activeCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {activeCategory}
                <button onClick={() => handleCategoryChange(activeCategory)} className="ml-0.5 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Min: {formatPrice(parseFloat(minPrice))}
                <button onClick={() => { setLocalMinPrice(''); updateParams('minPrice', '') }} className="ml-0.5 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Max: {formatPrice(parseFloat(maxPrice))}
                <button onClick={() => { setLocalMaxPrice(''); updateParams('maxPrice', '') }} className="ml-0.5 hover:text-zinc-900 dark:hover:text-zinc-100">
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
