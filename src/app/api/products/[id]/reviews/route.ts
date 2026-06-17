import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { parseBody, reviewSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const [reviewsResult, statsResult] = await Promise.all([
      supabase
        .from('reviews')
        .select('id, product_id, user_id, rating, title, body, is_verified_purchase, created_at, user:profiles(full_name)')
        .eq('product_id', params.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', params.id),
    ])

    if (reviewsResult.error) {
      return Response.json({ error: reviewsResult.error.message }, { status: 500 })
    }

    const reviews = reviewsResult.data ?? []
    const stats = statsResult.data ?? []

    const averageRating = stats.length > 0
      ? stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      : 0

    return Response.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: stats.length,
    }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: body, error: parseError } = await parseBody(request, reviewSchema)
    if (parseError) return parseError
    const { rating, title, body: reviewBody } = body

    // Check for verified purchase
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'delivered')
      .in('id', (
        await supabase
          .from('order_items')
          .select('order_id')
          .eq('product_id', params.id)
      ).data?.map(o => o.order_id) || []
      )

    const isVerifiedPurchase = (orders?.length || 0) > 0

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: params.id,
        user_id: user.id,
        rating,
        title: title || null,
        body: reviewBody || null,
        is_verified_purchase: isVerifiedPurchase,
      })
      .select('id, product_id, user_id, rating, title, body, is_verified_purchase, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'You already reviewed this product' }, { status: 409 })
      }
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ review }, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
