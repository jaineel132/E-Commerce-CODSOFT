import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings'
import { NextRequest } from 'next/server'
import { parseBody, searchSchema } from '@/lib/validations'
import { checkUserRateLimit } from '@/lib/rate-limit'
import { getCachedSearch, setCachedSearch } from '@/lib/search-cache'

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
    const { data: body, error: parseError } = await parseBody(request, searchSchema)
    if (parseError) return parseError
    const { query, page, limit } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const rateLimitResponse = await checkUserRateLimit(user.id)
      if (rateLimitResponse) return rateLimitResponse
    }

    const cached = await getCachedSearch(query)
    if (cached) {
      const filtered = cached.products as Array<{ similarity: number; [key: string]: unknown }>
      const total = filtered.length
      const from = (page - 1) * limit
      const paginatedProducts = filtered.slice(from, from + limit)
      const totalPages = Math.max(1, Math.ceil(total / limit))

      return Response.json({
        products: paginatedProducts,
        page,
        limit,
        total,
        totalPages,
      }, { status: 200 })
    }

    const embedding = await generateEmbedding(query)

    const { data: products, error } = await supabase.rpc('match_products', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: page * limit,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const filtered = filterByElbow(products || [])

    await setCachedSearch(query, { products: filtered })

    const total = filtered.length
    const from = (page - 1) * limit
    const paginatedProducts = filtered.slice(from, from + limit)
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return Response.json({
      products: paginatedProducts,
      page,
      limit,
      total,
      totalPages,
    }, { status: 200 })
  } catch {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}
