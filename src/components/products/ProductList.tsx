'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
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
  const isSearchEmpty = isSearchActive && resultCount === 0

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

      {isSearchActive && !isSearchEmpty && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {resultCount} result{resultCount !== 1 ? 's' : ''} for your search
          </p>
          <button
            onClick={handleClear}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Show all products
          </button>
        </div>
      )}

      {isSearchEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <SearchX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
            No results found
          </h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t find anything matching your search. Try different keywords or browse all products.
          </p>
          <Link
            href="/products"
            onClick={handleClear}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
