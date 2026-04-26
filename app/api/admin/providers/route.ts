import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  const admin = getAdminSupabase()

  const { data: providers } = await admin
    .from('service_providers')
    .select('id, name, specialty, city, phone, bio, portfolio_paths, is_active')
    .order('name')

  const { data: serviceRows } = await admin
    .from('provider_services')
    .select('provider_id')
    .eq('is_active', true)

  const { data: slotRows } = await admin
    .from('availability_slots')
    .select('provider_id')

  const providerIdsWithServices = new Set((serviceRows ?? []).map((r: { provider_id: string }) => r.provider_id))
  const providerIdsWithSlots = new Set((slotRows ?? []).map((r: { provider_id: string }) => r.provider_id))

  const enriched = (providers ?? []).map((p: { id: string; [key: string]: unknown }) => ({
    ...p,
    has_services: providerIdsWithServices.has(p.id),
    has_slots: providerIdsWithSlots.has(p.id),
  }))

  return NextResponse.json({ providers: enriched })
}

export async function PATCH(request: NextRequest) {
  const { id, is_active } = await request.json()
  const admin = getAdminSupabase()
  await admin.from('service_providers').update({ is_active }).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const admin = getAdminSupabase()

  // Find the auth user id via backoffice_users
  const { data: bu } = await admin
    .from('backoffice_users')
    .select('id')
    .eq('linked_entity_id', id)
    .maybeSingle()

  // Delete DB rows (FK cascades will remove related data)
  await admin.from('service_providers').delete().eq('id', id)

  if (bu?.id) {
    await admin.from('backoffice_users').delete().eq('id', bu.id)
    // Delete from Supabase Auth — removes login access permanently
    await admin.auth.admin.deleteUser(bu.id)
    // TODO: when Stripe is added — cancel subscription here:
    // await stripe.subscriptions.cancel(stripeSubscriptionId)
  }

  return NextResponse.json({ success: true })
}
