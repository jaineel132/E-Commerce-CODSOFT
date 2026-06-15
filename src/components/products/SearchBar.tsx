'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import type { Product } from '@/types'

interface SearchBarProps {
  onResults: (products: Product[] | null) => void
  onClear: () => void
  className?: string
  placeholder?: string
  initialQuery?: string
}

export function SearchBar({ onResults, onClear, className, placeholder = 'Search products...', initialQuery }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery || '')
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasInitialized = useRef(false)

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      onClear()
      return
    }

    setSearching(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        onResults(data.products || [])
      } else {
        onResults([])
      }
    } catch {
      onResults([])
    } finally {
      setSearching(false)
    }
  }, [onResults, onClear])

  useEffect(() => {
    if (initialQuery && !hasInitialized.current) {
      hasInitialized.current = true
      performSearch(initialQuery)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      onClear()
      setSearching(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-input bg-muted py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-ring"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}
