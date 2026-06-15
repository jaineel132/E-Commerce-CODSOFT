import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

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
