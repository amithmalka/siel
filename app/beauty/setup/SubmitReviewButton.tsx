'use client'

import { useState } from 'react'
import { submitForReview } from '@/app/beauty/profile/actions'
import toast from 'react-hot-toast'

export function SubmitReviewButton() {
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      await submitForReview()
      toast.success('הבקשה נשלחה לאישור הנהלת SIEL ✅')
      window.location.reload()
    } catch (err) {
      toast.error('שגיאה בשליחה: ' + (err instanceof Error ? err.message : 'נסי שוב'))
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="block mt-6 w-full bg-oak text-white text-center font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
    >
      {loading ? 'שולחת...' : 'שלחי לאישור הנהלת SIEL ←'}
    </button>
  )
}
