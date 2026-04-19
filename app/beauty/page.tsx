import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getT, type Lang } from '@/lib/i18n/translations'
import Link from 'next/link'

export default async function BeautyDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const lang = ((await cookies()).get('siel-lang')?.value ?? 'he') as Lang
  const t = getT(lang)

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const providerId = boUser?.linked_entity_id ?? ''
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: provider },
    { count: pendingCount },
    { count: todayCount },
    { count: slotsCount },
  ] = await Promise.all([
    supabase.from('service_providers').select('name, specialty, city, is_available, bio, portfolio_paths').eq('id', providerId).single(),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('status', 'pending'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('status', 'provider_confirmed').gte('slot_start', today).lt('slot_start', new Date(Date.now() + 86400000).toISOString().split('T')[0]),
    supabase.from('availability_slots').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
  ])

  const missingFields: { label: string; href: string }[] = []
  if (!provider?.bio?.trim()) missingFields.push({ label: 'קצת עלייך (ביו)', href: '/beauty/profile' })
  if (!provider?.portfolio_paths?.length) missingFields.push({ label: 'תמונות עבודה', href: '/beauty/portfolio' })
  if (!slotsCount) missingFields.push({ label: 'שעות זמינות', href: '/beauty/availability' })

  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {missingFields.length > 0 && (
        <div className="max-w-2xl mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5" dir="rtl">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 mb-1">הפרופיל שלך לא מוכן להצגה ללקוחות</p>
              <p className="text-xs text-amber-700 mb-3">כדי להופיע בחיפוש באפליקציה, יש למלא את השדות הבאים:</p>
              <ul className="space-y-1.5">
                {missingFields.map((f) => (
                  <li key={f.href}>
                    <Link
                      href={f.href}
                      className="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
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

      <h1 className="text-3xl font-bold text-textMain mb-1">{t.hello}, {provider?.name ?? t.beautyPro}</h1>
      <p className="text-textMuted mb-8">{provider?.specialty} · {provider?.city}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mb-10">
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">{t.pendingApproval}</p>
          <p className="text-4xl font-bold text-pink">{pendingCount ?? 0}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">{t.todayAppointments}</p>
          <p className="text-4xl font-bold text-oak">{todayCount ?? 0}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">{t.status}</p>
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${provider?.is_available ? 'bg-green-100 text-green-700' : 'bg-beige text-textMuted'}`}>
            {provider?.is_available ? t.available : t.notAvailable}
          </span>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-2xl bg-gradient-to-br from-pink/5 to-white border border-pink/20 rounded-2xl p-7" dir="rtl">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">✨</span>
          <h2 className="text-lg font-bold text-textMain">איך עובד מערכת התורים?</h2>
        </div>

        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-pink/15 text-pink flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <div>
              <p className="text-sm font-semibold text-textMain">לקוחה קובעת תור</p>
              <p className="text-xs text-textMuted mt-0.5">הלקוחה בוחרת שירות, תאריך ושעה — הבקשה מגיעה אלייך כ״ממתינה לאישור״</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-pink/15 text-pink flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <div>
              <p className="text-sm font-semibold text-textMain">את מאשרת את התור</p>
              <p className="text-xs text-textMuted mt-0.5">לחיצה על ״אשרי תור״ שולחת התראה ישירות לנייד של הלקוחה</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-pink/15 text-pink flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <div>
              <p className="text-sm font-semibold text-textMain">כפילויות מתבטלות אוטומטית</p>
              <p className="text-xs text-textMuted mt-0.5">אם הלקוחה שלחה כמה בקשות לאותו שירות — ברגע שאישרת אחת, כל השאר מתבטלות לבד. לא צריך לעשות כלום</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-pink/10 border border-pink/20 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-pink mb-1">⚡ שווה להיות ראשונה לאשר</p>
          <p className="text-xs text-textMuted leading-relaxed">
            לקוחות שולחות בקשות לכמה בעלות מקצוע בו-זמנית. מי שמאשרת ראשונה — מקבלת את הלקוחה.
            ברגע שאת מאשרת, שאר הבקשות שהלקוחה שלחה לאותו שירות מתבטלות אצלה אוטומטית.
          </p>
        </div>
      </div>
    </div>
  )
}
