'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Check, X, Bell } from 'lucide-react'

type Appt = {
  id: string
  slot_start: string
  slot_end: string
  service_name: string | null
  service_price: number | null
  status: string
  note: string | null
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'היום'
  if (d.toDateString() === tomorrow.toDateString()) return 'מחר'
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'ממתין לאישור',
  provider_confirmed: 'מאושר',
  user_confirmed: 'מאושר סופית',
  cancelled: 'מבוטל',
}
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  provider_confirmed: 'bg-green-100 text-green-700',
  user_confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-beige text-textMuted',
}

export default function BeautyDashboard() {
  const [provider, setProvider] = useState<{ name: string; specialty: string; city: string; is_available: boolean; bio: string | null; portfolio_paths: string[] | null } | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [slotsCount, setSlotsCount] = useState(0)
  const [appointments, setAppointments] = useState<Appt[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [remindingId, setRemindingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [providerId, setProviderId] = useState('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bo } = await supabase.from('backoffice_users').select('linked_entity_id').eq('id', user.id).single()
      if (!bo) return
      const pid = bo.linked_entity_id
      setProviderId(pid)
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      const [{ data: p }, { count: pend }, { count: tod }, { count: slots }, { data: appts }] = await Promise.all([
        supabase.from('service_providers').select('name, specialty, city, is_available, bio, portfolio_paths').eq('id', pid).single(),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', pid).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', pid).eq('status', 'provider_confirmed').gte('slot_start', today).lt('slot_start', tomorrow),
        supabase.from('availability_slots').select('*', { count: 'exact', head: true }).eq('provider_id', pid),
        supabase.from('appointments').select('id, slot_start, slot_end, service_name, service_price, status, note')
          .eq('provider_id', pid)
          .neq('status', 'cancelled')
          .gte('slot_start', today)
          .order('slot_start', { ascending: true })
          .limit(30),
      ])

      setProvider(p)
      setPendingCount(pend ?? 0)
      setTodayCount(tod ?? 0)
      setSlotsCount(slots ?? 0)
      setAppointments(appts ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const missingFields: { label: string; href: string }[] = []
  if (!loading && provider) {
    if (!provider.bio?.trim()) missingFields.push({ label: 'קצת עלייך (ביו)', href: '/beauty/profile' })
    if (!provider.portfolio_paths?.length) missingFields.push({ label: 'תמונות עבודה', href: '/beauty/portfolio' })
    if (!slotsCount) missingFields.push({ label: 'שעות זמינות', href: '/beauty/availability' })
  }

  async function respond(id: string, action: 'confirm' | 'cancel') {
    setLoadingId(id)
    try {
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, action }),
      })
      if (!res.ok) throw new Error()
      setAppointments((prev) => prev.map((a) =>
        a.id === id ? { ...a, status: action === 'confirm' ? 'provider_confirmed' : 'cancelled' } : a
      ).filter((a) => a.status !== 'cancelled'))
      if (action === 'confirm') setPendingCount((n) => Math.max(0, n - 1))
      toast.success(action === 'confirm' ? 'התור אושר' : 'התור בוטל')
    } catch {
      toast.error('שגיאה. נסי שוב.')
    } finally {
      setLoadingId(null)
    }
  }

  async function sendReminder(id: string) {
    setRemindingId(id)
    try {
      const res = await fetch('/api/appointments/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
      })
      const json = await res.json()
      if (json.sent) toast.success('התזכורת נשלחה ✅')
      else toast('התזכורת לא נשלחה — הלקוחה לא פעילה עם התראות', { icon: 'ℹ️' })
    } catch {
      toast.error('שגיאה בשליחת תזכורת')
    } finally {
      setRemindingId(null)
    }
  }

  // Group appointments by day
  const grouped: { day: string; appts: Appt[] }[] = []
  for (const appt of appointments) {
    const day = appt.slot_start.split('T')[0]
    const last = grouped[grouped.length - 1]
    if (last && last.day === day) last.appts.push(appt)
    else grouped.push({ day, appts: [appt] })
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6" dir="rtl">
        <div className="h-8 w-48 bg-beige rounded-xl" />
        <div className="h-4 w-32 bg-beige rounded-lg" />
        <div className="grid grid-cols-3 gap-3 max-w-2xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-beige rounded-2xl p-6">
              <div className="h-3 w-24 bg-beige rounded mb-3" />
              <div className="h-10 w-12 bg-beige rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl">
      {missingFields.length > 0 && (
        <div className="max-w-2xl mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 mb-1">הפרופיל שלך לא מוכן להצגה ללקוחות</p>
              <p className="text-xs text-amber-700 mb-3">כדי להופיע בחיפוש באפליקציה, יש למלא את השדות הבאים:</p>
              <ul className="space-y-1.5">
                {missingFields.map((f) => (
                  <li key={f.href}>
                    <Link href={f.href} className="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg px-3 py-1.5 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {f.label} ←
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-textMain mb-1">שלום, {provider?.name ?? ''}</h1>
      <p className="text-textMuted mb-8">{provider?.specialty} · {provider?.city}</p>

      <div className="grid grid-cols-3 gap-3 max-w-2xl mb-10">
        <div className="bg-white border border-beige rounded-2xl p-4 sm:p-6">
          <p className="text-textMuted text-xs sm:text-sm mb-2">ממתינות לאישור</p>
          <p className="text-3xl sm:text-4xl font-bold text-pink">{pendingCount}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-4 sm:p-6">
          <p className="text-textMuted text-xs sm:text-sm mb-2">תורים היום</p>
          <p className="text-3xl sm:text-4xl font-bold text-oak">{todayCount}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-4 sm:p-6">
          <p className="text-textMuted text-xs sm:text-sm mb-2">סטטוס</p>
          <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${provider?.is_available ? 'bg-green-100 text-green-700' : 'bg-beige text-textMuted'}`}>
            {provider?.is_available ? 'פעילה' : 'לא זמינה'}
          </span>
        </div>
      </div>

      {/* Upcoming appointments calendar */}
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-textMain mb-4">תורים קרובים</h2>
        {grouped.length === 0 ? (
          <div className="bg-white border border-beige rounded-2xl p-8 text-center">
            <p className="text-textMuted text-sm">אין תורים קרובים</p>
            <Link href="/beauty/availability" className="mt-3 inline-block text-xs text-pink hover:underline">הגדרי שעות זמינות ←</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(({ day, appts }) => (
              <div key={day}>
                <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">
                  {formatDay(appts[0].slot_start)}
                </p>
                <div className="space-y-2">
                  {appts.map((appt) => (
                    <div key={appt.id} className="bg-white border border-beige rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-textMain tabular-nums">
                              {formatTime(appt.slot_start)} – {formatTime(appt.slot_end)}
                            </span>
                            {appt.service_name && (
                              <span className="text-xs text-pink bg-pink/10 rounded-full px-2 py-0.5 truncate max-w-[140px]">
                                {appt.service_name}{appt.service_price ? ` · ₪${appt.service_price}` : ''}
                              </span>
                            )}
                          </div>
                          {appt.note && <p className="text-xs text-textMuted mt-1 truncate">{appt.note}</p>}
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_COLOR[appt.status]}`}>
                          {STATUS_LABEL[appt.status]}
                        </span>
                      </div>

                      {appt.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => respond(appt.id, 'confirm')}
                            disabled={loadingId === appt.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-oak text-white text-xs font-medium py-2 rounded-xl hover:opacity-90 disabled:opacity-60"
                          >
                            <Check size={12} /> אשרי תור
                          </button>
                          <button
                            onClick={() => respond(appt.id, 'cancel')}
                            disabled={loadingId === appt.id}
                            className="flex items-center justify-center gap-1.5 border border-beige text-textMuted text-xs font-medium px-3 py-2 rounded-xl hover:bg-cream disabled:opacity-60"
                          >
                            <X size={12} /> בטלי
                          </button>
                        </div>
                      )}

                      {(appt.status === 'provider_confirmed' || appt.status === 'user_confirmed') && (
                        <div className="mt-3">
                          <button
                            onClick={() => sendReminder(appt.id)}
                            disabled={remindingId === appt.id}
                            className="flex items-center gap-1.5 text-xs text-textMuted border border-beige rounded-xl px-3 py-2 hover:bg-cream disabled:opacity-60 transition-colors"
                          >
                            <Bell size={11} />
                            {remindingId === appt.id ? 'שולחת...' : 'שליחת תזכורת ללקוחה'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
