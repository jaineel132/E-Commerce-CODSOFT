import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { parseBody, wishlistSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wishlistItems, error } = await supabase
      .from('wishlist_items')
      .select('id, user_id, product_id, created_at, product:products(id, name, price, image_url, stock_count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ wishlistItems: wishlistItems || [] }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: body, error: parseError } = await parseBody(request, wishlistSchema)
    if (parseError) return parseError
    const { product_id } = body

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (existing) {
      return Response.json({ message: 'Already in wishlist' }, { status: 200 })
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, product_id })
      .select('id, user_id, product_id, created_at, product:products(id, name, price, image_url, stock_count)')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ wishlistItem: data }, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to add to wishlist' }, { status: 500 })
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
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', product_id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ message: 'Item removed from wishlist' }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
