'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const CATEGORIES = ['ציפורניים גל', 'פדיקור', 'עיצוב שיער', 'איפור', 'הסרת שיער', 'טיפול פנים', 'עיסוי']
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export default function BeautyProfilePage() {
  const [providerId, setProviderId] = useState('')
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [address, setAddress] = useState('')
  const [profileImagePath, setProfileImagePath] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: bo } = await supabase.from('backoffice_users').select('linked_entity_id').eq('id', user.id).single()
      if (!bo) return
      setProviderId(bo.linked_entity_id)
      const { data: p } = await supabase.from('service_providers').select('*').eq('id', bo.linked_entity_id).single()
      if (p) {
        setName(p.name ?? '')
        setSpecialty(p.specialty ?? '')
        setCity(p.city ?? '')
        setPhone(p.phone ?? '')
        setBio(p.bio ?? '')
        setAddress(p.address ?? '')
        setProfileImagePath(p.profile_image_path ?? '')
        setIsAvailable(p.is_available ?? true)
      }
    }
    load()
  }, [supabase])

  async function uploadProfileImage(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `profile/${providerId}.${ext}`

    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'service-portfolios')
    form.append('path', path)

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    setUploading(false)

    if (!res.ok) {
      toast.error('שגיאה בהעלאה: ' + json.error)
      return
    }

    // Save to DB
    await supabase.from('service_providers').update({ profile_image_path: path }).eq('id', providerId)
    setProfileImagePath(path)
    toast.success('תמונת הפרופיל עודכנה')
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('service_providers')
      .update({ name, specialty, city, address, phone, bio, is_available: isAvailable })
      .eq('id', providerId)
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('הפרופיל עודכן')
  }

  const imageUrl = profileImagePath
    ? `${SUPABASE_URL}/storage/v1/object/public/service-portfolios/${profileImagePath}`
    : null

  return (
    <div dir="rtl" className="max-w-lg">
      <h1 className="text-2xl font-bold text-textMain mb-6">פרופיל</h1>

      {/* Profile image */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-24 h-24 rounded-full bg-beige border-2 border-beige-deep overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity relative"
          onClick={() => fileRef.current?.click()}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="פרופיל" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-textMuted">👤</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-pink border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-2 text-xs text-pink hover:underline"
        >
          {imageUrl ? 'החלפת תמונה' : 'הוספת תמונת פרופיל'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProfileImage(f) }}
        />
      </div>

      <form onSubmit={save} className="bg-white border border-beige rounded-2xl p-6 space-y-4">
        {[
          { label: 'שם העסק / שמך', val: name, set: setName },
          { label: 'עיר', val: city, set: setCity },
          { label: 'כתובת מדויקת', val: address, set: setAddress },
          { label: 'טלפון', val: phone, set: setPhone },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-textLight mb-1.5">{label}</label>
            <input value={val} onChange={(e) => set(e.target.value)} className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">קטגוריה</label>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">כמה מילים עלייך</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="למשל: מתמחה בציפורניים גל מזה 5 שנים, אוהבת לשלב עיצובים ייחודיים..."
            className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream resize-none"
            dir="rtl"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-textLight">זמינה לתורים</span>
          <button type="button" onClick={() => setIsAvailable(!isAvailable)} className={`w-12 h-6 rounded-full transition-colors ${isAvailable ? 'bg-pink' : 'bg-beige-deep'} relative`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-pink text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60">
          {loading ? 'שומר...' : 'שמירה'}
        </button>
      </form>
    </div>
  )
}
