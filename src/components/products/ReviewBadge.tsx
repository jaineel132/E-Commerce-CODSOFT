'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

interface ReviewBadgeProps {
  productId: string
}

export function ReviewBadge({ productId }: ReviewBadgeProps) {
  const [data, setData] = useState<{ averageRating: number; totalReviews: number } | null>(null)

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [productId])

  if (!data || data.totalReviews === 0) return null

  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium text-foreground">{data.averageRating}</span>
      <span className="text-xs text-muted-foreground">
        ({data.totalReviews})
      </span>
    </div>
  )
}
