import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId } = await request.json() as { appointmentId: string }

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id, role')
    .eq('id', user.id)
    .single()

  if (!boUser || boUser.role !== 'beauty_pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminSupabase = getAdminSupabase()

  const { data: appt } = await adminSupabase
    .from('appointments')
    .select('user_id, slot_start, service_name, provider_id')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.provider_id !== boUser.linked_entity_id) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  const { data: tokenRow } = await adminSupabase
    .from('user_push_tokens')
    .select('token')
    .eq('user_id', appt.user_id)
    .single()

  if (!tokenRow?.token) {
    return NextResponse.json({ sent: false, reason: 'no_token' })
  }

  const slotDate = new Date(appt.slot_start).toLocaleString('he-IL', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Jerusalem',
  })

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: tokenRow.token,
      title: 'תזכורת לתור 📅',
      body: `תזכורת: יש לך תור${appt.service_name ? ` ל${appt.service_name}` : ''} ב-${slotDate}`,
      sound: 'default',
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'push failed' }, { status: 500 })
  return NextResponse.json({ sent: true })
}
