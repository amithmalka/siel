'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('הסיסמאות אינן תואמות'); return }
    if (password.length < 6) { toast.error('סיסמה חייבת להכיל לפחות 6 תווים'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('הסיסמה עודכנה בהצלחה!')
      router.push('/login')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה. נסי שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white border border-beige rounded-2xl p-8 shadow-sm" dir="rtl">
          <h1 className="text-2xl font-semibold text-textMain mb-2">סיסמה חדשה</h1>
          <p className="text-textMuted text-sm mb-8">
            {ready ? 'הכניסי סיסמה חדשה לחשבונך.' : 'מאמתת קישור...'}
          </p>

          {ready && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textLight mb-1.5">סיסמה חדשה</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                  placeholder="לפחות 6 תווים"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textLight mb-1.5">אישור סיסמה</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream"
                  placeholder="הכניסי שוב"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60"
              >
                {loading ? 'שומרת...' : 'שמרי סיסמה חדשה'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
