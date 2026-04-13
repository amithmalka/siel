import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { userId, providerId } = await request.json()

  // Create or retrieve Stripe customer
  const { data: boUser } = await getAdminSupabase()
    .from('backoffice_users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  let customerId = boUser?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ metadata: { userId } })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'ils',
          recurring: { interval: 'month' },
          product_data: { name: 'SIEL · מנוי בעלת מקצוע', description: 'גישה מלאה לדשבורד ניהול' },
          unit_amount: 10000, // 100 ILS in agorot
        },
        quantity: 1,
      },
    ],
    metadata: { userId, providerId },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?role=beauty_pro&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?role=beauty_pro`,
  })

  // Upsert backoffice_user with stripe_customer_id and providerId
  await getAdminSupabase().from('backoffice_users').upsert({
    id: userId,
    role: 'beauty_pro',
    linked_entity_id: providerId,
    stripe_customer_id: customerId,
    subscription_status: 'inactive',
  })

  return NextResponse.json({ url: session.url })
}
