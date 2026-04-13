'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

interface Slot { day: number; start: string; end: string }
interface BlockedDateItem { date: string }

export default function AvailabilityPage() {
  const [providerId, setProviderId] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [blocked, setBlocked] = useState<BlockedDateItem[]>([])
  const [newBlock, setNewBlock] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bo } = await supabase.from('backoffice_users').select('linked_entity_id').eq('id', user.id).single()
      if (!bo) return
      setProviderId(bo.linked_entity_id)
      const { data: avSlots } = await supabase.from('availability_slots').select('day_of_week, start_time, end_time').eq('provider_id', bo.linked_entity_id)
      if (avSlots) setSlots(avSlots.map((s) => ({ day: s.day_of_week, start: s.start_time, end: s.end_time })))
      const { data: bDates } = await supabase.from('blocked_dates').select('blocked_date').eq('provider_id', bo.linked_entity_id)
      if (bDates) setBlocked(bDates.map((d) => ({ date: d.blocked_date })))
    }
    load()
  }, [supabase])

  function toggleDay(day: number) {
    const exists = slots.find((s) => s.day === day)
    if (exists) setSlots(slots.filter((s) => s.day !== day))
    else setSlots([...slots, { day, start: '09:00', end: '17:00' }])
  }

  function updateSlot(day: number, field: 'start' | 'end', val: string) {
    setSlots(slots.map((s) => s.day === day ? { ...s, [field]: val } : s))
  }

  async function save() {
    setLoading(true)
    await supabase.from('availability_slots').delete().eq('provider_id', providerId)
    if (slots.length > 0) {
      await supabase.from('availability_slots').insert(
        slots.map((s) => ({ provider_id: providerId, day_of_week: s.day, start_time: s.start, end_time: s.end }))
      )
    }
    toast.success('שעות הזמינות עודכנו')
    setLoading(false)
  }

  async function addBlock() {
    if (!newBlock) return
    await supabase.from('blocked_dates').insert({ provider_id: providerId, blocked_date: newBlock })
    setBlocked([...blocked, { date: newBlock }])
    setNewBlock('')
    toast.success('תאריך נחסם')
  }

  async function removeBlock(date: string) {
    await supabase.from('blocked_dates').delete().eq('provider_id', providerId).eq('blocked_date', date)
    setBlocked(blocked.filter((b) => b.date !== date))
  }

  return (
    <div dir="rtl" className="max-w-xl">
      <h1 className="text-2xl font-bold text-textMain mb-6">ניהול זמינות</h1>

      {/* Weekly hours */}
      <div className="bg-white border border-beige rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-textMain mb-4">שעות עבודה שבועיות</h2>
        <div className="space-y-3">
          {DAYS.map((day, i) => {
            const slot = slots.find((s) => s.day === i)
            return (
              <div key={i} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(i)}
                  className={`w-10 h-6 rounded-full transition-colors ${slot ? 'bg-pink' : 'bg-beige-deep'} relative flex-shrink-0`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${slot ? 'right-1' : 'left-1'}`} />
                </button>
                <span className="text-sm font-medium text-textMain w-16">{day}</span>
                {slot && (
                  <div className="flex items-center gap-2 text-sm text-textLight">
                    <input type="time" value={slot.start} onChange={(e) => updateSlot(i, 'start', e.target.value)} className="border border-beige rounded-lg px-2 py-1 text-xs bg-cream" />
                    <span>–</span>
                    <input type="time" value={slot.end} onChange={(e) => updateSlot(i, 'end', e.target.value)} className="border border-beige rounded-lg px-2 py-1 text-xs bg-cream" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button onClick={save} disabled={loading} className="mt-6 bg-pink text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60">
          {loading ? 'שומר...' : 'שמירה'}
        </button>
      </div>

      {/* Blocked dates */}
      <div className="bg-white border border-beige rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-textMain mb-4">תאריכים חסומים</h2>
        <div className="flex gap-2 mb-4">
          <input type="date" value={newBlock} onChange={(e) => setNewBlock(e.target.value)} className="flex-1 border border-beige rounded-xl px-3 py-2 text-sm bg-cream" />
          <button onClick={addBlock} className="bg-pink text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">חסמי</button>
        </div>
        <div className="space-y-2">
          {blocked.map((b) => (
            <div key={b.date} className="flex items-center justify-between text-sm text-textLight bg-cream rounded-xl px-4 py-2">
              <span>{new Date(b.date).toLocaleDateString('he-IL')}</span>
              <button onClick={() => removeBlock(b.date)} className="text-pink text-xs hover:underline">הסרי</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
