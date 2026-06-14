import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('id, quantity, product:products(id, name, price, image_url, stock_count)')
      .eq('user_id', user.id)

    if (cartError) {
      return Response.json({ error: cartError.message }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.round(Number(item.product.price) * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        user_id: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    })

    if (!session.url) {
      return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return Response.json({ url: session.url }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
