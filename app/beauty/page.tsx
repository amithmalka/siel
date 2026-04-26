'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function BeautyDashboard() {
  const [provider, setProvider] = useState<{ name: string; specialty: string; city: string; is_available: boolean; bio: string | null; portfolio_paths: string[] | null } | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [slotsCount, setSlotsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bo } = await supabase.from('backoffice_users').select('linked_entity_id').eq('id', user.id).single()
      if (!bo) return
      const providerId = bo.linked_entity_id
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

      const [{ data: p }, { count: pend }, { count: tod }, { count: slots }] = await Promise.all([
        supabase.from('service_providers').select('name, specialty, city, is_available, bio, portfolio_paths').eq('id', providerId).single(),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('status', 'provider_confirmed').gte('slot_start', today).lt('slot_start', tomorrow),
        supabase.from('availability_slots').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
      ])

      setProvider(p)
      setPendingCount(pend ?? 0)
      setTodayCount(tod ?? 0)
      setSlotsCount(slots ?? 0)
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6" dir="rtl">
        <div className="h-8 w-48 bg-beige rounded-xl" />
        <div className="h-4 w-32 bg-beige rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
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

      <div className="max-w-2xl bg-gradient-to-br from-pink/5 to-white border border-pink/20 rounded-2xl p-5 sm:p-7" dir="rtl">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">✨</span>
          <h2 className="text-base sm:text-lg font-bold text-textMain">איך עובד מערכת התורים?</h2>
        </div>
        <div className="space-y-4">
          {[
            { n: '1', title: 'לקוחה קובעת תור', desc: 'הלקוחה בוחרת שירות, תאריך ושעה — הבקשה מגיעה אלייך כ״ממתינה לאישור״' },
            { n: '2', title: 'את מאשרת את התור', desc: 'לחיצה על ״אשרי תור״ שולחת התראה ישירות לנייד של הלקוחה' },
            { n: '3', title: 'כפילויות מתבטלות אוטומטית', desc: 'ברגע שאישרת בקשה אחת, שאר הבקשות של אותה לקוחה לאותו שירות מתבטלות' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-pink/15 text-pink flex items-center justify-center text-sm font-bold flex-shrink-0">{n}</div>
              <div>
                <p className="text-sm font-semibold text-textMain">{title}</p>
                <p className="text-xs text-textMuted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 bg-pink/10 border border-pink/20 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-pink mb-1">⚡ שווה להיות ראשונה לאשר</p>
          <p className="text-xs text-textMuted leading-relaxed">לקוחות שולחות בקשות לכמה בעלות מקצוע בו-זמנית. מי שמאשרת ראשונה — מקבלת את הלקוחה.</p>
        </div>
      </div>
    </div>
  )
}
