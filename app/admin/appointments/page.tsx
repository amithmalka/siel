import { getAdminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminAppointmentsPage() {
  const admin = getAdminSupabase()

  const { data: appointments } = await admin
    .from('appointments')
    .select('id, slot_start, slot_end, status, service_name, service_price, created_at, provider_id, user_id')
    .in('status', ['pending', 'provider_confirmed'])
    .order('slot_start', { ascending: true })
    .limit(100)

  const providerIds = [...new Set((appointments ?? []).map((a: { provider_id: string }) => a.provider_id))]
  const { data: providers } = await admin
    .from('service_providers')
    .select('id, name')
    .in('id', providerIds)

  const providerMap = Object.fromEntries((providers ?? []).map((p: { id: string; name: string }) => [p.id, p.name]))

  return (
    <main className="min-h-screen bg-cream p-4 sm:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-textMuted text-sm hover:text-pink px-2 py-2 inline-block">← חזרה</Link>
          <h1 className="text-2xl font-bold text-oak">תורים ממתינים</h1>
        </div>

        {(appointments ?? []).length === 0 ? (
          <div className="text-center text-textMuted py-16 bg-white border border-beige rounded-2xl">
            אין תורים ממתינים
          </div>
        ) : (
          <div className="space-y-3">
            {(appointments ?? []).map((a: {
              id: string; slot_start: string; slot_end: string; status: string;
              service_name: string | null; service_price: number | null;
              provider_id: string; created_at: string;
            }) => (
              <div key={a.id} className="bg-white border border-beige rounded-2xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-textMain">{providerMap[a.provider_id] ?? a.provider_id}</span>
                      {a.service_name && <span className="text-sm text-textMuted">{a.service_name}</span>}
                      {a.service_price && <span className="text-sm font-semibold text-pink">₪{a.service_price}</span>}
                    </div>
                    <div className="text-xs text-textMuted mt-1">
                      {new Date(a.slot_start).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      {' · '}
                      {new Date(a.slot_start).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {new Date(a.slot_end).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${a.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {a.status === 'pending' ? 'ממתין לאישור' : 'אושר ע"י ספקית'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
