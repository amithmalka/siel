'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין לאישור',
  provider_confirmed: 'מאושר',
  user_confirmed: 'מאושר סופית',
  cancelled: 'מבוטל',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-pink-pale text-pink-deep',
  provider_confirmed: 'bg-green-100 text-green-700',
  user_confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-beige text-textMuted',
}

export function AppointmentList({ appointments: initial, providerId }: { appointments: Appointment[]; providerId: string }) {
  const [appointments, setAppointments] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  // Realtime subscription — new appointments arrive live
  useEffect(() => {
    const channel = supabase
      .channel('appointments-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments', filter: `provider_id=eq.${providerId}` },
        (payload) => {
          const appt = payload.new as Appointment
          setAppointments((prev) => [appt, ...prev])
          toast('תור חדש נקבע!', { icon: '📅' })
          // Browser notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('SIEL — תור חדש', {
              body: `${formatDate(appt.slot_start)} בשעה ${formatTime(appt.slot_start)}`,
              icon: '/favicon.ico',
            })
          } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, providerId])

  async function respond(appointmentId: string, action: 'confirm' | 'cancel') {
    setLoadingId(appointmentId)
    try {
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, action }),
      })
      if (!res.ok) throw new Error('שגיאה')
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, status: action === 'confirm' ? 'provider_confirmed' : 'cancelled' }
            : a
        )
      )
      toast.success(action === 'confirm' ? 'התור אושר' : 'התור בוטל')
    } catch {
      toast.error('שגיאה. נסי שוב.')
    } finally {
      setLoadingId(null)
    }
  }

  const pending = appointments.filter((a) => a.status === 'pending')
  const rest = appointments.filter((a) => a.status !== 'pending')

  function AppCard({ appt }: { appt: Appointment }) {
    return (
      <div className="bg-white border border-beige rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-textMain">{formatDate(appt.slot_start)}</p>
            <p className="text-xs text-textMuted mt-0.5">{formatTime(appt.slot_start)} – {formatTime(appt.slot_end)}</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[appt.status]}`}>
            {STATUS_LABELS[appt.status]}
          </span>
        </div>
        {appt.note && <p className="text-sm text-textLight bg-cream rounded-xl px-4 py-2 mb-3">{appt.note}</p>}
        {appt.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => respond(appt.id, 'confirm')}
              disabled={loadingId === appt.id}
              className="flex-1 flex items-center justify-center gap-2 bg-oak text-white text-sm font-medium py-2 rounded-xl hover:opacity-90 disabled:opacity-60"
            >
              <Check size={14} /> אשרי תור
            </button>
            <button
              onClick={() => respond(appt.id, 'cancel')}
              disabled={loadingId === appt.id}
              className="flex items-center justify-center gap-2 border border-beige text-textMuted text-sm font-medium px-4 py-2 rounded-xl hover:bg-cream disabled:opacity-60"
            >
              <X size={14} /> בטלי
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">
            ממתינות לאישור ({pending.length})
          </h2>
          <div className="space-y-3">{pending.map((a) => <AppCard key={a.id} appt={a} />)}</div>
        </section>
      )}
      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">שאר התורים</h2>
          <div className="space-y-3">{rest.map((a) => <AppCard key={a.id} appt={a} />)}</div>
        </section>
      )}
      {!appointments.length && <p className="text-textMuted">אין תורים עדיין.</p>}
    </div>
  )
}
