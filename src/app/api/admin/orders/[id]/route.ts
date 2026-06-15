import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    const validStatuses = ['pending', 'shipped', 'delivered']
    if (!status || !validStatuses.includes(status)) {
      return Response.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.id)
      .select('*, order_items(*, product:products(id, name, price, image_url))')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ order }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
