import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { getAdminSupabase } from '@/lib/supabase/admin'

const PRAYER_HOURS: Record<string, number> = { shacharit: 9, mincha: 14, arvit: 20 }
const PRAYER_LABELS: Record<string, string> = { shacharit: 'שחרית', mincha: 'מנחה', arvit: 'ערבית' }

function israelHour(): number {
  const s = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' })
  return new Date(s).getHours()
}

function israelToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )

  const hour = israelHour()
  const today = israelToday()
  const admin = getAdminSupabase()
  let sent = 0
  const expiredIds: string[] = []

  // Load all push subscriptions
  const { data: subs } = await admin.from('user_push_subscriptions').select('user_id, subscription')
  if (!subs?.length) return NextResponse.json({ sent: 0, hour })

  const userIds = subs.map((s: any) => s.user_id as string)
  const subMap = new Map<string, webpush.PushSubscription>(subs.map((s: any) => [s.user_id, s.subscription]))

  async function push(userId: string, title: string, body: string) {
    const sub = subMap.get(userId)
    if (!sub) return
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title, body }))
      sent++
    } catch {
      if (!expiredIds.includes(userId)) expiredIds.push(userId)
    }
  }

  // ── 1. Prayer reminders ─────────────────────────────────
  const { data: prayers } = await admin
    .from('prayer_reminders')
    .select('user_id, prayer_type')
    .in('user_id', userIds)

  for (const p of prayers ?? []) {
    if (PRAYER_HOURS[p.prayer_type] === hour) {
      await push(p.user_id, `SIEL · תפילת ${PRAYER_LABELS[p.prayer_type]}`, 'זמן התפילה הגיע 🙏')
    }
  }

  // ── 2-4. Cycle notifications (10am + 20pm) ──────────────
  if (hour === 10 || hour === 20) {
    const { data: cycles } = await admin
      .from('cycles')
      .select('id, user_id, start_date, hefsek_date')
      .in('user_id', userIds)
      .order('start_date', { ascending: false })

    // One latest cycle per user
    const latestByUser = new Map<string, any>()
    for (const c of cycles ?? []) {
      if (!latestByUser.has(c.user_id)) latestByUser.set(c.user_id, c)
    }

    for (const [userId, cycle] of latestByUser) {
      if (cycle.hefsek_date) {
        // Has hefsek — 7 clean days counting
        const dayNum = daysBetween(cycle.hefsek_date, today)
        if (dayNum >= 1 && dayNum <= 7) {
          const isLast = dayNum === 7
          if (hour === 10) {
            if (isLast) {
              await push(userId, 'SIEL · יום 7 – בדיקה אחרונה!', 'בדיקה אחרונה בבוקר. הלילה – ליל הטבילה!')
            } else {
              await push(
                userId,
                `SIEL · יום ${dayNum} לספירה`,
                `יום ${dayNum} מהפסק הטהרה – זמן לבדיקת עד. נותרו ${7 - dayNum} ימים`,
              )
            }
          }
          if (hour === 20 && isLast) {
            await push(userId, 'SIEL · ליל הטבילה', 'הלילה ליל הטבילה. זכרי לבדוק עם מוכנית המקווה. ברוכה הבאה!')
          }
        }
      }
    }
  }

  // ── 5. Appointment reminders — tomorrow at 9am ──────────
  if (hour === 9) {
    const tomorrow = new Date(today + 'T00:00:00')
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: appts } = await admin
      .from('appointments')
      .select('user_id, slot_start')
      .in('user_id', userIds)
      .gte('slot_start', `${tomorrowStr}T00:00:00`)
      .lte('slot_start', `${tomorrowStr}T23:59:59`)
      .in('status', ['provider_confirmed', 'user_confirmed'])

    for (const appt of appts ?? []) {
      const time = new Date(appt.slot_start).toLocaleTimeString('he-IL', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem',
      })
      await push(appt.user_id, 'SIEL · תזכורת לתור מחר', `יש לך תור מחר בשעה ${time}`)
    }
  }

  // Cleanup expired subscriptions
  if (expiredIds.length > 0) {
    await admin.from('user_push_subscriptions').delete().in('user_id', expiredIds)
  }

  return NextResponse.json({ sent, hour })
}
