import { getAdminSupabase } from '@/lib/supabase/admin'
import { InboxRealtimeRefresh } from '@/components/rabbi/InboxRealtimeRefresh'
import { InboxList } from '@/components/rabbi/InboxList'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const admin = getAdminSupabase()

  // General inbox: only unclaimed conversations (rabbi_id IS NULL)
  const { data: conversations } = await admin
    .from('conversations')
    .select('id, created_at, user_id')
    .is('rabbi_id', null)
    .order('created_at', { ascending: false })

  return (
    <div dir="rtl">
      <InboxRealtimeRefresh />
      <h1 className="text-2xl font-bold text-textMain mb-2">תיבה כללית</h1>
      <p className="text-sm text-textMuted mb-6">לחיצה על שאלה מושכת אותה אליך — השיחה תופיע ב״השיחות שלי״ בדשבורד</p>
      <InboxList conversations={conversations ?? []} />
    </div>
  )
}
