import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import PushSubscriber from '@/components/PushSubscriber'

export default async function RabbiLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?role=rabbi')

  const { data: bu } = await getAdminSupabase()
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="flex min-h-screen">
      <Sidebar role="rabbi" />
      <main className="md:ml-64 flex-1 pt-14 md:pt-0 pb-16 md:pb-0 p-4 md:p-8 bg-cream min-h-screen">
        {children}
      </main>
      {bu?.linked_entity_id && (
        <PushSubscriber role="rabbi" entityId={bu.linked_entity_id} />
      )}
    </div>
  )
}
