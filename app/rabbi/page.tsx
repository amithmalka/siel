import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { getT, type Lang } from '@/lib/i18n/translations'

export default async function RabbiDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const lang = ((await cookies()).get('siel-lang')?.value ?? 'he') as Lang
  const t = getT(lang)

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const { data: rabbi } = await supabase
    .from('rabbis')
    .select('name, specialty')
    .eq('id', boUser?.linked_entity_id ?? '')
    .single()

  const { count: totalConvs } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('rabbi_id', boUser?.linked_entity_id ?? '')

  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-textMain mb-1">{t.hello}, {rabbi?.name ?? t.rabbi}</h1>
      <p className="text-textMuted mb-8">{rabbi?.specialty}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">{t.activeConversations}</p>
          <p className="text-4xl font-bold text-oak">{totalConvs ?? 0}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">{t.inbox}</p>
          <a href="/rabbi/inbox" className="text-pink text-sm font-medium hover:underline">
            {t.viewMessages}
          </a>
        </div>
      </div>
    </div>
  )
}
