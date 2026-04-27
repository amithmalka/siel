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
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const supabase = createClient()

  const roleLabel = role === 'rabbi' ? t.rabbiRole : t.beautyRole
  const roleColor = role === 'rabbi' ? 'bg-oak' : 'bg-pink'
  const roleBorder = role === 'rabbi' ? 'focus:border-oak' : 'focus:border-pink'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(role === 'rabbi' ? '/rabbi' : '/beauty')
      } else if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success(t.emailVerificationSent)
        setTab('signin')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.errorTryAgain)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setLoading(true)
    try {
      const redirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : '/reset-password'
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      toast.success(t.resetEmailSent)
      setTab('signin')
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
          <h1 className="text-2xl font-semibold text-textMain mb-1">
            {tab === 'forgot' ? t.forgotPasswordTitle : t.login}
          </h1>
          <p className="text-textMuted text-sm mb-8">{roleLabel}</p>

          {tab === 'forgot' ? (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-textMuted mb-2">{t.forgotPasswordDesc}</p>
              <div>
                <label className="block text-sm font-medium text-textLight mb-1.5">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none ${roleBorder} bg-cream`}
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.includes('@')}
                className={`w-full ${roleColor} text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60`}
              >
                {loading ? t.loading : t.sendResetLink}
              </button>
              <button
                type="button"
                onClick={() => setTab('signin')}
                className="w-full text-textMuted text-sm py-2 hover:text-textMain"
              >
                {t.backToLogin}
              </button>
            </form>
          ) : (
            <>
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
                    className={`w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none ${roleBorder} bg-cream`}
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
                    className={`w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none ${roleBorder} bg-cream`}
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
                {tab === 'signin' && (
                  <div className="text-left">
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-xs text-textMuted hover:text-textMain underline"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${roleColor} text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2`}
                >
                  {loading ? t.loading : tab === 'signin' ? t.login : t.signup}
                </button>
              </form>
            </>
          )}
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
