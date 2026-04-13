import { createClient } from '@/lib/supabase/server'
import { PortfolioGrid } from '@/components/beauty/PortfolioGrid'

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const { data: provider } = await supabase
    .from('service_providers')
    .select('portfolio_paths')
    .eq('id', boUser?.linked_entity_id ?? '')
    .single()

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-textMain mb-2">פורטפוליו</h1>
      <p className="text-textMuted text-sm mb-6">הוסיפי תמונות עבודה שיוצגו ללקוחות באפליקציה</p>
      <PortfolioGrid
        providerId={boUser?.linked_entity_id ?? ''}
        initialPaths={provider?.portfolio_paths ?? []}
      />
    </div>
  )
}
