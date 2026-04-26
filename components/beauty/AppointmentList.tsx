'use client'

import { useState, useEffect, useRef } from 'react'
import { Appointment } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()
  const { t } = useLanguage()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const STATUS_LABELS: Record<string, string> = {
    pending: t.statusPending,
    provider_confirmed: t.statusProviderConfirmed,
    user_confirmed: t.statusUserConfirmed,
    cancelled: t.statusCancelled,
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-pink-pale text-pink-deep',
    provider_confirmed: 'bg-green-100 text-green-700',
    user_confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-beige text-textMuted',
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bo } = await supabase.from('backoffice_users').select('linked_entity_id').eq('id', user.id).single()
      if (!bo) return
      const pid = bo.linked_entity_id
      const { data } = await supabase.from('appointments').select('*').eq('provider_id', pid).order('slot_start', { ascending: true })
      setAppointments(data ?? [])
      setLoadingData(false)

      if (channelRef.current) supabase.removeChannel(channelRef.current)
      channelRef.current = supabase
        .channel('appointments-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments', filter: `provider_id=eq.${pid}` }, (payload) => {
          const appt = payload.new as Appointment
          setAppointments((prev) => [appt, ...prev])
          toast(t.newApptToast, { icon: '📅' })
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(t.newApptNotifTitle, { body: `${formatDate(appt.slot_start)} ${formatTime(appt.slot_start)}`, icon: '/favicon.ico' })
          }
        })
        .subscribe()
    }
    load()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function respond(appointmentId: string, action: 'confirm' | 'cancel') {
    setLoadingId(appointmentId)
    try {
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, action }),
      })
      if (!res.ok) throw new Error(t.error)

      setAppointments((prev) => {
        const confirmed = prev.find((a) => a.id === appointmentId)
        return prev.map((a) => {
          if (a.id === appointmentId)
            return { ...a, status: action === 'confirm' ? 'provider_confirmed' : 'cancelled' }
          if (action === 'confirm' && confirmed?.service_name && a.service_name === confirmed.service_name && a.user_id === confirmed.user_id && a.status === 'pending')
            return { ...a, status: 'cancelled' as const }
          return a
        })
      })
      toast.success(action === 'confirm' ? t.apptConfirmed : t.apptCancelled)
    } catch {
      toast.error(t.errorTryAgain)
    } finally {
      setLoadingId(null)
    }
  }

  if (loadingData) {
    return (
      <div className="max-w-xl space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-beige rounded-2xl p-5">
            <div className="flex justify-between mb-3">
              <div className="space-y-2"><div className="h-4 w-28 bg-beige rounded" /><div className="h-3 w-20 bg-beige rounded" /></div>
              <div className="h-6 w-20 bg-beige rounded-full" />
            </div>
            <div className="h-10 w-full bg-beige rounded-xl" />
          </div>
        ))}
      </div>
    )
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
        {appt.service_name && (
          <p className="text-xs font-medium text-pink bg-pink/10 rounded-full px-3 py-1 inline-block mb-2">
            {appt.service_name}{appt.service_price ? ` · ₪${appt.service_price}` : ''}
          </p>
        )}
        {appt.note && <p className="text-sm text-textLight bg-cream rounded-xl px-4 py-2 mb-3">{appt.note}</p>}
        {appt.status === 'pending' && (
          <div className="flex gap-2">
            <button onClick={() => respond(appt.id, 'confirm')} disabled={loadingId === appt.id}
              className="flex-1 flex items-center justify-center gap-2 bg-oak text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60">
              <Check size={14} /> {t.confirmAppt}
            </button>
            <button onClick={() => respond(appt.id, 'cancel')} disabled={loadingId === appt.id}
              className="flex items-center justify-center gap-2 border border-beige text-textMuted text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-cream disabled:opacity-60">
              <X size={14} /> {t.cancelAppt}
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
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">{t.pendingCount} ({pending.length})</h2>
          <div className="space-y-3">{pending.map((a) => <AppCard key={a.id} appt={a} />)}</div>
        </section>
      )}
      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">{t.otherAppointments}</h2>
          <div className="space-y-3">{rest.map((a) => <AppCard key={a.id} appt={a} />)}</div>
        </section>
      )}
      {!appointments.length && <p className="text-textMuted">{t.noAppointments}</p>}
    </div>
  )
}
