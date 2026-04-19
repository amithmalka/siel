import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { ServicesManager } from '@/components/beauty/ServicesManager'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const supabase = await createClient()
  const admin = getAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const providerId = boUser?.linked_entity_id ?? ''

  const { data: services } = await admin
    .from('provider_services')
    .select('id, name, price, duration_minutes, is_active')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: true })

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-textMain mb-2">שירותים ומחירים</h1>
      <p className="text-sm text-textMuted mb-6">הגדירי את השירותים שאת מציעה והמחירים שלהם — הן יופיעו ללקוחות בעת קביעת תור</p>
      <ServicesManager providerId={providerId} initialServices={services ?? []} />
    </div>
  )
}
