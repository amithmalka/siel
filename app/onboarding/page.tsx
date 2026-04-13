'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

function OnboardingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') as 'rabbi' | 'beauty_pro' | null
  const step = params.get('step')

  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (sessionId) {
      toast.success('התשלום הצליח! ממשיכה...')
    }
  }, [params])

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, name, specialty, city }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'שגיאה')
      router.push(json.redirect)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה. נסי שוב.')
      setLoading(false)
    }
  }

  if (!role) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-textMuted">פרמטר חסר. <a href="/" className="underline text-pink">חזרה לדף הבית</a></p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-beige rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-textMain mb-2">הגדרת פרופיל</h1>
          <p className="text-textMuted text-sm mb-8">
            {role === 'rabbi' ? 'פרטי הרב / מורה הוראה' : 'פרטי בעלת המקצוע'}
          </p>

          {step === 'payment' && (
            <div className="bg-pink-pale border border-pink rounded-xl p-4 mb-6 text-sm text-oak">
              נדרש מנוי פעיל. לחצי להשלמת התשלום.
            </div>
          )}

          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">
                {role === 'rabbi' ? 'שם הרב' : 'שם העסק / שמך'}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                dir="rtl"
                placeholder={role === 'rabbi' ? 'הרב ישראל ישראלי' : 'נגל בוטיק'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">
                {role === 'rabbi' ? 'התמחות' : 'קטגוריה (ציפורניים, שיער, וכו׳)'}
              </label>
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                dir="rtl"
                placeholder={role === 'rabbi' ? 'טהרת המשפחה' : 'ציפורניים גל, פדיקור'}
              />
            </div>
            {role === 'beauty_pro' && (
              <div>
                <label className="block text-sm font-medium text-textLight mb-1.5">עיר</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                  dir="rtl"
                  placeholder="ירושלים"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${role === 'rabbi' ? 'bg-oak' : 'bg-pink'} text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2`}
            >
              {loading ? 'שומרת...' : 'סיום הגדרה'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  )
}
