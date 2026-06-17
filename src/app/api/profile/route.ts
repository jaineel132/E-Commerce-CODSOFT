import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import { parseBody, profileUpdateSchema } from '@/lib/validations'

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

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: body, error: parseError } = await parseBody(request, profileUpdateSchema)
  if (parseError) return parseError
  const { full_name } = body

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
