import { createClient } from '@/lib/supabase/server'
import { AppointmentList } from '@/components/beauty/AppointmentList'
import { cookies } from 'next/headers'
import { getT, type Lang } from '@/lib/i18n/translations'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const lang = ((await cookies()).get('siel-lang')?.value ?? 'he') as Lang
  const t = getT(lang)

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('provider_id', boUser?.linked_entity_id ?? '')
    .order('slot_start', { ascending: true })

  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold text-textMain mb-6">{t.appointmentsTitle}</h1>
      <AppointmentList appointments={appointments ?? []} providerId={boUser?.linked_entity_id ?? ''} />
    </div>
  )
}
