'use server'

import { getAdminSupabase } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function sendRabbiMessage(
  conversationId: string,
  rabbiId: string,
  content: string,
) {
  const admin = getAdminSupabase()
  const { data, error } = await admin.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_id: rabbiId,
    sender_type: 'rabbi',
    content,
    is_encrypted: true,
  }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function endConversation(conversationId: string) {
  const admin = getAdminSupabase()
  await admin.from('chat_messages').delete().eq('conversation_id', conversationId)
  await admin.from('conversations').delete().eq('id', conversationId)
  redirect('/rabbi')
}
