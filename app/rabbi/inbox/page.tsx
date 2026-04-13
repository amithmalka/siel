import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, created_at, user_id')
    .eq('rabbi_id', boUser?.linked_entity_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-textMain mb-6">תיבת הודעות</h1>
      {!conversations?.length && (
        <p className="text-textMuted">אין שיחות עדיין.</p>
      )}
      <div className="space-y-3 max-w-2xl">
        {conversations?.map((conv) => (
          <Link
            key={conv.id}
            href={`/rabbi/inbox/${conv.id}`}
            className="flex items-center justify-between bg-white border border-beige rounded-2xl px-6 py-4 hover:border-pink transition-all"
          >
            <div>
              <p className="text-sm font-medium text-textMain">שיחה #{conv.id.slice(0, 8)}</p>
              <p className="text-xs text-textMuted mt-0.5">
                {new Date(conv.created_at).toLocaleDateString('he-IL')}
              </p>
            </div>
            <span className="text-textMuted text-lg">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
