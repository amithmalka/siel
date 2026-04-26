'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PendingProvider {
  id: string
  name: string
  specialty: string | null
  city: string | null
}

interface PendingRabbi {
  id: string
  name: string
  specialty: string | null
}

interface Props {
  providers: PendingProvider[]
  rabbis: PendingRabbi[]
}

export default function PendingApprovals({ providers, rabbis }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const total = providers.length + rabbis.length
  if (total === 0) return null

  async function approveProvider(id: string) {
    setLoadingId(id)
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: true }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function rejectProvider(id: string) {
    if (!confirm('למחוק את הספקית?')) return
    setLoadingId(id)
    await fetch('/api/admin/providers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function approveRabbi(id: string) {
    setLoadingId(id)
    await fetch('/api/admin/rabbis', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_available: true }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function rejectRabbi(id: string) {
    if (!confirm('למחוק את הרב?')) return
    setLoadingId(id)
    await fetch('/api/admin/rabbis', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-8">
      <h2 className="font-bold text-textMain mb-4 flex items-center gap-2">
        <span className="text-xl">⏳</span>
        ממתינים לאישור ({total})
      </h2>
      <div className="space-y-3">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 border-b border-beige pb-3 last:border-0">
            <div>
              <span className="font-medium text-textMain">{p.name}</span>
              {p.specialty && <span className="text-xs text-textMuted ml-2">{p.specialty}</span>}
              {p.city && <span className="text-xs text-textMuted ml-1">· {p.city}</span>}
              <span className="text-xs bg-pink/10 text-pink px-2 py-0.5 rounded-full mr-2">בעלת עסק</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approveProvider(p.id)}
                disabled={loadingId === p.id}
                className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                {loadingId === p.id ? '...' : '✓ אשרי'}
              </button>
              <button
                onClick={() => rejectProvider(p.id)}
                disabled={loadingId === p.id}
                className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                דחי
              </button>
            </div>
          </div>
        ))}

        {rabbis.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-4 border-b border-beige pb-3 last:border-0">
            <div>
              <span className="font-medium text-textMain">{r.name}</span>
              {r.specialty && <span className="text-xs text-textMuted ml-2">{r.specialty}</span>}
              <span className="text-xs bg-oak/10 text-oak px-2 py-0.5 rounded-full mr-2">רב</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approveRabbi(r.id)}
                disabled={loadingId === r.id}
                className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                {loadingId === r.id ? '...' : '✓ אשרי'}
              </button>
              <button
                onClick={() => rejectRabbi(r.id)}
                disabled={loadingId === r.id}
                className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                דחי
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
