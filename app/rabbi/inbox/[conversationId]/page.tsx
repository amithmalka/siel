import { createClient } from '@/lib/supabase/server'
import { ChatPane } from '@/components/rabbi/ChatPane'

interface Props {
  params: { conversationId: string }
}

export default async function ChatPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boUser } = await supabase
    .from('backoffice_users')
    .select('linked_entity_id')
    .eq('id', user!.id)
    .single()

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', params.conversationId)
    .order('created_at', { ascending: true })

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-4" dir="rtl">
        <a href="/rabbi/inbox" className="text-textMuted text-sm hover:text-textMain">← חזרה לתיבה</a>
        <h1 className="text-xl font-bold text-textMain mt-2">שיחה #{params.conversationId.slice(0, 8)}</h1>
      </div>
      <ChatPane
        conversationId={params.conversationId}
        rabbiId={boUser?.linked_entity_id ?? ''}
        initialMessages={messages ?? []}
      />
    </div>
  )
}
