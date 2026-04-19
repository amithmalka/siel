import { createClient } from '@/lib/supabase/server'
import { getAdminSupabase } from '@/lib/supabase/admin'
import { ChatPane } from '@/components/rabbi/ChatPane'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ conversationId: string }>
}

export default async function ChatPage({ params }: Props) {
  const { conversationId } = await params
  const supabase = await createClient()
  const admin = getAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const rabbiId = boUser?.linked_entity_id ?? ''

  // Auto-claim: assign this rabbi if not yet claimed
  if (rabbiId) {
    await admin
      .from('conversations')
      .update({ rabbi_id: rabbiId })
      .eq('id', conversationId)
      .is('rabbi_id', null)
  }

  const { data: conv } = await admin
    .from('conversations')
    .select('rabbi_id')
    .eq('id', conversationId)
    .single()

  const { data: messages } = await admin
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const isAssignedToMe = conv?.rabbi_id === rabbiId
  const isAssignedToOther = !!conv?.rabbi_id && !isAssignedToMe

  // If claimed by another rabbi, send back to inbox immediately
  if (isAssignedToOther) redirect('/rabbi/inbox')

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-4" dir="rtl">
        <a href="/rabbi" className="text-textMuted text-sm hover:text-textMain">← חזרה לדשבורד</a>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-xl font-bold text-textMain">שאלה #{conversationId.slice(0, 8)}</h1>
          {isAssignedToMe && (
            <span className="text-xs bg-oak/10 text-oak px-3 py-1 rounded-full">השיחה שלך</span>
          )}
        </div>
      </div>
      <ChatPane
        conversationId={conversationId}
        rabbiId={rabbiId}
        initialMessages={messages ?? []}
        canEnd={isAssignedToMe}
      />
    </div>
  )
}
