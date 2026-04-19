'use client'

import { useState } from 'react'

type RequestType = 'full' | 'partial' | null

const PARTIAL_OPTIONS = [
  { id: 'appointments', label: 'היסטוריית תורים' },
  { id: 'questions', label: 'שאלות ושיחות עם רב' },
  { id: 'profile', label: 'פרטים אישיים (שם, טלפון, עיר)' },
]

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('')
  const [requestType, setRequestType] = useState<RequestType>(null)
  const [selectedData, setSelectedData] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleOption(id: string) {
    setSelectedData((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || !requestType) return
    if (requestType === 'partial' && selectedData.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, requestType, selectedData }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('אירעה שגיאה. נסי שוב מאוחר יותר.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-oak mb-1">SIEL</h1>
          <h2 className="text-lg font-semibold text-textMain mt-4">בקשת מחיקת נתונים</h2>
        </div>

        {submitted ? (
          <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-sm font-semibold text-textMain mb-2">הבקשה התקבלה</p>
            <p className="text-xs text-textMuted leading-relaxed">
              קיבלנו את בקשתך עבור <strong>{email}</strong>.
              נטפל בה תוך 30 יום ונאשר את הביצוע בדוא"ל.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Step 1 - email */}
            <div className="bg-white border border-beige rounded-2xl p-6">
              <label className="block text-sm font-medium text-textMain mb-2">כתובת האימייל שלך</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                dir="ltr"
              />
            </div>

            {/* Step 2 - type */}
            <div className="bg-white border border-beige rounded-2xl p-6">
              <p className="text-sm font-medium text-textMain mb-3">מה ברצונך למחוק?</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setRequestType('partial')}
                  className={`w-full text-right border rounded-xl px-4 py-3 text-sm transition-colors ${requestType === 'partial' ? 'border-pink bg-pink/5 text-textMain' : 'border-beige text-textMuted hover:border-pink/50'}`}
                >
                  <p className="font-medium">מחיקת נתונים מסוימים בלבד</p>
                  <p className="text-xs mt-0.5 opacity-70">החשבון נשאר פעיל</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('full')}
                  className={`w-full text-right border rounded-xl px-4 py-3 text-sm transition-colors ${requestType === 'full' ? 'border-red-400 bg-red-50 text-red-700' : 'border-beige text-textMuted hover:border-red-300'}`}
                >
                  <p className="font-medium">מחיקת החשבון וכל הנתונים</p>
                  <p className="text-xs mt-0.5 opacity-70">לא ניתן לשחזר</p>
                </button>
              </div>
            </div>

            {/* Step 3 - partial options */}
            {requestType === 'partial' && (
              <div className="bg-white border border-beige rounded-2xl p-6">
                <p className="text-sm font-medium text-textMain mb-3">איזה נתונים למחוק?</p>
                <div className="space-y-2">
                  {PARTIAL_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedData.includes(opt.id)}
                        onChange={() => toggleOption(opt.id)}
                        className="w-4 h-4 accent-pink"
                      />
                      <span className="text-sm text-textMain">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !requestType || (requestType === 'partial' && selectedData.length === 0)}
              className="w-full bg-red-500 text-white font-medium py-3 rounded-xl text-sm hover:bg-red-600 disabled:opacity-40 transition-colors"
            >
              {loading ? 'שולח...' : 'שלחי בקשה'}
            </button>

            <p className="text-xs text-textMuted text-center">
              לשאלות:{' '}
              <a href="mailto:siel.app.contact@gmail.com" className="text-pink hover:underline">
                siel.app.contact@gmail.com
              </a>
            </p>
          </form>
        )}

        <p className="text-center text-xs text-textMuted mt-8">
          SIEL © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
