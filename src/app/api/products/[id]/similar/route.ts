import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

const getCachedSimilarProducts = unstable_cache(
  async (id: string) => {
    console.log(`[CACHE MISS] product-similar - fetching id=${id}`)
    const supabase = createPublicClient()

    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, embedding')
      .eq('id', id)
      .single()

    if (prodErr || !product?.embedding) {
      return []
    }

    const { data: matches, error: matchErr } = await supabase.rpc('match_products', {
      query_embedding: product.embedding,
      match_count: 5,
      match_threshold: 0.3,
    })

    if (matchErr || !matches) {
      return []
    }

    return matches
      .filter((m: { id: string }) => m.id !== id)
      .slice(0, 4)
      .map((m: { category: string; id: string; name: string; description: string; price: number; image_url: string; stock_count: number; similarity: number }) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        price: m.price,
        image_url: m.image_url,
        stock_count: m.stock_count,
        category_id: '',
        category: { name: m.category, slug: '' },
        is_active: true,
        created_at: '',
      }))
  },
  ['product-similar'],
  { tags: ['products'], revalidate: 3600 }
)

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const products = await getCachedSimilarProducts(params.id)
    console.log('[CACHE HIT] product-similar - served from cache')
    return NextResponse.json({ products })
  } catch (err) {
    console.error('[CACHE ERROR] product-similar route failed:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ products: [] })
  }
}
