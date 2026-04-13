'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') ?? 'rabbi'
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const roleLabel = role === 'rabbi' ? 'רב / מורה הוראה' : 'בעלת מקצוע'
  const roleColor = role === 'rabbi' ? 'bg-oak' : 'bg-pink'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(role === 'rabbi' ? '/rabbi' : '/beauty')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        router.push(`/onboarding?role=${role}`)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה. נסי שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-textMuted text-sm hover:text-textMain flex items-center gap-1 mb-8">
          ← חזרה
        </Link>

        <div className="bg-white border border-beige rounded-2xl p-8 shadow-sm">
          <div className={`w-10 h-10 ${roleColor} rounded-full mb-6`} />
          <h1 className="text-2xl font-semibold text-textMain mb-1">כניסה</h1>
          <p className="text-textMuted text-sm mb-8">{roleLabel}</p>

          {/* Tabs */}
          <div className="flex bg-cream rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-white text-textMain shadow-sm' : 'text-textMuted'
                }`}
              >
                {t === 'signin' ? 'כניסה' : 'הרשמה'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                placeholder="your@email.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${roleColor} text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2`}
            >
              {loading ? 'טוענת...' : tab === 'signin' ? 'כניסה' : 'הרשמה'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
