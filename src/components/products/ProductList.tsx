'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchX } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { ProductGrid } from './ProductGrid'
import { Pagination } from './Pagination'
import type { Product } from '@/types'
import type { ReviewStatsMap } from '@/lib/reviews'

interface ProductListProps {
  initialProducts: Product[]
  initialQuery?: string
  total?: number
  page?: number
  totalPages?: number
  initialReviewStats?: ReviewStatsMap
}

export function ProductList({ initialProducts, initialQuery, total, page = 1, totalPages = 1, initialReviewStats }: ProductListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery || '')
  const [searchPage, setSearchPage] = useState(1)
  const [searchTotalPages, setSearchTotalPages] = useState(0)
  const [searchTotal, setSearchTotal] = useState(0)

  const handleResults = useCallback((products: Product[] | null) => {
    setSearchResults(products)
    setIsSearchActive(products !== null)
  }, [])

  const handleClear = useCallback(() => {
    setSearchResults(null)
    setIsSearchActive(false)
    setSearchQuery('')
    setSearchPage(1)
    setSearchTotalPages(0)
    setSearchTotal(0)
  }, [])

  const handleQueryChange = useCallback((q: string) => {
    setSearchQuery(q)
    setSearchPage(1)
  }, [])

  const handleSearchPageChange = useCallback(async (newPage: number) => {
    setSearchPage(newPage)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, page: newPage, limit: 8 }),
      })
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.products || [])
        setSearchTotalPages(data.totalPages ?? 0)
        setSearchTotal(data.total ?? 0)
      }
    } catch {
      // ignore
    }
  }, [searchQuery])

  const handlePageChange = (newPage: number) => {
    if (isSearchActive) {
      handleSearchPageChange(newPage)
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`/products?${params.toString()}`)
  }

  const products = searchResults ?? initialProducts
  const resultCount = searchResults !== null ? searchResults.length : total ?? initialProducts.length
  const isSearchEmpty = isSearchActive && resultCount === 0
  const displayPage = isSearchActive ? searchPage : page
  const displayTotalPages = isSearchActive ? searchTotalPages : totalPages

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <SearchBar
          onResults={handleResults}
          onClear={handleClear}
          onQueryChange={handleQueryChange}
          className="w-full max-w-md"
          initialQuery={initialQuery}
          page={searchPage}
        />
      </div>

      {isSearchActive && !isSearchEmpty && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {searchTotal || resultCount} result{(searchTotal || resultCount) !== 1 ? 's' : ''} for your search
          </p>
          <button
            onClick={handleClear}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Show all products
          </button>
        </div>
      )}

      {!isSearchActive && total !== undefined && (
        <p className="mb-4 text-sm text-muted-foreground">
          {total} product{total !== 1 ? 's' : ''}
        </p>
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
        <>
          <h2 className="sr-only">Product Grid</h2>
          <ProductGrid products={products} ratingStats={initialReviewStats} />
          <Pagination
            page={displayPage}
            totalPages={displayTotalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}
