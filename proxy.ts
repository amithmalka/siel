import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Public paths
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/for-beauty') || pathname.startsWith('/privacy') || pathname.startsWith('/delete-account') || pathname.startsWith('/about-app')) {
    return supabaseResponse
  }

  // Require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get backoffice_user role
  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  // No backoffice profile yet → onboarding
  if (!boUser && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Role guards
  if (boUser) {
    if (pathname.startsWith('/admin') && boUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/rabbi') && boUser.role !== 'rabbi' && boUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/beauty')) {
      if (boUser.role !== 'beauty_pro' && boUser.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
      if (boUser.role === 'beauty_pro') {
        if (boUser.subscription_status !== 'active' && boUser.subscription_status !== 'trialing') {
          return NextResponse.redirect(new URL('/onboarding?step=payment', request.url))
        }
        // Allow access to setup pages so the pro can fill in required fields
        const SETUP_PATHS = ['/beauty/setup', '/beauty/profile', '/beauty/portfolio', '/beauty/availability', '/beauty/services']
        const onSetupPage = SETUP_PATHS.some((p) => pathname.startsWith(p))
        if (!onSetupPage) {
          // Check if profile is complete: bio + portfolio + at least 1 service + at least 1 slot
          const { data: boUserFull } = await supabase
            .from('backoffice_users')
            .select('linked_entity_id')
            .eq('id', user.id)
            .single()
          const providerId = boUserFull?.linked_entity_id
          if (providerId) {
            const [{ data: sp }, { count: svcCount }, { count: slotCount }] = await Promise.all([
              supabase.from('service_providers').select('bio, portfolio_paths').eq('id', providerId).single(),
              supabase.from('provider_services').select('*', { count: 'exact', head: true }).eq('provider_id', providerId).eq('is_active', true),
              supabase.from('availability_slots').select('*', { count: 'exact', head: true }).eq('provider_id', providerId),
            ])
            const complete = sp?.bio?.trim() && sp?.portfolio_paths?.length > 0 && (svcCount ?? 0) > 0 && (slotCount ?? 0) > 0
            if (!complete) {
              return NextResponse.redirect(new URL('/beauty/setup', request.url))
            }
          }
        }
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
