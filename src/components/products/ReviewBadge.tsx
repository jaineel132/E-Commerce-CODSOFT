'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewBadgeProps {
  productId: string
  rating?: number
  reviewCount?: number
}

export function ReviewBadge({ productId, rating, reviewCount }: ReviewBadgeProps) {
  const [data, setData] = useState<{ averageRating: number; totalReviews: number } | null>(null)

  const hasPrefetched = rating !== undefined && reviewCount !== undefined

  useEffect(() => {
    if (hasPrefetched) return
    fetch(`/api/products/${productId}/reviews`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [productId, hasPrefetched])

  const displayRating = hasPrefetched ? rating : data?.averageRating
  const displayCount = hasPrefetched ? reviewCount : data?.totalReviews

  if (!displayRating || !displayCount || displayCount === 0) return null

  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium text-foreground">{displayRating}</span>
      <span className="text-xs text-muted-foreground">
        ({displayCount})
      </span>
    </div>
  )
}
