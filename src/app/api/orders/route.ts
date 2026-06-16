import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: orders, error, count } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, image_url)), shipping_address:addresses(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

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
