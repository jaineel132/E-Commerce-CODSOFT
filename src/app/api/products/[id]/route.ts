import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
      .eq('id', params.id)
      .single()

    if (error || !product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json({ product }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

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

    const updates: {
      name?: string
      description?: string | null
      price?: number
      category?: string
      image_url?: string | null
      stock_count?: number
      is_active?: boolean
    } = {}

    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.price !== undefined) updates.price = body.price
    if (body.category !== undefined) updates.category = body.category
    if (body.image_url !== undefined) updates.image_url = body.image_url
    if (body.stock_count !== undefined) updates.stock_count = body.stock_count
    if (body.is_active !== undefined) updates.is_active = body.is_active

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', params.id)
      .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ product }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ message: 'Product deleted' }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
