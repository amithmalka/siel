import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'לא מחוברת' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file') as File | null
  const bucket = (form.get('bucket') as string) || 'service-portfolios'
  const path = form.get('path') as string | null

  if (!file || !path) return NextResponse.json({ error: 'חסרים שדות' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await getAdminSupabase().storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ path })
}
