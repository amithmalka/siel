'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check, Phone } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

interface Service { id: string; name: string; price: number; duration_minutes: number }

interface Provider {
  id: string
  name: string
  specialty: string | null
  city: string | null
  address: string | null
  phone: string | null
  bio: string | null
  profile_image_path: string | null
  portfolio_paths: string[]
  is_active: boolean
  is_available: boolean
  submitted_for_review: boolean
  services: Service[]
  has_slots: boolean
}

function imgUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/service-portfolios/${path}`
}

function MissingBadge({ label }: { label: string }) {
  return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">חסר: {label}</span>
}

function ProviderModal({ provider, onClose, onApprove, onReject, onDelete, actionId }: {
  provider: Provider
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string, name: string) => void
  actionId: string | null
}) {
  const missingBio = !provider.bio?.trim()
  const missingCity = !provider.city?.trim()
  const missingPortfolio = !provider.portfolio_paths?.length
  const missingSlots = !provider.has_slots
  const missingServices = !provider.services?.length

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-beige px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-textMain">{provider.name}</h2>
          <button onClick={onClose} className="text-textMuted hover:text-textMain"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Profile image + basic info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-beige flex-shrink-0 overflow-hidden flex items-center justify-center">
              {provider.profile_image_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgUrl(provider.profile_image_path)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-textMain">{provider.name}</p>
              {provider.specialty && <p className="text-xs text-pink mt-0.5">{provider.specialty}</p>}
              {provider.city && <p className="text-xs text-textMuted mt-0.5">📍 {provider.city}</p>}
              {provider.address && <p className="text-xs text-textMuted">🏠 {provider.address}</p>}
              {provider.phone && (
                <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-xs text-oak mt-1">
                  <Phone size={11} /> {provider.phone}
                </a>
              )}
            </div>
          </div>

          {/* Missing fields warning */}
          {(missingBio || missingCity || missingPortfolio || missingSlots || missingServices) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-800 mb-2">חסרים שדות:</p>
              <div className="flex flex-wrap gap-1">
                {missingBio && <MissingBadge label="ביו" />}
                {missingCity && <MissingBadge label="עיר" />}
                {missingPortfolio && <MissingBadge label="תמונות" />}
                {missingServices && <MissingBadge label="שירותים" />}
                {missingSlots && <MissingBadge label="שעות זמינות" />}
              </div>
            </div>
          )}

          {/* Bio */}
          {provider.bio && (
            <div>
              <p className="text-xs font-semibold text-textMuted mb-1">ביו</p>
              <p className="text-sm text-textMain bg-cream rounded-xl px-4 py-3">{provider.bio}</p>
            </div>
          )}

          {/* Services */}
          {provider.services?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-textMuted mb-2">שירותים ומחירים</p>
              <div className="space-y-1">
                {provider.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs bg-cream rounded-lg px-3 py-2">
                    <span className="text-textMain">{s.name}</span>
                    <span className="text-textMuted">₪{s.price} · {s.duration_minutes} דק׳</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {provider.portfolio_paths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-textMuted mb-2">תמונות עבודה ({provider.portfolio_paths.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {provider.portfolio_paths.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={imgUrl(p)} alt="" className="w-full aspect-square object-cover rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${provider.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {provider.is_active ? 'פעילה באפליקציה' : 'לא פעילה'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${provider.has_slots ? 'bg-blue-50 text-blue-600' : 'bg-beige text-textMuted'}`}>
              {provider.has_slots ? 'יש שעות זמינות' : 'אין שעות זמינות'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-beige">
            {!provider.is_active && (
              <button
                onClick={() => onApprove(provider.id)}
                disabled={actionId === provider.id}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-60"
              >
                <Check size={14} /> אשרי והפעילי
              </button>
            )}
            {provider.is_active && (
              <button
                onClick={() => onReject(provider.id)}
                disabled={actionId === provider.id}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-60"
              >
                השבתה
              </button>
            )}
            {!provider.is_active && provider.submitted_for_review && (
              <button
                onClick={() => onReject(provider.id)}
                disabled={actionId === provider.id}
                className="flex-1 border border-amber-300 text-amber-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-amber-50 disabled:opacity-60"
              >
                דחיה (החזרה לעריכה)
              </button>
            )}
            <button
              onClick={() => onDelete(provider.id, provider.name)}
              disabled={actionId === provider.id}
              className="border border-red-200 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-60"
            >
              מחק
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminProvidersPage() {
  const router = useRouter()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'active' | 'all'>('pending')
  const [selected, setSelected] = useState<Provider | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/providers')
    const data = await res.json()
    setProviders(data.providers ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(id: string) {
    setActionId(id)
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: true }),
    })
    await load()
    setActionId(null)
    setSelected(null)
  }

  async function reject(id: string) {
    setActionId(id)
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, submitted_for_review: false }),
    })
    await load()
    setActionId(null)
    setSelected(null)
  }

  async function deactivate(id: string) {
    setActionId(id)
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: false }),
    })
    await load()
    setActionId(null)
    setSelected(null)
  }

  async function deleteProvider(id: string, name: string) {
    if (!confirm(`למחוק את ${name}? פעולה זו בלתי הפיכה.`)) return
    setActionId(id)
    await fetch('/api/admin/providers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    setActionId(null)
    setSelected(null)
  }

  const pending = providers.filter((p) => p.submitted_for_review && !p.is_active)
  const active = providers.filter((p) => p.is_active)
  const all = providers

  const displayed = tab === 'pending' ? pending : tab === 'active' ? active : all

  const tabs: { key: typeof tab; label: string; count: number }[] = [
    { key: 'pending', label: 'ממתינות לאישור', count: pending.length },
    { key: 'active', label: 'פעילות', count: active.length },
    { key: 'all', label: 'כולן', count: all.length },
  ]

  return (
    <main className="min-h-screen bg-cream p-4 sm:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/admin')} className="text-textMuted text-sm hover:text-pink px-2 py-1">← חזרה</button>
          <h1 className="text-2xl font-bold text-oak">ניהול בעלות עסק</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-beige rounded-2xl p-1 mb-5 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? 'bg-pink text-white' : 'text-textMuted hover:text-textMain'}`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-beige text-textMuted'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-textMuted py-16">טוען...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center text-textMuted py-16">
            {tab === 'pending' ? 'אין בקשות ממתינות לאישור' : 'אין נתונים להצגה'}
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((p) => {
              const missingBio = !p.bio?.trim()
              const missingCity = !p.city?.trim()
              const missingPortfolio = !p.portfolio_paths?.length
              const missingSlots = !p.has_slots
              const missingServices = !p.services?.length
              const incomplete = missingBio || missingCity || missingPortfolio || missingSlots || missingServices

              return (
                <div
                  key={p.id}
                  className={`bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow ${incomplete ? 'border-amber-200' : p.is_active ? 'border-green-200' : 'border-beige'}`}
                  onClick={() => setSelected(p)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-beige flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {p.profile_image_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgUrl(p.profile_image_path)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-textMain text-sm hover:text-pink transition-colors">{p.name}</span>
                        {p.specialty && <span className="text-xs text-pink">{p.specialty}</span>}
                        {p.city && <span className="text-xs text-textMuted">· {p.city}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : p.submitted_for_review ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.is_active ? 'פעילה' : p.submitted_for_review ? 'ממתינה לאישור' : 'לא פעילה'}
                        </span>
                        {incomplete && (
                          <>
                            {missingBio && <MissingBadge label="ביו" />}
                            {missingCity && <MissingBadge label="עיר" />}
                            {missingPortfolio && <MissingBadge label="תמונות" />}
                            {missingServices && <MissingBadge label="שירותים" />}
                            {missingSlots && <MissingBadge label="שעות" />}
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-textMuted flex-shrink-0">לחצי לפרטים ←</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <ProviderModal
          provider={selected}
          onClose={() => setSelected(null)}
          onApprove={approve}
          onReject={selected.is_active ? deactivate : reject}
          onDelete={deleteProvider}
          actionId={actionId}
        />
      )}
    </main>
  )
}
