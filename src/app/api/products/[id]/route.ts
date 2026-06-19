import { createPublicClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { parseBody, productPatchSchema } from '@/lib/validations'

const getCachedProduct = unstable_cache(
  async (id: string) => {
    if (process.env.NODE_ENV === 'development') console.log(`[CACHE MISS] product-detail - fetching id=${id}`)
    const supabase = createPublicClient()

    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:categories(name, slug)')
      .eq('id', id)
      .single()

    if (error || !product) {
      console.error(`[CACHE ERROR] product-detail query failed for id=${id}:`, error?.message || 'not found')
      throw new Error('Product not found')
    }

    if (process.env.NODE_ENV === 'development') console.log(`[CACHE STORE] product-detail - id=${id} cached`)
    return product
  },
  ['product-detail'],
  { tags: ['products'], revalidate: 1800 }
)

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getCachedProduct(params.id)
    if (process.env.NODE_ENV === 'development') console.log('[CACHE HIT] product-detail - served from cache')
    return Response.json({ product }, { status: 200 })
  } catch (err) {
    console.error('[CACHE ERROR] product-detail route failed:', err instanceof Error ? err.message : String(err))
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase } = auth

    const { data: body, error: parseError } = await parseBody(request, productPatchSchema)
    if (parseError) return parseError

    const updates: {
      name?: string
      description?: string | null
      price?: number
      category_id?: string
      image_url?: string | null
      stock_count?: number
      is_active?: boolean
    } = {}

    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.price !== undefined) updates.price = body.price
    if (body.category_id !== undefined) updates.category_id = body.category_id
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
      .select('*, category:categories(name, slug)')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('products')
    revalidateTag('products-list')

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
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase } = auth

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    revalidateTag('products-list')
    revalidateTag('categories')

    return Response.json({ message: 'Product deleted' }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
