import { requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { checkUserRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase, user } = auth
    const rateLimitResponse = await checkUserRateLimit(user.id)
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select('*, order_items(*, product:products(id, name, price, image_url)), user:profiles(email, full_name), shipping_address:addresses(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error, count } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const total = count ?? 0

    return Response.json({
      orders: orders || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
