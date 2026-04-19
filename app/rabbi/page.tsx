import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { getT, type Lang } from '@/lib/i18n/translations'
import Link from 'next/link'

export default async function RabbiDashboard() {
  const supabase = await createClient()
  const admin = getAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const lang = ((await cookies()).get('siel-lang')?.value ?? 'he') as Lang
  const t = getT(lang)

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const rabbiId = boUser?.linked_entity_id ?? ''

  // Fetch rabbi info, my conversations, and pending count in parallel
  const [
    { data: rabbi },
    { data: myConversations },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from('rabbis').select('name, specialty').eq('id', rabbiId).single(),
    admin.from('conversations').select('id, created_at').eq('rabbi_id', rabbiId).order('created_at', { ascending: false }).limit(10),
    admin.from('conversations').select('*', { count: 'exact', head: true }).is('rabbi_id', null),
  ])

  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-textMain mb-1">{t.hello}, {rabbi?.name ?? t.rabbi}</h1>
      <p className="text-textMuted mb-8">{rabbi?.specialty}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-10">
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">שאלות ממתינות</p>
          <p className="text-4xl font-bold text-oak">{pendingCount ?? 0}</p>
          <a href="/rabbi/inbox" className="text-oak text-sm font-medium hover:underline mt-2 inline-block">
            לתיבה הכללית ←
          </a>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">השיחות שלי</p>
          <p className="text-4xl font-bold text-oak">{myConversations?.length ?? 0}</p>
        </div>
      </div>

      {(myConversations?.length ?? 0) > 0 && (
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-textMain mb-4">השיחות שלי</h2>
          <div className="space-y-3">
            {myConversations!.map((conv) => (
              <Link
                key={conv.id}
                href={`/rabbi/inbox/${conv.id}`}
                className="flex items-center justify-between bg-white border border-beige rounded-2xl px-6 py-4 hover:border-oak transition-all"
              >
                <div>
                  <p className="text-sm font-medium text-textMain">שיחה #{conv.id.slice(0, 8)}</p>
                  <p className="text-xs text-textMuted mt-0.5">
                    {new Date(conv.created_at).toLocaleDateString('he-IL', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="text-textMuted text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
