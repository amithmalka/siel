// Supabase webhook: chat_messages INSERT with sender_type='user' → notify rabbi
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
  const { conversation_id, sender_type, content } = record

  if (sender_type !== 'user' || !conversation_id) {
    return NextResponse.json({ skipped: true })
  }

  const admin = getAdminSupabase()
  const { data: conv } = await admin
    .from('conversations')
    .select('rabbi_id')
    .eq('id', conversation_id)
    .maybeSingle()

  if (!conv?.rabbi_id) return NextResponse.json({ noConv: true })

  const { data: sub } = await admin
    .from('rabbi_web_push_subscriptions')
    .select('subscription')
    .eq('rabbi_id', conv.rabbi_id)
    .maybeSingle()

  if (!sub?.subscription) return NextResponse.json({ noSub: true })

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  try {
    await webpush.sendNotification(
      sub.subscription as webpush.PushSubscription,
      JSON.stringify({
        title: 'SIEL · הודעה חדשה ממשתמשת',
        body: content?.slice(0, 60) || 'יש הודעה חדשה',
        url: '/rabbi/inbox',
      }),
    )
  } catch {
    await admin.from('rabbi_web_push_subscriptions').delete().eq('rabbi_id', conv.rabbi_id)
  }

  return NextResponse.json({ sent: true })
}
