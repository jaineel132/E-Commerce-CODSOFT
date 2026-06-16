import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      isAdmin = profile?.role === 'admin'
    }

    let query = supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')

    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }

    const { data: products, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ products }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, description, price, category, image_url, stock_count } = body

    if (!name || !price || !category) {
      return Response.json({ error: 'name, price, and category are required' }, { status: 400 })
    }

    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        image_url,
        stock_count: stock_count ?? 0,
      })
      .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
      .single()

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    // Generate and save embedding
    const textToEmbed = `${product.name}${product.description ? ' ' + product.description : ''}`
    const embedding = await generateEmbedding(textToEmbed)

    const { error: updateError } = await supabase
      .from('products')
      .update({ embedding })
      .eq('id', product.id)

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    return Response.json({ product }, { status: 201 })
  } catch {
    return Response.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
