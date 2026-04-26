import { NextRequest, NextResponse } from 'next/server'
import { getAdminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  const admin = getAdminSupabase()
  const { data: posts } = await admin
    .from('forum_posts')
    .select('id, anonymous_handle, title, content, category, reply_count, created_at')
    .order('created_at', { ascending: false })
  return NextResponse.json({ posts: posts ?? [] })
}

export async function POST(request: NextRequest) {
  const { title, content, category } = await request.json()
  if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const admin = getAdminSupabase()
  const { data, error } = await admin
    .from('forum_posts')
    .insert({ anonymous_handle: 'SIEL', title, content, category: category || 'כללי' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const admin = getAdminSupabase()
  // Delete replies first (FK)
  await admin.from('forum_replies').delete().eq('post_id', id)
  await admin.from('forum_posts').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
