import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings'
import { NextRequest } from 'next/server'

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
      match_threshold: 0.75,
      match_count: 10,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ products: products || [] }, { status: 200 })
  } catch {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
