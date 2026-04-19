'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Conversation {
  id: string
  created_at: string
  user_id: string
}

export function InboxList({ conversations }: { conversations: Conversation[] }) {
  const [items, setItems] = useState(conversations)
  const router = useRouter()

  function handleClick(id: string) {
    setItems((prev) => prev.filter((c) => c.id !== id))
    router.push(`/rabbi/inbox/${id}`)
  }

  if (!items.length) {
    return <p className="text-textMuted">אין שאלות ממתינות.</p>
  }

  return (
    <div className="space-y-3 max-w-2xl">
      {items.map((conv) => (
        <button
          key={conv.id}
          onClick={() => handleClick(conv.id)}
          className="w-full flex items-center justify-between bg-white border border-beige rounded-2xl px-6 py-4 hover:border-oak transition-all text-right"
        >
          <div>
            <p className="text-sm font-medium text-textMain">שאלה #{conv.id.slice(0, 8)}</p>
            <p className="text-xs text-textMuted mt-0.5">
              {new Date(conv.created_at).toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className="text-textMuted text-lg">→</span>
        </button>
      ))}
    </div>
  )
}
