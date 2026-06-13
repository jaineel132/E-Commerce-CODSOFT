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
