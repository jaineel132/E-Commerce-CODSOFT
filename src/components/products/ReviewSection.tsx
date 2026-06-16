'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import type { ReviewWithUser } from '@/types'

interface ReviewSectionProps {
  productId: string
}

interface ReviewsData {
  reviews: (ReviewWithUser & { user: { full_name: string | null } })[]
  averageRating: number
  totalReviews: number
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth()
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, body }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      toast.success('Review submitted!')
      setFormOpen(false)
      setRating(0)
      setTitle('')
      setBody('')
      const refresh = await fetch(`/api/products/${productId}/reviews`)
      setData(await refresh.json())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (count: number, interactive = false) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const filled = i <= (interactive ? hoverRating || rating : count)
      stars.push(
        <button
          key={i}
          type={interactive ? 'button' : 'button'}
          disabled={!interactive}
          onClick={() => interactive && setRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'} transition-colors ${
            filled ? 'text-amber-400' : 'text-muted-foreground/30'
          }`}
        >
          <Star className={`h-4 w-4 ${filled ? 'fill-amber-400' : ''}`} />
        </button>
      )
    }
    return stars
  }

  return (
    <div className="border-t border-border pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">Reviews</h2>
          {data && data.totalReviews > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex">{renderStars(Math.round(data.averageRating))}</div>
              <span className="text-sm text-muted-foreground">
                {data.averageRating} ({data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        {user && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {formOpen ? 'Cancel' : 'Write a review'}
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">Rating</label>
            <div className="flex gap-0.5">{renderStars(0, true)}</div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="Great product!"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-foreground">Review (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Share your experience with this product..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit review
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-xl" />
          ))}
        </div>
      ) : data && data.reviews.length > 0 ? (
        <div className="space-y-4">
          {data.reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {review.user?.full_name || 'Anonymous'}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.title && (
                <p className="mt-3 text-sm font-medium text-foreground">{review.title}</p>
              )}
              {review.body && (
                <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
      )}
    </div>
  )
}
