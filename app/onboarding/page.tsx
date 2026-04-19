'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

function OnboardingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') as 'rabbi' | 'beauty_pro' | null
  const step = params.get('step')
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const sessionId = params.get('session_id')
    if (sessionId) {
      toast.success(t.paymentSuccess)
    }
  }, [params, t.paymentSuccess])

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
      if (!res.ok) throw new Error(json.error || t.error)
      router.push(json.redirect)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.errorTryAgain)
      setLoading(false)
    }
  }

  if (!role) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-textMuted">
          {t.missingParam}{' '}
          <a href="/" className="underline text-pink">{t.backToHome}</a>
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-beige rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-textMain mb-2">{t.profileSetup}</h1>
          <p className="text-textMuted text-sm mb-8">
            {role === 'rabbi' ? t.rabbiDetails : t.beautyDetails}
          </p>

          {step === 'payment' && (
            <div className="bg-pink-pale border border-pink rounded-xl p-4 mb-6 text-sm text-oak">
              {t.subscriptionRequired}
            </div>
          )}

          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">
                {role === 'rabbi' ? t.rabbiName : t.businessName}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">
                {role === 'rabbi' ? t.specialty : t.categoryHint}
              </label>
              {role === 'rabbi' ? (
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                  dir="rtl"
                >
                  <option value="">בחר התמחות</option>
                  <option value="sephardi">ספרדי (מרן)</option>
                  <option value="ashkenazi">אשכנזי (רמ״א)</option>
                </select>
              ) : (
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                  dir="rtl"
                />
              )}
            </div>
            {role === 'beauty_pro' && (
              <div>
                <label className="block text-sm font-medium text-textLight mb-1.5">{t.city}</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                  dir="rtl"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${role === 'rabbi' ? 'bg-oak' : 'bg-pink'} text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2`}
            >
              {loading ? t.saving : t.completeSetup}
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
