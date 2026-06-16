import { createClient } from '@/lib/supabase/server'

export type ReviewStatsMap = Map<string, { averageRating: number; totalReviews: number }>

export async function getReviewStats(productIds: string[]): Promise<ReviewStatsMap> {
  if (productIds.length === 0) return new Map()

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('product_id, rating')
    .in('product_id', productIds)

  if (error || !reviews) return new Map()

  const stats = new Map<string, { sum: number; count: number }>()

  for (const r of reviews) {
    const existing = stats.get(r.product_id) ?? { sum: 0, count: 0 }
    existing.sum += r.rating
    existing.count += 1
    stats.set(r.product_id, existing)
  }

  const result: ReviewStatsMap = new Map()
  stats.forEach((s, productId) => {
    result.set(productId, {
      averageRating: Math.round((s.sum / s.count) * 10) / 10,
      totalReviews: s.count,
    })
  })

  return result
}
