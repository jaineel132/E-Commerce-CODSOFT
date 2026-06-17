import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'
import { parseBody, productSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

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

    let countQuery = supabase.from('products').select('id', { count: 'exact', head: true })
    let dataQuery = supabase
      .from('products')
      .select('*, category:categories(name, slug)')

    if (!isAdmin) {
      countQuery = countQuery.eq('is_active', true)
      dataQuery = dataQuery.eq('is_active', true)
    }

    let categoryId: string | null = null
    if (categorySlug) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
      categoryId = cat?.id ?? null
    }

    if (categoryId) {
      countQuery = countQuery.eq('category_id', categoryId)
      dataQuery = dataQuery.eq('category_id', categoryId)
    }

    if (minPrice) {
      countQuery = countQuery.gte('price', parseFloat(minPrice))
      dataQuery = dataQuery.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      countQuery = countQuery.lte('price', parseFloat(maxPrice))
      dataQuery = dataQuery.lte('price', parseFloat(maxPrice))
    }

    const { count, error: countError } = await countQuery
    if (countError) {
      return Response.json({ error: countError.message }, { status: 500 })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const allowedSorts = ['created_at', 'price', 'name']
    const actualSortBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at'

    const { data: products, error } = await dataQuery
      .order(actualSortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const total = count ?? 0

    return Response.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase } = auth

    const { data: body, error: parseError } = await parseBody(request, productSchema)
    if (parseError) return parseError
    const { name, description, category_id, image_url, stock_count } = body

    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: body.price,
        category_id,
        image_url,
        stock_count: stock_count ?? 0,
      })
      .select('*, category:categories(name, slug)')
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
