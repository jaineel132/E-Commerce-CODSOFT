import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return Response.json({ error: auth.error }, { status: auth.status })
    }

    const { supabase } = auth

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('name, description')
      .eq('id', params.id)
      .single()

    if (fetchError || !product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    const textToEmbed = `${product.name}${product.description ? ' ' + product.description : ''}`
    const embedding = await generateEmbedding(textToEmbed)

    const { error: updateError } = await supabase
      .from('products')
      .update({ embedding })
      .eq('id', params.id)

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 })
    }

    return Response.json({ success: true }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to regenerate embedding' }, { status: 500 })
  }
}
