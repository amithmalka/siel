import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'
import { SubmitReviewButton } from './SubmitReviewButton'

export const dynamic = 'force-dynamic'

export default async function BeautySetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = getAdminSupabase()

  const { data: boUser } = await admin
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const providerId = boUser?.linked_entity_id

  const [{ data: sp }, { count: svcCount }, { count: slotCount }] = await Promise.all([
    admin.from('service_providers').select('bio, portfolio_paths, submitted_for_review, is_active').eq('id', providerId).single(),
    admin.from('provider_services').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('is_active', true),
    admin.from('availability_slots').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
  ])

  const submittedForReview = sp?.submitted_for_review ?? false
  const isActive = sp?.is_active ?? false

  const steps = [
    {
      key: 'bio',
      label: 'קצת עלייך (ביו)',
      desc: 'כמה מילים על העסק שלך, הניסיון שלך, וסגנון העבודה שלך.',
      done: !!(sp?.bio?.trim()),
      href: '/beauty/profile',
    },
    {
      key: 'portfolio',
      label: 'תמונות עבודה',
      desc: 'העלי לפחות תמונה אחת מתוצאות העבודה שלך.',
      done: !!(sp?.portfolio_paths?.length),
      href: '/beauty/portfolio',
    },
    {
      key: 'services',
      label: 'שירותים ומחירים',
      desc: 'הוסיפי את השירותים שאת מציעה עם מחיר ומשך זמן.',
      done: (svcCount ?? 0) > 0,
      href: '/beauty/services',
    },
    {
      key: 'slots',
      label: 'שעות זמינות',
      desc: 'הגדירי את הימים והשעות שבהן את פנויה לתורים.',
      done: (slotCount ?? 0) > 0,
      href: '/beauty/availability',
    },
  ]

  const completed = steps.filter((s) => s.done).length
  const allDone = completed === steps.length

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-oak mb-1">SIEL</h1>
          <h2 className="text-lg font-semibold text-textMain mt-4">השלמת פרופיל</h2>
          <p className="text-sm text-textMuted mt-2">
            כדי להופיע באפליקציה ולקבל תורים, יש להשלים את כל הפרטים הבאים.
          </p>
        </div>

        {!isActive && (
          <div className="bg-white border border-beige rounded-2xl p-5 mb-4">
            <div className="flex justify-between text-xs text-textMuted mb-2">
              <span>{completed} מתוך {steps.length} שלבים הושלמו</span>
              <span>{Math.round((completed / steps.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-beige rounded-full overflow-hidden">
              <div
                className="h-full bg-pink rounded-full transition-all duration-500"
                style={{ width: `${(completed / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {!isActive && (
          <div className="space-y-3">
            {steps.map((s) => (
              <Link key={s.key} href={s.href}>
                <div className={`bg-white border rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-all ${s.done ? 'border-green-200' : 'border-beige hover:border-pink'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${s.done ? 'bg-green-100' : 'bg-pink-pale'}`}>
                    {s.done ? '✅' : '○'}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${s.done ? 'text-green-700' : 'text-textMain'}`}>{s.label}</p>
                    <p className="text-xs text-textMuted mt-0.5">{s.desc}</p>
                  </div>
                  {!s.done && <span className="text-pink text-xs font-semibold">← מלאי</span>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {isActive ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <p className="text-3xl mb-2">🎉</p>
              <h3 className="font-bold text-green-800 mb-1">הפרופיל שלך אושר!</h3>
              <p className="text-sm text-green-700">את מופיעה באפליקציה ויכולה להתחיל לקבל לקוחות.</p>
            </div>
            <Link href="/beauty" className="block w-full bg-pink text-white text-center font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity">
              כניסה לדשבורד ←
            </Link>
          </div>
        ) : submittedForReview ? (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">⏳</p>
            <h3 className="font-bold text-amber-800 mb-1">הבקשה שלך נשלחה לאישור</h3>
            <p className="text-sm text-amber-700">הנהלת SIEL תבדוק את הפרופיל שלך ותאשר בהקדם.</p>
            <p className="text-xs text-amber-600 mt-3">בינתיים תוכלי לעדכן פרטים — הם יישמרו לפרופיל שלך.</p>
          </div>
        ) : allDone ? (
          <SubmitReviewButton />
        ) : null}

        <p className="text-center text-xs text-textMuted mt-6">
          לשאלות: <a href="mailto:siel.app.contact@gmail.com" className="text-pink hover:underline">siel.app.contact@gmail.com</a>
        </p>
      </div>
    </main>
  )
}
