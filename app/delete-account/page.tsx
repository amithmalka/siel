'use client'

import { useState } from 'react'

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
          <h2 className="text-lg font-semibold text-textMain mt-4">מחיקת חשבון ונתונים</h2>
        </div>

        {submitted ? (
          <div className="bg-white border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-sm font-semibold text-textMain mb-2">הבקשה התקבלה</p>
            <p className="text-xs text-textMuted leading-relaxed">
              קיבלנו את בקשתך למחיקת החשבון עבור <strong>{email}</strong>.
              נטפל בה תוך 30 יום ונאשר את המחיקה בדוא"ל.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-beige rounded-2xl p-8">
            <p className="text-xs text-textMuted leading-relaxed mb-6">
              מילוי הטופס ישלח בקשה למחיקת חשבונך וכל הנתונים המשויכים אליו — כולל פרטים אישיים, היסטוריית תורים ושאלות.
              הבקשה תטופל תוך 30 יום.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textLight mb-1.5">
                  כתובת האימייל שלך
                </label>
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

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white font-medium py-3 rounded-xl text-sm hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {loading ? 'שולח...' : 'שלחי בקשת מחיקה'}
              </button>
            </form>

            <p className="text-xs text-textMuted mt-4 text-center">
              לשאלות:{' '}
              <a href="mailto:siel.app.contact@gmail.com" className="text-pink hover:underline">
                siel.app.contact@gmail.com
              </a>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-textMuted mt-8">
          SIEL © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
