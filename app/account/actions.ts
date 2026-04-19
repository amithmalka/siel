'use server'

import { getAdminSupabase } from '@/lib/supabase/admin'

export async function deleteAccount(userId: string, role: 'beauty_pro' | 'rabbi') {
  const admin = getAdminSupabase()

  // Get linked entity id
  const { data: bo } = await admin
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', userId)
    .single()

  const entityId = bo?.linked_entity_id

  if (entityId) {
    if (role === 'beauty_pro') {
      // Remove from search but keep historical data
      await admin
        .from('service_providers')
        .update({ is_active: false, user_id: null })
        .eq('id', entityId)
    } else {
      // Remove rabbi from availability
      await admin
        .from('rabbis')
        .update({ is_available: false, user_id: null })
        .eq('id', entityId)
    }
  }

  // Remove backoffice access
  await admin.from('backoffice_users').delete().eq('id', userId)

  // Delete auth user so they can re-register in the future
  await admin.auth.admin.deleteUser(userId)
}
