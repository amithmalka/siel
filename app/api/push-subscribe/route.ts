import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { subscription, providerId } = await req.json()
  if (!subscription || !providerId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = getAdminSupabase()
  await admin
    .from('provider_web_push_subscriptions')
    .upsert({ provider_id: providerId, subscription, updated_at: new Date().toISOString() })

  return NextResponse.json({ ok: true })
}
