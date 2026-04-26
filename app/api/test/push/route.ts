// Test endpoint — sends a real push to a specific user immediately
// Usage: GET /api/test/push?secret=siel-cron-push-2024&userId=<user_id>
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 })

  const admin = getAdminSupabase()
  const { data: sub } = await admin
    .from('user_push_subscriptions')
    .select('subscription')
    .eq('user_id', userId)
    .maybeSingle()

  if (!sub?.subscription) {
    return NextResponse.json({ error: 'no subscription found for this user' }, { status: 404 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  try {
    await webpush.sendNotification(
      sub.subscription as webpush.PushSubscription,
      JSON.stringify({ title: 'SIEL · בדיקת התראה', body: 'מערכת ההתראות עובדת!' }),
    )
    return NextResponse.json({ sent: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message ?? e) }, { status: 500 })
  }
}
