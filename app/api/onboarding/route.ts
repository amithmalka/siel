import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'לא מחוברת' }, { status: 401 })
    }

    const { role, name, specialty, city } = await request.json()

    if (role === 'rabbi') {
      // Insert rabbi row
      const { data: rabbiRow, error: rabbiErr } = await adminSupabase
        .from('rabbis')
        .insert({ name, specialty, is_available: true, user_id: user.id })
        .select('id')
        .single()
      if (rabbiErr) return NextResponse.json({ error: rabbiErr.message }, { status: 400 })

      // Insert backoffice_user
      const { error: buErr } = await adminSupabase
        .from('backoffice_users')
        .insert({ id: user.id, role: 'rabbi', linked_entity_id: rabbiRow.id })
      if (buErr) return NextResponse.json({ error: buErr.message }, { status: 400 })

      return NextResponse.json({ redirect: '/rabbi' })
    }

    // beauty_pro — try with extended columns first, fall back to base columns
    let provRow: { id: string } | null = null

    const fullInsert = await adminSupabase
      .from('service_providers')
      .insert({ name, specialty, city, is_available: true, is_active: true, portfolio_paths: [], user_id: user.id, latitude: 0, longitude: 0 })
      .select('id')
      .single()

    if (fullInsert.error) {
      // Fallback: insert only confirmed base columns
      const baseInsert = await adminSupabase
        .from('service_providers')
        .insert({ name, category: 'beauty', is_active: true, portfolio_paths: [], user_id: user.id, latitude: 0, longitude: 0 })
        .select('id')
        .single()
      if (baseInsert.error) return NextResponse.json({ error: baseInsert.error.message }, { status: 400 })
      provRow = baseInsert.data
    } else {
      provRow = fullInsert.data
    }

    // Insert backoffice_user
    const { error: buErr } = await adminSupabase
      .from('backoffice_users')
      .insert({ id: user.id, role: 'beauty_pro', linked_entity_id: provRow!.id, subscription_status: 'trialing' })
    if (buErr) return NextResponse.json({ error: buErr.message }, { status: 400 })

    return NextResponse.json({ redirect: '/beauty' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'שגיאה' }, { status: 500 })
  }
}
