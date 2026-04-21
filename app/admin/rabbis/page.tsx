'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Rabbi {
  id: string
  name: string
  specialty: string | null
  is_available: boolean
  user_id: string | null
}

export default function AdminRabbisPage() {
  const [rabbis, setRabbis] = useState<Rabbi[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/rabbis')
    const data = await res.json()
    setRabbis(data.rabbis ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleAvailable(id: string, current: boolean) {
    setActionId(id)
    await fetch('/api/admin/rabbis', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_available: !current }),
    })
    await load()
    setActionId(null)
  }

  async function deleteRabbi(id: string, name: string) {
    if (!confirm(`למחוק את ${name}?`)) return
    setActionId(id)
    await fetch('/api/admin/rabbis', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    setActionId(null)
  }

  return (
    <main className="min-h-screen bg-cream p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-textMuted text-sm hover:text-pink">← חזרה</Link>
          <h1 className="text-2xl font-bold text-oak">ניהול רבנים</h1>
        </div>

        {loading ? (
          <div className="text-center text-textMuted py-16">טוען...</div>
        ) : (
          <div className="space-y-3">
            {rabbis.map((r) => (
              <div key={r.id} className="bg-white border border-beige rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-textMain">{r.name}</span>
                    {r.specialty && <span className="text-xs text-textMuted">{r.specialty}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.is_available ? 'זמין' : 'לא זמין'}
                    </span>
                    {!r.user_id && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">אין חשבון</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailable(r.id, r.is_available)}
                    disabled={actionId === r.id}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-colors disabled:opacity-50 ${r.is_available ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-green-400 text-green-700 hover:bg-green-50'}`}
                  >
                    {r.is_available ? 'העמד כלא זמין' : 'העמד כזמין'}
                  </button>
                  <button
                    onClick={() => deleteRabbi(r.id, r.name)}
                    disabled={actionId === r.id}
                    className="text-xs px-3 py-1.5 rounded-full font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
