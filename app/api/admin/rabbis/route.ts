import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  const admin = getAdminSupabase()
  const { data: rabbis } = await admin
    .from('rabbis')
    .select('id, name, specialty, is_available, user_id')
    .order('name')
  return NextResponse.json({ rabbis: rabbis ?? [] })
}

export async function PATCH(request: NextRequest) {
  const { id, is_available } = await request.json()
  const admin = getAdminSupabase()
  await admin.from('rabbis').update({ is_available }).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const admin = getAdminSupabase()

  // Get the auth user id directly from the rabbis row
  const { data: rabbi } = await admin
    .from('rabbis')
    .select('user_id')
    .eq('id', id)
    .maybeSingle()

  // Delete DB rows
  await admin.from('rabbis').delete().eq('id', id)

  if (rabbi?.user_id) {
    await admin.from('backoffice_users').delete().eq('id', rabbi.user_id)
    // Delete from Supabase Auth — removes login access permanently
    await admin.auth.admin.deleteUser(rabbi.user_id)
  }

  return NextResponse.json({ success: true })
}
