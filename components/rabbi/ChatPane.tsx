'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatMessage } from '@/lib/types'
import { Send } from 'lucide-react'

interface Props {
  conversationId: string
  rabbiId: string
  initialMessages: ChatMessage[]
}

export function ChatPane({ conversationId, rabbiId, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // rabbiId is used to identify the rabbi context; kept for future use
  void rabbiId

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
    if (!text || sending) return
    setSending(true)
    setInput('')
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'rabbi',
      content: text,
    })
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
      <div className="border-t border-beige p-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="כתבי הודעה..."
          dir="rtl"
          className="flex-1 bg-cream border border-beige rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="bg-oak text-white w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
