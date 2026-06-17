import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { parseBody, recentlyViewedSchema } from '@/lib/validations'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recentlyViewed, error } = await supabase
      .from('recently_viewed')
      .select('id, user_id, product_id, viewed_at, product:products(id, name, price, image_url, stock_count)')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(12)

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ recentlyViewed: recentlyViewed || [] }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to fetch recently viewed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: body, error: parseError } = await parseBody(request, recentlyViewedSchema)
    if (parseError) return parseError
    const { product_id } = body

    // Upsert: update viewed_at if already exists, insert if not
    const { error } = await supabase
      .from('recently_viewed')
      .upsert(
        { user_id: user.id, product_id, viewed_at: new Date().toISOString() },
        { onConflict: 'user_id, product_id' },
      )

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ message: 'View tracked' }, { status: 200 })
  } catch {
    return Response.json({ error: 'Failed to track view' }, { status: 500 })
  }
}
