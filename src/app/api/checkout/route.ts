import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextRequest } from 'next/server'
import { parseBody, checkoutSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: body, error: parseError } = await parseBody(request, checkoutSchema)
    if (parseError) return parseError

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

    // Server-side price and stock verification
    for (const item of cartItems) {
      if (Number(item.product.stock_count) < item.quantity) {
        return Response.json({
          error: `"${item.product.name}" only has ${item.product.stock_count} in stock. Please adjust your cart.`,
        }, { status: 409 })
      }
    }

    // Calculate shipping and tax
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity, 0
    )
    const shipping = cartTotal > 50 ? 0 : 9.99
    const tax = cartTotal * 0.08

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
        address_id: body.address_id || '',
        shipping_amount: String(shipping),
        tax_amount: String(tax),
        products: JSON.stringify(cartItems.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        }))),
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
