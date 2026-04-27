import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id, role')
    .eq('id', user.id)
    .single()

  if (!boUser || boUser.role !== 'beauty_pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const admin = getAdminSupabase()

  const { error } = await admin
    .from('service_providers')
    .update({
      name: body.name,
      specialty: body.specialty,
      city: body.city,
      address: body.address,
      phone: body.phone,
      bio: body.bio,
      is_available: body.is_available,
    })
    .eq('id', boUser.linked_entity_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
