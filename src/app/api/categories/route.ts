import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'

const getCachedCategories = unstable_cache(
  async () => {
    console.log('[CACHE MISS] categories - fetching from Supabase')
    const supabase = createPublicClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*, products:products(count)')
      .order('name')

    if (error) {
      console.error('[CACHE ERROR] categories query failed:', error.message)
      throw new Error(error.message)
    }

    console.log(`[CACHE STORE] categories - ${categories?.length || 0} items cached`)
    return categories.map((c) => ({
      ...c,
      product_count: c.products?.[0]?.count ?? 0,
      products: undefined,
    }))
  },
  ['categories'],
  { tags: ['categories'], revalidate: 3600 }
)

export async function GET() {
  try {
    const categories = await getCachedCategories()
    console.log('[CACHE HIT] categories - served from cache')
    return NextResponse.json({ categories }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[CACHE ERROR] categories route failed:', err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
