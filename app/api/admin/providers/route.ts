import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  const admin = getAdminSupabase()

  const { data: providers } = await admin
    .from('service_providers')
    .select('id, name, specialty, city, address, phone, bio, profile_image_path, portfolio_paths, is_active, is_available, submitted_for_review')
    .order('name')

  const { data: serviceRows } = await admin
    .from('provider_services')
    .select('provider_id, id, name, price, duration_minutes')
    .eq('is_active', true)

  const { data: slotRows } = await admin
    .from('availability_slots')
    .select('provider_id')

  const servicesByProvider = new Map<string, { id: string; name: string; price: number; duration_minutes: number }[]>()
  for (const s of serviceRows ?? []) {
    const arr = servicesByProvider.get(s.provider_id) ?? []
    arr.push({ id: s.id, name: s.name, price: s.price, duration_minutes: s.duration_minutes })
    servicesByProvider.set(s.provider_id, arr)
  }

  const providerIdsWithSlots = new Set((slotRows ?? []).map((r: { provider_id: string }) => r.provider_id))

  const enriched = (providers ?? []).map((p: { id: string; [key: string]: unknown }) => ({
    ...p,
    services: servicesByProvider.get(p.id) ?? [],
    has_slots: providerIdsWithSlots.has(p.id),
  }))

  return NextResponse.json({ providers: enriched })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const admin = getAdminSupabase()

  if ('submitted_for_review' in body) {
    // Reject: clear submitted_for_review flag only
    await admin.from('service_providers')
      .update({ submitted_for_review: false })
      .eq('id', body.id)
  } else {
    // Approve or deactivate: set is_active, clear submitted_for_review
    await admin.from('service_providers')
      .update({ is_active: body.is_active, submitted_for_review: false })
      .eq('id', body.id)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const admin = getAdminSupabase()

  const { data: bu } = await admin
    .from('backoffice_users')
    .select('id')
    .eq('linked_entity_id', id)
    .maybeSingle()

  await admin.from('service_providers').delete().eq('id', id)

  if (bu?.id) {
    await admin.from('backoffice_users').delete().eq('id', bu.id)
    await admin.auth.admin.deleteUser(bu.id)
    // TODO: cancel Stripe subscription here when billing is added
  }

  return NextResponse.json({ success: true })
}
