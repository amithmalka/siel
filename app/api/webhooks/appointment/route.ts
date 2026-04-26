// Called by Supabase Database Webhook when appointment status → provider_confirmed
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const record = body.record ?? body  // Supabase sends { record: {...} }
  const { user_id, slot_start, status } = record

  if (status !== 'provider_confirmed' || !user_id) {
    return NextResponse.json({ skipped: true })
  }

  const admin = getAdminSupabase()
  const { data: sub } = await admin
    .from('user_push_subscriptions')
    .select('subscription')
    .eq('user_id', user_id)
    .maybeSingle()

  if (!sub?.subscription) return NextResponse.json({ noSub: true })

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  const time = new Date(slot_start).toLocaleString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem',
  })

  try {
    await webpush.sendNotification(
      sub.subscription as webpush.PushSubscription,
      JSON.stringify({ title: 'SIEL · התור אושר!', body: `התורך ביום ${time} אושר על ידי בעלת העסק` }),
    )
  } catch {
    await admin.from('user_push_subscriptions').delete().eq('user_id', user_id)
  }

  return NextResponse.json({ sent: true })
}
