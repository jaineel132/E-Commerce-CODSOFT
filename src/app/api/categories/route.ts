import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*, products:products(count)')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = categories.map((c) => ({
    ...c,
    product_count: c.products?.[0]?.count ?? 0,
    products: undefined,
  }))

  return NextResponse.json({ categories: result }, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
