'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function updatePortfolioPaths(paths: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = getAdminSupabase()
  const { data: bo } = await admin
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user.id)
    .single()

  if (!bo?.linked_entity_id) throw new Error('Provider not found')

  const { error } = await admin
    .from('service_providers')
    .update({ portfolio_paths: paths })
    .eq('id', bo.linked_entity_id)

  if (error) throw new Error(error.message)
  revalidatePath('/beauty/setup')
}
