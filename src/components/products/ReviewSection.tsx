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
    <div className="border-t border-border pt-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="display-sm text-foreground">Reviews</h2>
          {data && data.totalReviews > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">{renderStars(Math.round(data.averageRating))}</div>
              <span className="text-[14px] font-medium text-foreground-muted">
                {data.averageRating} out of 5 ({data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        {user && (
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="rounded-full bg-primary px-6 py-2.5 text-[14px] font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-primary/25"
          >
            {formOpen ? 'Cancel' : 'Write a review'}
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-12 rounded-[20px] border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <label className="mb-2 block text-[14px] font-medium text-foreground">Overall Rating</label>
            <div className="flex gap-1">{renderStars(0, true)}</div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-[14px] font-medium text-foreground">Headline (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[12px] border border-border bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="What's most important to know?"
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-[14px] font-medium text-foreground">Written Review (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-[12px] border border-border bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="What did you like or dislike? What did you use this product for?"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 w-full sm:w-auto text-[14px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Review
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-32 rounded-[20px]" />
          ))}
        </div>
      ) : data && data.reviews.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.reviews.map((review) => (
            <div key={review.id} className="rounded-[20px] border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] font-medium text-foreground">
                      {review.user?.full_name || 'Anonymous'}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                    <span className="text-[12px] text-foreground-muted">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {review.title && (
                <p className="mt-4 text-[15px] font-semibold text-foreground">{review.title}</p>
              )}
              {review.body && (
                <p className="mt-2 text-[14px] leading-relaxed text-foreground-muted">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-border border-dashed bg-card/50 p-12 text-center">
          <p className="text-[15px] font-medium text-foreground">No reviews yet</p>
          <p className="mt-1 text-[14px] text-foreground-muted">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
