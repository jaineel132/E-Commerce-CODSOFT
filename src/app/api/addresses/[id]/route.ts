import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { label, full_name, street, city, state, zip_code, country, phone, is_default } = body

  const updateData: {
    label?: string
    full_name?: string
    street?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
    phone?: string | null
    is_default?: boolean
  } = {}
  if (label !== undefined) updateData.label = label
  if (full_name !== undefined) updateData.full_name = full_name
  if (street !== undefined) updateData.street = street
  if (city !== undefined) updateData.city = city
  if (state !== undefined) updateData.state = state
  if (zip_code !== undefined) updateData.zip_code = zip_code
  if (country !== undefined) updateData.country = country
  if (phone !== undefined) updateData.phone = phone

  if (is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
    updateData.is_default = true
  }

  const { data: address, error } = await supabase
    .from('addresses')
    .update(updateData)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ address }, { status: 200 })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 200 })
}
