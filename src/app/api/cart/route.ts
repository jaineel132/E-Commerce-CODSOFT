import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('id, user_id, product_id, quantity, created_at, product:products(id, name, price, image_url, stock_count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ cartItems: cartItems || [] }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return Response.json({ error: 'product_id is required' }, { status: 400 })
    }

    // Check if item already in cart → upsert
    const { data: existing, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return Response.json({ error: fetchError.message }, { status: 500 })
    }

    let result

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select('id, user_id, product_id, quantity, created_at')
        .single()

      if (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }

      result = data
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id, quantity: 1 })
        .select('id, user_id, product_id, quantity, created_at')
        .single()

      if (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }

      result = data
    }

    return Response.json({ cartItem: result }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity } = body

    if (!product_id || quantity === undefined) {
      return Response.json({ error: 'product_id and quantity are required' }, { status: 400 })
    }

    if (quantity < 1) {
      return Response.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .select('id, user_id, product_id, quantity, created_at')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ cartItem: data }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return Response.json({ error: 'product_id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ message: 'Item removed from cart' }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
