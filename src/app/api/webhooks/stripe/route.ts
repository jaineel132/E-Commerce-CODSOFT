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

    const productsMeta = session.metadata?.products
    if (!productsMeta) {
      return Response.json({ error: 'Missing products in session metadata' }, { status: 400 })
    }

    let products: { product_id: string; quantity: number }[]
    try {
      products = JSON.parse(productsMeta)
    } catch {
      return Response.json({ error: 'Invalid products metadata' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Idempotency check — skip if order already exists
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session', session.id)
      .single()

    if (existing) {
      return Response.json({ received: true }, { status: 200 })
    }

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0
    const addressId = session.metadata?.address_id || null
    const shippingAmount = session.metadata?.shipping_amount ? parseFloat(session.metadata.shipping_amount) : 0
    const taxAmount = session.metadata?.tax_amount ? parseFloat(session.metadata.tax_amount) : 0

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        stripe_session: session.id,
        total_amount: totalAmount,
        status: 'pending',
        shipping_address_id: addressId,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
      })
      .select('id')
      .single()

    if (orderError) {
      return Response.json({ error: orderError.message }, { status: 500 })
    }

    // Fetch prices from DB
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id, price, stock_count')
      .in('id', products.map((p) => p.product_id))

    if (productError) {
      return Response.json({ error: productError.message }, { status: 500 })
    }

    const priceMap = new Map(productData.map((p) => [p.id, Number(p.price)]))

    const orderItems = products.map((p) => ({
      order_id: order.id,
      product_id: p.product_id,
      quantity: p.quantity,
      unit_price: priceMap.get(p.product_id) || 0,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      return Response.json({ error: itemsError.message }, { status: 500 })
    }

    // Atomic stock decrement via batch RPC
    const { error: stockError } = await supabase.rpc('decrement_stock_batch', {
      items: JSON.stringify(products.map((p) => ({ pid: p.product_id, qty: p.quantity }))),
    })

    if (stockError) {
      console.error('Failed to decrement stock:', stockError)
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
