import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { ProfileForm, ProfileData } from './ProfileForm'

export const dynamic = 'force-dynamic'

export default async function BeautyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = getAdminSupabase()

  const { data: bo } = await admin
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const providerId = bo?.linked_entity_id ?? ''

  const [{ data: p }, { count: slots }] = await Promise.all([
    admin.from('service_providers').select('*').eq('id', providerId).single(),
    admin.from('availability_slots').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
  ])

  const initial: ProfileData = {
    userId: user!.id,
    providerId,
    name: p?.name ?? '',
    specialty: p?.specialty ?? '',
    city: p?.city ?? '',
    address: p?.address ?? '',
    phone: p?.phone ?? '',
    bio: p?.bio ?? '',
    profileImagePath: p?.profile_image_path ?? '',
    portfolioPaths: p?.portfolio_paths ?? [],
    isAvailable: p?.is_available ?? true,
    submittedForReview: p?.submitted_for_review ?? false,
    hasSlots: (slots ?? 0) > 0,
  }

  return <ProfileForm initial={initial} />
}
