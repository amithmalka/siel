'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const role = params.get('role') ?? 'rabbi'
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const supabase = createClient()

  const roleLabel = role === 'rabbi' ? t.rabbiRole : t.beautyRole
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
      toast.error(err instanceof Error ? err.message : t.errorTryAgain)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-textMuted text-sm hover:text-textMain flex items-center gap-1 mb-8">
          {t.back}
        </Link>

        <div className="bg-white border border-beige rounded-2xl p-8 shadow-sm">
          <div className={`w-10 h-10 ${roleColor} rounded-full mb-6`} />
          <h1 className="text-2xl font-semibold text-textMain mb-1">{t.login}</h1>
          <p className="text-textMuted text-sm mb-8">{roleLabel}</p>

          <div className="flex bg-cream rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === tabKey ? 'bg-white text-textMain shadow-sm' : 'text-textMuted'
                }`}
              >
                {tabKey === 'signin' ? t.login : t.signup}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-1.5">{t.email}</label>
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
              <label className="block text-sm font-medium text-textLight mb-1.5">{t.password}</label>
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
              {loading ? t.loading : tab === 'signin' ? t.login : t.signup}
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
