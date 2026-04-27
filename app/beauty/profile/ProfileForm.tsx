'use client'

import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { deleteAccount } from '@/app/account/actions'
import { saveProfile } from './actions'
import { Check } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

const ISRAELI_CITIES = [
  'אבו גוש', 'אבן יהודה', 'אופקים', 'אור יהודה', 'אור עקיבא', 'אורנית', 'אזור', 'אילת',
  'אלעד', 'אריאל', 'אשדוד', 'אשקלון', 'באר שבע', 'באר יעקב', 'באקה אל-גרביה', 'בית אריה',
  'בית דגן', 'בית שאן', 'בית שמש', 'ביתר עילית', 'בני ברק', 'בני עייש', 'בת ים', 'גבעת שמואל',
  'גבעתיים', 'גדרה', 'גני תקווה', 'גבעת זאב', 'דימונה', 'הוד השרון', 'הרצליה', 'זכרון יעקב',
  'חדרה', 'חולון', 'חיפה', 'טבריה', 'טירה', 'טירת כרמל', 'טמרה', 'יבנה', 'יהוד-מונוסון',
  'ירושלים', 'ירוחם', 'כוכב יאיר', 'כפר יונה', 'כפר סבא', 'כפר שמריהו', 'כרמיאל',
  'לוד', 'מגדל העמק', 'מודיעין-מכבים-רעות', 'מודיעין עילית', 'מזכרת בתיה', 'מעלה אדומים',
  'מעלות-תרשיחא', 'מצפה רמון', 'נהריה', 'נוף הגליל', 'נס ציונה', 'נצרת', 'נתיבות', 'נתניה',
  'סגולה', 'ערד', 'עפולה', 'עכו', 'פוריה עילית', 'פרדס חנה-כרכור', 'פתח תקווה',
  'צפת', 'קלנסווה', 'קריית אונו', 'קריית ביאליק', 'קריית גת', 'קריית מוצקין', 'קריית מלאכי',
  'קריית שמונה', 'קריית ים', 'ראש העין', 'ראשון לציון', 'רהט', 'רחובות', 'רמה', 'רמלה',
  'רמת גן', 'רמת השרון', 'רעננה', 'שדרות', 'שפרעם', 'תל אביב', 'תל מונד', 'אום אל-פחם',
  'עמנואל', 'אלפי מנשה', 'גן יבנה', 'כסיפה', 'לקיה',
]

interface TagInputHandle { flush: () => void }

const TagInput = forwardRef<TagInputHandle, {
  tags: string[]
  onChange: (t: string[]) => void
  placeholder?: string
}>(function TagInput({ tags, onChange, placeholder }, ref) {
  const [input, setInput] = useState('')

  useImperativeHandle(ref, () => ({
    flush() {
      const trimmed = input.trim()
      if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed])
      setInput('')
    },
  }))

  function addTag(val: string) {
    const trimmed = val.trim()
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed])
    setInput('')
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 border border-beige rounded-xl px-3 py-2.5 bg-cream focus-within:border-pink min-h-[46px]">
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 bg-pink/10 text-pink text-xs font-medium rounded-lg px-2 py-1">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="text-pink/60 hover:text-pink leading-none text-base">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-textMuted/60"
        dir="rtl"
      />
    </div>
  )
})

function CityInput({ cities, onChange }: { cities: string[]; onChange: (c: string[]) => void }) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const suggestions = input.trim().length > 0
    ? ISRAELI_CITIES.filter((c) => c.includes(input.trim()) && !cities.includes(c)).slice(0, 8)
    : []

  function add(city: string) {
    if (!cities.includes(city)) onChange([...cities, city])
    setInput('')
    setOpen(false)
  }

  function addCustom() {
    const trimmed = input.trim()
    if (trimmed && !cities.includes(trimmed)) onChange([...cities, trimmed])
    setInput('')
    setOpen(false)
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0) add(suggestions[0])
      else if (input.trim()) addCustom()
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && !input && cities.length > 0) {
      onChange(cities.slice(0, -1))
    }
  }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex flex-wrap gap-1.5 border border-beige rounded-xl px-3 py-2.5 bg-cream focus-within:border-pink min-h-[46px]">
        {cities.map((c) => (
          <span key={c} className="flex items-center gap-1 bg-pink/10 text-pink text-xs font-medium rounded-lg px-2 py-1">
            {c}
            <button type="button" onClick={() => onChange(cities.filter((x) => x !== c))} className="text-pink/60 hover:text-pink leading-none text-base">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true) }}
          onKeyDown={onKey}
          onFocus={() => { if (input.trim()) setOpen(true) }}
          placeholder={cities.length === 0 ? 'הקלידי עיר ובחרי מהרשימה...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-textMuted/60"
          dir="rtl"
          autoComplete="off"
        />
      </div>
      {open && (suggestions.length > 0 || input.trim().length > 1) && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-beige rounded-xl shadow-lg z-20 overflow-hidden">
          {suggestions.map((c) => (
            <button key={c} type="button"
              onMouseDown={(e) => { e.preventDefault(); add(c) }}
              className="w-full text-right px-4 py-2.5 text-sm text-textMain hover:bg-cream transition-colors border-b border-beige last:border-0">
              {c}
            </button>
          ))}
          {input.trim().length > 1 && !ISRAELI_CITIES.includes(input.trim()) && !cities.includes(input.trim()) && (
            <button type="button"
              onMouseDown={(e) => { e.preventDefault(); addCustom() }}
              className="w-full text-right px-4 py-2.5 text-sm text-pink hover:bg-pink/5 transition-colors">
              הוסיפי &quot;{input.trim()}&quot; ידנית
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export interface ProfileData {
  userId: string
  providerId: string
  name: string
  specialty: string
  city: string
  address: string
  phone: string
  bio: string
  profileImagePath: string
  portfolioPaths: string[]
  isAvailable: boolean
  submittedForReview: boolean
  hasSlots: boolean
}

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [specialties, setSpecialties] = useState<string[]>(
    initial.specialty ? initial.specialty.split(',').map((s) => s.trim()).filter(Boolean) : []
  )
  const [cities, setCities] = useState<string[]>(
    initial.city ? initial.city.split(',').map((s) => s.trim()).filter(Boolean) : []
  )
  const [address, setAddress] = useState(initial.address)
  const [phone, setPhone] = useState(initial.phone)
  const [bio, setBio] = useState(initial.bio)
  const [profileImagePath, setProfileImagePath] = useState(initial.profileImagePath)
  const [portfolioPaths] = useState(initial.portfolioPaths)
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable)
  const [submittedForReview, setSubmittedForReview] = useState(initial.submittedForReview)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const specialtiesRef = useRef<TagInputHandle>(null)
  const supabase = createClient()

  const imageUrl = profileImagePath
    ? `${SUPABASE_URL}/storage/v1/object/public/service-portfolios/${profileImagePath}`
    : null

  async function uploadProfileImage(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `profile/${initial.providerId}.${ext}`
    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'service-portfolios')
    form.append('path', path)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) { toast.error('שגיאה בהעלאה: ' + json.error); return }
    try {
      await saveProfile({ name, specialty: specialties.join(', '), city: cities.join(', '), address, phone, bio, is_available: isAvailable, profile_image_path: path })
      setProfileImagePath(path)
      toast.success('תמונת הפרופיל עודכנה')
    } catch {
      toast.error('שגיאה בשמירת התמונה')
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    specialtiesRef.current?.flush()
    await new Promise((r) => setTimeout(r, 50))
    setLoading(true)
    try {
      await saveProfile({
        name,
        specialty: specialties.join(', '),
        city: cities.join(', '),
        address,
        phone,
        bio,
        is_available: isAvailable,
        profile_image_path: profileImagePath,
      })
      toast.success('הפרופיל עודכן בהצלחה ✓')
      window.location.href = '/beauty/setup'
    } catch (err) {
      toast.error('שגיאה בשמירה: ' + (err instanceof Error ? err.message : 'נסי שוב'))
    } finally {
      setLoading(false)
    }
  }

  async function submitForReview() {
    setSubmitting(true)
    try {
      await saveProfile({ name, specialty: specialties.join(', '), city: cities.join(', '), address, phone, bio, is_available: isAvailable, profile_image_path: profileImagePath, submitted_for_review: true })
      setSubmittedForReview(true)
      toast.success('הבקשה נשלחה לאישור הנהלת SIEL ✅')
    } catch {
      toast.error('שגיאה בשליחה')
    } finally {
      setSubmitting(false)
    }
  }

  const requirements = [
    { label: 'ביו (כמה מילים עלייך)', done: bio.trim().length > 0 },
    { label: 'עיר / כתובת', done: cities.length > 0 || address.trim().length > 0 },
    { label: 'תמונות עבודה', href: '/beauty/portfolio', done: portfolioPaths.length > 0 },
    { label: 'שעות זמינות', href: '/beauty/availability', done: initial.hasSlots },
  ]
  const doneCount = requirements.filter((r) => r.done).length
  const allRequirementsMet = doneCount === requirements.length

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
        <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs text-pink hover:underline">
          {imageUrl ? 'החלפת תמונה' : 'הוספת תמונת פרופיל'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProfileImage(f) }} />
      </div>

      <form onSubmit={save} className="bg-white border border-beige rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">שם העסק / שמך</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream" dir="rtl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-textLight mb-1">התמחויות</label>
          <p className="text-xs text-textMuted mb-1.5">כתבי כל מקצוע שתרצי ולחצי Enter — אפשר להוסיף כמה שתרצי</p>
          <TagInput ref={specialtiesRef} tags={specialties} onChange={setSpecialties}
            placeholder="למשל: ציפורניים גל, הרמת ריסים, גבות, איפור..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-textLight mb-1">ערים / אזורי פעילות <span className="text-pink">*</span></label>
          <p className="text-xs text-textMuted mb-1.5">הקלידי עיר ובחרי מהרשימה — אפשר לבחור כמה ערים</p>
          <CityInput cities={cities} onChange={setCities} />
        </div>

        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">כתובת מדויקת</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="רחוב, מספר בית, קומה..."
            className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream" dir="rtl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">טלפון</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream" dir="rtl" />
        </div>

        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">כמה מילים עלייך <span className="text-pink">*</span></label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            placeholder="למשל: מתמחה בציפורניים גל מזה 5 שנים, אוהבת לשלב עיצובים ייחודיים..."
            className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream resize-none" dir="rtl" />
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium text-textLight">זמינה לתורים</span>
          <button type="button" onClick={() => setIsAvailable(!isAvailable)}
            className={`w-12 h-6 rounded-full transition-colors ${isAvailable ? 'bg-pink' : 'bg-beige-deep'} relative`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'right-1' : 'left-1'}`} />
          </button>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-pink text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60">
          {loading ? 'שומר...' : 'שמירת פרטים'}
        </button>
      </form>

      {/* Progress checklist + submit for review */}
      <div className={`mt-5 rounded-2xl border p-5 ${submittedForReview ? 'bg-green-50 border-green-200' : 'bg-white border-beige'}`}>
        {submittedForReview ? (
          <>
            <h2 className="text-sm font-bold text-green-800 mb-1">✅ הבקשה נשלחה לאישור</h2>
            <p className="text-xs text-green-700">הפרופיל שלך נמצא בבדיקה. נחזור אלייך בהקדם.</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-textMain">שליחה לאישור הנהלת SIEL</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${allRequirementsMet ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {doneCount} מתוך {requirements.length} הושלמו
              </span>
            </div>

            <div className="w-full bg-beige rounded-full h-1.5 mb-4">
              <div
                className={`h-1.5 rounded-full transition-all ${allRequirementsMet ? 'bg-green-500' : 'bg-amber-400'}`}
                style={{ width: `${(doneCount / requirements.length) * 100}%` }}
              />
            </div>

            <ul className="space-y-2.5 mb-4">
              {requirements.map((r) => (
                <li key={r.label} className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${r.done ? 'bg-green-100 text-green-600' : 'bg-beige text-textMuted'}`}>
                    {r.done ? <Check size={11} /> : ''}
                  </span>
                  <span className={`text-sm flex-1 ${r.done ? 'text-green-700 font-medium' : 'text-textMain'}`}>{r.label}</span>
                  {!r.done && 'href' in r && r.href && (
                    <a href={r.href} className="text-xs text-pink font-medium hover:underline flex-shrink-0">הוסיפי ←</a>
                  )}
                </li>
              ))}
            </ul>

            <button type="button" onClick={submitForReview}
              disabled={!allRequirementsMet || submitting}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${allRequirementsMet ? 'bg-oak text-white hover:opacity-90' : 'bg-beige text-textMuted cursor-not-allowed'} disabled:opacity-60`}>
              {submitting ? 'שולחת...' : allRequirementsMet ? 'שלחי לאישור SIEL ←' : 'השלימי את כל השדות כדי לשלוח'}
            </button>
          </>
        )}
      </div>

      <div className="mt-8 border-t border-beige pt-6">
        <h2 className="text-sm font-semibold text-textMuted mb-2">מחיקת חשבון</h2>
        <p className="text-xs text-textMuted mb-4">מחיקת החשבון תסיר אותך מהחיפוש באפליקציה.</p>
        <button type="button"
          onClick={async () => {
            if (!confirm('את בטוחה שתרצי למחוק את החשבון? לא ניתן לבטל פעולה זו.')) return
            await deleteAccount(initial.userId, 'beauty_pro')
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="w-full border border-red-200 text-red-500 rounded-xl py-2.5 text-sm hover:bg-red-50 transition-colors">
          מחיקת חשבון
        </button>
      </div>
    </div>
  )
}
