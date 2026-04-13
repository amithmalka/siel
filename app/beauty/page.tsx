import { createClient } from '@/lib/supabase/server'

export default async function BeautyDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const { data: provider } = await supabase
    .from('service_providers')
    .select('name, specialty, city, is_available')
    .eq('id', boUser?.linked_entity_id ?? '')
    .single()

  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', boUser?.linked_entity_id ?? '')
    .eq('status', 'pending')

  const { count: todayCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('provider_id', boUser?.linked_entity_id ?? '')
    .eq('status', 'provider_confirmed')
    .gte('slot_start', new Date().toISOString().split('T')[0])
    .lt('slot_start', new Date(Date.now() + 86400000).toISOString().split('T')[0])

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-bold text-textMain mb-1">שלום, {provider?.name ?? 'בעלת מקצוע'}</h1>
      <p className="text-textMuted mb-8">{provider?.specialty} · {provider?.city}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">ממתינות לאישור</p>
          <p className="text-4xl font-bold text-pink">{pendingCount ?? 0}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">תורים היום</p>
          <p className="text-4xl font-bold text-oak">{todayCount ?? 0}</p>
        </div>
        <div className="bg-white border border-beige rounded-2xl p-6">
          <p className="text-textMuted text-sm mb-2">סטטוס</p>
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${provider?.is_available ? 'bg-green-100 text-green-700' : 'bg-beige text-textMuted'}`}>
            {provider?.is_available ? 'זמינה' : 'לא זמינה'}
          </span>
        </div>
      </div>
    </div>
  )
}
