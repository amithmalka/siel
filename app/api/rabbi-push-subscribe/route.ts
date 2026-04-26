import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { subscription, rabbiId } = await req.json()
  if (!subscription || !rabbiId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  await getAdminSupabase()
    .from('rabbi_web_push_subscriptions')
    .upsert({ rabbi_id: rabbiId, subscription, updated_at: new Date().toISOString() })

  return NextResponse.json({ ok: true })
}
