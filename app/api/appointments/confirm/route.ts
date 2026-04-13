import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId, action } = await request.json() as {
    appointmentId: string
    action: 'confirm' | 'cancel'
  }

  // Verify this appointment belongs to the authenticated provider
  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id, role')
    .eq('id', user.id)
    .single()

  if (!boUser || boUser.role !== 'beauty_pro') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: appt } = await adminSupabase
    .from('appointments')
    .select('provider_id')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.provider_id !== boUser.linked_entity_id) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  const update =
    action === 'confirm'
      ? { status: 'provider_confirmed', provider_confirmed_at: new Date().toISOString() }
      : { status: 'cancelled' }

  const { error, data: updatedAppt } = await adminSupabase
    .from('appointments')
    .update(update)
    .eq('id', appointmentId)
    .select('user_id, slot_start')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send push notification to user if confirming
  if (action === 'confirm' && updatedAppt) {
    const { data: tokenRow } = await adminSupabase
      .from('user_push_tokens')
      .select('token')
      .eq('user_id', updatedAppt.user_id)
      .single()

    if (tokenRow?.token) {
      const slotDate = new Date(updatedAppt.slot_start).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Jerusalem' })
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: tokenRow.token,
          title: 'התור אושר! ✅',
          body: `התור שלך ב-${slotDate} אושר`,
          sound: 'default',
        }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ success: true })
}
