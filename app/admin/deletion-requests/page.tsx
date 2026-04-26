'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletionRequest {
  id: string
  email: string
  request_type: 'full' | 'partial'
  selected_data: string[]
  requested_at: string
  handled_at: string | null
}

const DATA_LABELS: Record<string, string> = {
  appointments: 'היסטוריית תורים',
  questions: 'שאלות ושיחות',
  profile: 'פרטים אישיים',
}

export default function AdminDeletionRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [showHandled, setShowHandled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/deletion-requests?handled=${showHandled}`)
    const data = await res.json()
    setRequests(data.requests ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [showHandled]) // eslint-disable-line

  async function markHandled(id: string) {
    setActionId(id)
    await fetch('/api/admin/deletion-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    setActionId(null)
  }

  return (
    <main className="min-h-screen bg-cream p-4 sm:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/admin")} className="text-textMuted text-sm hover:text-pink px-2 py-1">← חזרה</button>
          <h1 className="text-2xl font-bold text-oak">בקשות מחיקת נתונים</h1>
        </div>

        <div className="flex gap-3 mb-5">
          <button onClick={() => setShowHandled(false)} className={`text-sm px-4 py-2 rounded-full font-semibold border transition-colors ${!showHandled ? 'bg-pink text-white border-pink' : 'border-beige text-textMuted'}`}>
            פתוחות
          </button>
          <button onClick={() => setShowHandled(true)} className={`text-sm px-4 py-2 rounded-full font-semibold border transition-colors ${showHandled ? 'bg-pink text-white border-pink' : 'border-beige text-textMuted'}`}>
            טופלו
          </button>
        </div>

        {loading ? (
          <div className="text-center text-textMuted py-16">טוען...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-textMuted py-16 bg-white border border-beige rounded-2xl">
            {showHandled ? 'אין בקשות שטופלו' : 'אין בקשות פתוחות'}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-white border border-beige rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-textMain">{r.email}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.request_type === 'full' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.request_type === 'full' ? 'מחיקה מלאה' : 'מחיקה חלקית'}
                      </span>
                    </div>
                    {r.request_type === 'partial' && r.selected_data?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.selected_data.map((d) => (
                          <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {DATA_LABELS[d] ?? d}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-textMuted">
                      התקבל: {new Date(r.requested_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {r.handled_at && ` · טופל: ${new Date(r.handled_at).toLocaleDateString('he-IL')}`}
                    </div>
                  </div>
                  {!r.handled_at && (
                    <button
                      onClick={() => markHandled(r.id)}
                      disabled={actionId === r.id}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      סמן כטופל
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
