'use client'

import { useState } from 'react'
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { addService, deleteService, toggleService } from '@/app/beauty/services/actions'

interface ProviderService {
  id: string
  name: string
  price: number
  duration_minutes: number
  is_active: boolean
}

export function ServicesManager({ providerId, initialServices }: { providerId: string; initialServices: ProviderService[] }) {
  const [services, setServices] = useState(initialServices)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('60')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name.trim() || !price) return
    setSaving(true)
    try {
      await addService(providerId, name.trim(), Number(price), Number(duration))
      setServices((prev) => [...prev, {
        id: crypto.randomUUID(),
        name: name.trim(),
        price: Number(price),
        duration_minutes: Number(duration),
        is_active: true,
      }])
      setName('')
      setPrice('')
      setDuration('60')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteService(id)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleService(id, !current)
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !current } : s))
  }

  return (
    <div className="max-w-2xl" dir="rtl">
      {/* Add service form */}
      <div className="bg-white border border-beige rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-textMuted mb-4">הוספת שירות חדש</h2>
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם השירות (למשל: מניקור גל)"
            className="border border-beige rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-textMuted mb-1 block">מחיר (₪)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full border border-beige rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-textMuted mb-1 block">משך (דקות)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="w-full border border-beige rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim() || !price}
            className="bg-pink text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'שומרת...' : '+ הוספה'}
          </button>
        </div>
      </div>

      {/* Services list */}
      {services.length === 0 ? (
        <p className="text-textMuted text-sm">עדיין לא הוספת שירותים.</p>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className={`bg-white border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${s.is_active ? 'border-beige' : 'border-beige opacity-50'}`}>
              <div className="flex-1">
                <p className="text-sm font-semibold text-textMain">{s.name}</p>
                <p className="text-xs text-textMuted mt-0.5">₪{s.price} · {s.duration_minutes} דקות</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(s.id, s.is_active)} className="text-textMuted hover:text-textMain">
                  {s.is_active ? <ToggleRight size={22} className="text-pink" /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
