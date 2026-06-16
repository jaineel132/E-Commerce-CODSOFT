import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, created_at')
    .eq('id', user.id)
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ profile }, { status: 200 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { full_name } = body

  if (full_name !== undefined && (typeof full_name !== 'string' || full_name.trim().length === 0)) {
    return Response.json({ error: 'full_name must be a non-empty string' }, { status: 400 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({ full_name: full_name?.trim() || null })
    .eq('id', user.id)
    .select('id, email, full_name, avatar_url, role, created_at')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ profile }, { status: 200 })
}
