import { requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { parseBody, adminOrderUpdateSchema } from '@/lib/validations'
import { checkUserRateLimit } from '@/lib/rate-limit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase, user } = auth
    const rateLimitResponse = await checkUserRateLimit(user.id)
    if (rateLimitResponse) return rateLimitResponse

    const { data: body, error: parseError } = await parseBody(request, adminOrderUpdateSchema)
    if (parseError) return parseError
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
