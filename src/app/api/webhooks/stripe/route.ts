import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    if (!sig) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type !== 'checkout.session.completed') {
      return Response.json({ received: true }, { status: 200 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id

    if (!userId) {
      return Response.json({ error: 'Missing user_id in session metadata' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the Stripe session with line items to reconstruct order
    const sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    })

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        stripe_session: session.id,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderError) {
      return Response.json({ error: orderError.message }, { status: 500 })
    }

    // Create order_items
    const lineItems = sessionWithItems.line_items?.data || []
    const orderItems = lineItems.map((item) => ({
      order_id: order.id,
      product_id: (item.price?.product as Stripe.Product)?.id || '',
      quantity: item.quantity || 1,
      unit_price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      return Response.json({ error: itemsError.message }, { status: 500 })
    }

    // Clear user's cart
    const { error: clearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (clearError) {
      return Response.json({ error: clearError.message }, { status: 500 })
    }

    return Response.json({ received: true }, { status: 200 })
  } catch {
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
