'use server'

import { getAdminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function addService(providerId: string, name: string, price: number, durationMinutes: number) {
  const admin = getAdminSupabase()
  const { error } = await admin.from('provider_services').insert({
    provider_id: providerId,
    name,
    price,
    duration_minutes: durationMinutes,
    is_active: true,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/beauty/services')
}

export async function deleteService(id: string) {
  const admin = getAdminSupabase()
  const { error } = await admin.from('provider_services').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/beauty/services')
}

export async function toggleService(id: string, isActive: boolean) {
  const admin = getAdminSupabase()
  const { error } = await admin.from('provider_services').update({ is_active: isActive }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/beauty/services')
}
