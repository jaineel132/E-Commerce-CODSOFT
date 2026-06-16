import { requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase } = auth

    const body = await request.json()
    const updates: {
      status?: string
      shipped_at?: string
      delivered_at?: string
      cancelled_at?: string
      tracking_number?: string | null
      tracking_carrier?: string | null
      notes?: string | null
    } = {}

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return Response.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
      }
      updates.status = body.status

      if (body.status === 'shipped') updates.shipped_at = new Date().toISOString()
      if (body.status === 'delivered') updates.delivered_at = new Date().toISOString()
      if (body.status === 'cancelled') updates.cancelled_at = new Date().toISOString()
    }

    if (body.tracking_number !== undefined) updates.tracking_number = body.tracking_number
    if (body.tracking_carrier !== undefined) updates.tracking_carrier = body.tracking_carrier
    if (body.notes !== undefined) updates.notes = body.notes

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', params.id)
      .select('*, order_items(*, product:products(id, name, price, image_url)), user:profiles(email, full_name), shipping_address:addresses(*)')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ order }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
