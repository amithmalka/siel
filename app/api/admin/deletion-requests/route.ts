import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const admin = getAdminSupabase()
  const handled = request.nextUrl.searchParams.get('handled') === 'true'

  let query = admin
    .from('deletion_requests')
    .select('*')
    .order('requested_at', { ascending: false })

  if (handled) {
    query = query.not('handled_at', 'is', null)
  } else {
    query = query.is('handled_at', null)
  }

  const { data: requests } = await query
  return NextResponse.json({ requests: requests ?? [] })
}

export async function PATCH(request: NextRequest) {
  const { id } = await request.json()
  const admin = getAdminSupabase()
  await admin
    .from('deletion_requests')
    .update({ handled_at: new Date().toISOString() })
    .eq('id', id)
  return NextResponse.json({ success: true })
}
