// Supabase webhook: appointments INSERT → notify provider
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const record = body.record ?? body
  const { provider_id, slot_start } = record

  if (!provider_id) return NextResponse.json({ skipped: true })

  const admin = getAdminSupabase()
  const { data: sub } = await admin
    .from('provider_web_push_subscriptions')
    .select('subscription')
    .eq('provider_id', provider_id)
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
      JSON.stringify({
        title: 'SIEL · בקשת תור חדשה',
        body: `התקבלה בקשת תור ל${time}`,
        url: '/beauty/appointments',
      }),
    )
  } catch {
    await admin.from('provider_web_push_subscriptions').delete().eq('provider_id', provider_id)
  }

  return NextResponse.json({ sent: true })
}
