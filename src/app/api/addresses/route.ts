import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: addresses, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ addresses }, { status: 200 })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { label, full_name, street, city, state, zip_code, country, phone, is_default } = body

  if (!full_name || !street || !city || !state || !zip_code) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data: address, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: label || 'Home',
      full_name,
      street,
      city,
      state,
      zip_code,
      country: country || 'US',
      phone: phone || null,
      is_default: is_default || false,
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ address }, { status: 201 })
}
