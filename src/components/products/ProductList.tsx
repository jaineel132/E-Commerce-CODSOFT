'use client'

import { useState, useCallback } from 'react'
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
      <div className="mb-8">
        <SearchBar
          onResults={handleResults}
          onClear={handleClear}
          className="w-full max-w-md"
          initialQuery={initialQuery}
        />
      </div>

      {isSearchActive && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {resultCount === 0
              ? 'No results found. Try a different search.'
              : `${resultCount} result${resultCount !== 1 ? 's' : ''} for your search`}
          </p>
          <button
            onClick={handleClear}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Show all products
          </button>
        </div>
      )}

      <ProductGrid products={products} />
    </div>
  )
}
