import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { email, requestType, selectedData } = await request.json() as {
    email: string
    requestType: 'full' | 'partial'
    selectedData: string[]
  }
  if (!email?.trim()) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const admin = getAdminSupabase()

  await admin.from('deletion_requests').insert({
    email: email.trim().toLowerCase(),
    request_type: requestType,
    selected_data: selectedData ?? [],
    requested_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
