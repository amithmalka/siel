// Called by Supabase Database Webhook when a rabbi sends a new chat message
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

  if (sender_type !== 'rabbi' || !conversation_id) {
    return NextResponse.json({ skipped: true })
  }

  const admin = getAdminSupabase()

  // Get the user_id from the conversation
  const { data: conv } = await admin
    .from('conversations')
    .select('user_id')
    .eq('id', conversation_id)
    .maybeSingle()

  if (!conv?.user_id) return NextResponse.json({ noConv: true })

  const { data: sub } = await admin
    .from('user_push_subscriptions')
    .select('subscription')
    .eq('user_id', conv.user_id)
    .maybeSingle()

  if (!sub?.subscription) return NextResponse.json({ noSub: true })

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  const preview = content?.slice(0, 60) || 'יש לך הודעה חדשה'

  try {
    await webpush.sendNotification(
      sub.subscription as webpush.PushSubscription,
      JSON.stringify({ title: 'SIEL · הודעה מהרב', body: preview }),
    )
  } catch {
    await admin.from('user_push_subscriptions').delete().eq('user_id', conv.user_id)
  }

  return NextResponse.json({ sent: true })
}
