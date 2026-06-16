import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, embedding')
    .eq('id', params.id)
    .single()

  if (prodErr || !product?.embedding) {
    return NextResponse.json({ products: [] })
  }

  const { data: matches, error: matchErr } = await supabase.rpc('match_products', {
    query_embedding: product.embedding,
    match_count: 5,
    match_threshold: 0.3,
  })

  if (matchErr || !matches) {
    return NextResponse.json({ products: [] })
  }

  const filtered = matches.filter((m: { id: string }) => m.id !== params.id).slice(0, 4)

  return NextResponse.json({ products: filtered })
}
