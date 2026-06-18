'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import type { Product } from '@/types'

interface SearchBarProps {
  onResults: (products: Product[] | null) => void
  onClear: () => void
  onQueryChange?: (query: string) => void
  className?: string
  placeholder?: string
  initialQuery?: string
  page?: number
  limit?: number
}

export function SearchBar({ onResults, onClear, onQueryChange, className, placeholder = 'Search products...', initialQuery, page = 1, limit = 8 }: SearchBarProps) {
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
    onQueryChange?.(q.trim())
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim(), page, limit }),
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
  }, [onResults, onClear, onQueryChange, page, limit])

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
      <div className="relative w-full focus:w-80 transition-all duration-300">
        <div className="p-[1px] ai-search-glow rounded-[12px]">
          <div className="relative bg-background rounded-[11px] flex items-center">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent rounded-[11px] py-2.5 pl-10 pr-24 text-[14px] text-foreground placeholder:text-foreground-muted outline-none"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {!query && !searching && (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground-muted ring-1 ring-inset ring-border/50">
                  <Sparkles className="h-3 w-3 text-primary" />
                  AI Search
                </div>
              )}
              {query && !searching && (
                <button
                  onClick={handleClear}
                  className="text-foreground-muted hover:text-foreground p-1 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {searching && (
                <div className="flex items-center gap-1 px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
