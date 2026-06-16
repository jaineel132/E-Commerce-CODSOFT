import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings'
import { NextRequest } from 'next/server'

function filterByElbow(
  products: Array<{ similarity: number; [key: string]: unknown }>,
  minGap = 0.03
) {
  if (products.length <= 1) return products

  for (let i = 0; i < products.length - 1; i++) {
    const gap = products[i].similarity - products[i + 1].similarity
    if (gap >= minGap) {
      return products.slice(0, i + 1)
    }
  }

  return products
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'Query is required' }, { status: 400 })
    }

    const embedding = await generateEmbedding(query)

    const supabase = await createClient()

    const { data: products, error } = await supabase.rpc('match_products', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 8,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const filtered = filterByElbow(products || [])

    return Response.json({ products: filtered }, { status: 200 })
  } catch {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
