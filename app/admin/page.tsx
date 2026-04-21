import { getAdminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const admin = getAdminSupabase()

  const [
    { count: usersCount },
    { count: providersCount },
    { count: inactiveCount },
    { count: rabbisCount },
    { count: pendingAppointments },
    { count: deletionRequests },
    { data: recentDeletions },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_active', false),
    admin.from('rabbis').select('*', { count: 'exact', head: true }),
    admin.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('deletion_requests').select('*', { count: 'exact', head: true }).is('handled_at', null),
    admin.from('deletion_requests').select('*').is('handled_at', null).order('requested_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'משתמשות באפליקציה', value: usersCount ?? 0, icon: '👩', href: null },
    { label: 'בעלות עסק פעילות', value: providersCount ?? 0, icon: '💅', href: '/admin/providers' },
    { label: 'בעלות עסק לא פעילות', value: inactiveCount ?? 0, icon: '⚠️', href: '/admin/providers' },
    { label: 'רבנים', value: rabbisCount ?? 0, icon: '✡', href: '/admin/rabbis' },
    { label: 'תורים ממתינים', value: pendingAppointments ?? 0, icon: '📅', href: '/admin/appointments' },
    { label: 'בקשות מחיקה פתוחות', value: deletionRequests ?? 0, icon: '🗑️', href: '/admin/deletion-requests' },
  ]

  return (
    <main className="min-h-screen bg-cream p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-oak tracking-wide">SIEL · ניהול מערכת</h1>
          <p className="text-sm text-textMuted mt-1">גישת אדמין — כל הנתונים</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-beige rounded-2xl p-5">
              {s.href ? (
                <Link href={s.href} className="block group">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-oak group-hover:text-pink transition-colors">{s.value}</div>
                  <div className="text-xs text-textMuted mt-1">{s.label}</div>
                </Link>
              ) : (
                <>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-oak">{s.value}</div>
                  <div className="text-xs text-textMuted mt-1">{s.label}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/admin/providers" className="bg-white border border-beige rounded-2xl p-6 hover:border-pink transition-colors">
            <div className="font-bold text-textMain mb-1">💅 ניהול בעלות עסק</div>
            <p className="text-sm text-textMuted">הפעל / השבת / מחק ספקיות. צפה בסטטוס שדות חובה.</p>
          </Link>
          <Link href="/admin/rabbis" className="bg-white border border-beige rounded-2xl p-6 hover:border-pink transition-colors">
            <div className="font-bold text-textMain mb-1">✡ ניהול רבנים</div>
            <p className="text-sm text-textMuted">הוסף / הסר / עדכן זמינות רבנים.</p>
          </Link>
          <Link href="/admin/deletion-requests" className="bg-white border border-beige rounded-2xl p-6 hover:border-pink transition-colors">
            <div className="font-bold text-textMain mb-1">🗑️ בקשות מחיקת נתונים</div>
            <p className="text-sm text-textMuted">עיין בבקשות מחיקה ועדכן סטטוס טיפול.</p>
          </Link>
          <Link href="/admin/appointments" className="bg-white border border-beige rounded-2xl p-6 hover:border-pink transition-colors">
            <div className="font-bold text-textMain mb-1">📅 ניהול תורים</div>
            <p className="text-sm text-textMuted">צפה בתורים ממתינים, אשר או בטל.</p>
          </Link>
        </div>

        {/* Recent deletion requests */}
        {(recentDeletions ?? []).length > 0 && (
          <div className="bg-white border border-red-100 rounded-2xl p-6">
            <h2 className="font-bold text-textMain mb-4">בקשות מחיקה אחרונות שטרם טופלו</h2>
            <div className="space-y-3">
              {(recentDeletions ?? []).map((r: { id: string; email: string; request_type: string; requested_at: string }) => (
                <div key={r.id} className="flex items-center justify-between text-sm border-b border-beige pb-3 last:border-0">
                  <span className="text-textMain font-medium">{r.email}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.request_type === 'full' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.request_type === 'full' ? 'מחיקה מלאה' : 'חלקית'}
                  </span>
                  <span className="text-textMuted">{new Date(r.requested_at).toLocaleDateString('he-IL')}</span>
                </div>
              ))}
            </div>
            <Link href="/admin/deletion-requests" className="block text-center text-sm text-pink mt-4 hover:underline">
              כל הבקשות ←
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
