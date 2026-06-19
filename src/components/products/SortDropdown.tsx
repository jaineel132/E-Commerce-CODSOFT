'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const currentValue = `${sortBy}-${sortOrder}`

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'newest') {
      params.set('sortBy', 'created_at')
      params.set('sortOrder', 'desc')
    } else if (value === 'price-asc') {
      params.set('sortBy', 'price')
      params.set('sortOrder', 'asc')
    } else if (value === 'price-desc') {
      params.set('sortBy', 'price')
      params.set('sortOrder', 'desc')
    } else if (value === 'name-asc') {
      params.set('sortBy', 'name')
      params.set('sortOrder', 'asc')
    }

    router.push(`/products?${params.toString()}`)
  }, [router, searchParams])

  return (
    <select
      aria-label="Sort products by"
      value={currentValue === 'created_at-desc' ? 'newest' : currentValue}
      onChange={handleChange}
      className="rounded-[10px] border border-input bg-background px-3 py-2 text-[13px] font-medium text-foreground shadow-sm hover:bg-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
    </select>
  )
}
