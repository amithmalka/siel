'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatMessage } from '@/lib/types'
import { Send } from 'lucide-react'
import { sendRabbiMessage, endConversation } from '@/app/rabbi/actions'

interface Props {
  conversationId: string
  rabbiId: string
  initialMessages: ChatMessage[]
  readonly?: boolean
  canEnd?: boolean
}

export function ChatPane({ conversationId, rabbiId, initialMessages, readonly = false, canEnd = false }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
if (!text || sending || readonly) return
    setSending(true)
    setInput('')

    try {
      const newMsg = await sendRabbiMessage(conversationId, rabbiId, text)
      if (newMsg) setMessages((prev) => [...prev, newMsg])
    } catch (e) {
      console.error('sendRabbiMessage error:', e)
      alert('שגיאה בשליחת הודעה: ' + (e instanceof Error ? e.message : String(e)))
      setInput(text)
    }

    setSending(false)
  }

  return (
    <div className="flex flex-col flex-1 bg-white border border-beige rounded-2xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((msg) => {
          const isRabbi = msg.sender_type === 'rabbi'
          return (
            <div key={msg.id} className={`flex ${isRabbi ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  isRabbi
                    ? 'bg-oak text-white rounded-br-sm'
                    : 'bg-cream text-textMain rounded-bl-sm'
                }`}
                dir="rtl"
              >
                {msg.content}
                <p className={`text-xs mt-1 ${isRabbi ? 'text-white/60' : 'text-textMuted'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {readonly ? (
        <div className="border-t border-beige p-4 text-center text-sm text-textMuted" dir="rtl">
          שיחה זו כבר טופלה על ידי רב אחר
        </div>
      ) : (
        <div className="border-t border-beige p-4 flex flex-col gap-2">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="כתוב תשובה..."
              dir="rtl"
              className="flex-1 bg-cream border border-beige rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-oak"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="bg-oak text-white w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          {canEnd && (
            <form action={endConversation.bind(null, conversationId)}>
              <button
                type="submit"
                className="w-full text-sm text-red-500 border border-red-200 rounded-xl py-2 hover:bg-red-50 transition-colors"
                dir="rtl"
              >
                סיים שיחה ומחק
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
