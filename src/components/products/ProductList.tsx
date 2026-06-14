'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SearchBar } from './SearchBar'
import { ProductGrid } from './ProductGrid'
import type { Product } from '@/types'

interface ProductListProps {
  initialProducts: Product[]
  initialQuery?: string
}

export function ProductList({ initialProducts, initialQuery }: ProductListProps) {
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (initialQuery && !hasInitialized.current) {
      hasInitialized.current = true
      setIsSearchActive(true)
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: initialQuery }),
      })
        .then((res) => res.json())
        .then((data) => setSearchResults(data.products || []))
        .catch(() => setSearchResults([]))
    }
  }, [initialQuery])

  const handleResults = useCallback((products: Product[] | null) => {
    setSearchResults(products)
    setIsSearchActive(products !== null)
  }, [])

  const handleClear = useCallback(() => {
    setSearchResults(null)
    setIsSearchActive(false)
  }, [])

  const products = searchResults ?? initialProducts
  const resultCount = searchResults !== null ? searchResults.length : initialProducts.length

  return (
    <div>
      <div className="mb-6">
        <SearchBar
          onResults={handleResults}
          onClear={handleClear}
          className="w-full max-w-md"
        />
      </div>

      {isSearchActive && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {resultCount === 0
              ? 'No results found. Try a different search.'
              : `${resultCount} result${resultCount !== 1 ? 's' : ''} for your search`}
          </p>
          <button
            onClick={handleClear}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Show all products
          </button>
        </div>
      )}

      <ProductGrid products={products} />
    </div>
  )
}
