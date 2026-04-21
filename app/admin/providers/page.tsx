'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  specialty: string
  city: string
  phone: string | null
  bio: string | null
  portfolio_paths: string[]
  is_active: boolean
  has_services?: boolean
  has_slots?: boolean
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/providers')
    const data = await res.json()
    setProviders(data.providers ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(id: string, current: boolean) {
    setActionId(id)
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    await load()
    setActionId(null)
  }

  async function deleteProvider(id: string, name: string) {
    if (!confirm(`למחוק את ${name}? פעולה זו בלתי הפיכה.`)) return
    setActionId(id)
    await fetch('/api/admin/providers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    setActionId(null)
  }

  return (
    <main className="min-h-screen bg-cream p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-textMuted text-sm hover:text-pink">← חזרה</Link>
          <h1 className="text-2xl font-bold text-oak">ניהול בעלות עסק</h1>
        </div>

        {loading ? (
          <div className="text-center text-textMuted py-16">טוען...</div>
        ) : (
          <div className="space-y-3">
            {providers.map((p) => {
              const missingBio = !p.bio?.trim()
              const missingPortfolio = !p.portfolio_paths?.length
              const missingServices = !p.has_services
              const missingSlots = !p.has_slots
              const incomplete = missingBio || missingPortfolio || missingServices || missingSlots

              return (
                <div key={p.id} className={`bg-white border rounded-2xl p-5 ${incomplete ? 'border-amber-200' : 'border-beige'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-textMain">{p.name}</span>
                        <span className="text-xs text-textMuted">{p.specialty}</span>
                        <span className="text-xs text-textMuted">· {p.city}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.is_active ? 'פעילה' : 'לא פעילה'}
                        </span>
                      </div>
                      {incomplete && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {missingBio && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">חסר: ביו</span>}
                          {missingPortfolio && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">חסר: תמונות</span>}
                          {missingServices && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">חסר: שירותים</span>}
                          {missingSlots && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">חסר: שעות</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(p.id, p.is_active)}
                        disabled={actionId === p.id}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-colors disabled:opacity-50 ${p.is_active ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-green-400 text-green-700 hover:bg-green-50'}`}
                      >
                        {p.is_active ? 'השבת' : 'הפעל'}
                      </button>
                      <button
                        onClick={() => deleteProvider(p.id, p.name)}
                        disabled={actionId === p.id}
                        className="text-xs px-3 py-1.5 rounded-full font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
