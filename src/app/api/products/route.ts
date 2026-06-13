import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock_count, is_active, created_at')
      .eq('is_active', true)

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
