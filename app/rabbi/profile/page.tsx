'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { deleteAccount } from '@/app/account/actions'

export default function RabbiProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(false)
  const [rabbiId, setRabbiId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: bo } = await supabase.from('backoffice_users').select('linked_entity_id').eq('id', user.id).single()
      if (!bo) return
      setRabbiId(bo.linked_entity_id)
      const { data: rabbi } = await supabase.from('rabbis').select('name, specialty, is_available').eq('id', bo.linked_entity_id).single()
      if (rabbi) { setName(rabbi.name); setSpecialty(rabbi.specialty ?? ''); setIsAvailable(rabbi.is_available) }
    }
    load()
  }, [supabase])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('rabbis').update({ name, specialty, is_available: isAvailable }).eq('id', rabbiId)
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('הפרופיל עודכן')
  }

  return (
    <div dir="rtl" className="max-w-lg">
      <h1 className="text-2xl font-bold text-textMain mb-6">פרופיל</h1>
      <form onSubmit={save} className="bg-white border border-beige rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">שם</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream" />
        </div>
        <div>
          <label className="block text-sm font-medium text-textLight mb-1.5">התמחות</label>
          <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full border border-beige rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink bg-cream" />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-textLight">זמין לשאלות</span>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-12 h-6 rounded-full transition-colors ${isAvailable ? 'bg-oak' : 'bg-beige-deep'} relative`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-oak text-white font-medium py-3 rounded-xl text-sm hover:opacity-90 disabled:opacity-60">
          {loading ? 'שומר...' : 'שמירה'}
        </button>
      </form>

      <div className="mt-8 border-t border-beige pt-6">
        <h2 className="text-sm font-semibold text-textMuted mb-2">מחיקת חשבון</h2>
        <p className="text-xs text-textMuted mb-4">מחיקת החשבון תסיר אותך מהמערכת. תוכל להצטרף מחדש בעתיד.</p>
        <button
          type="button"
          onClick={async () => {
            if (!confirm('האם אתה בטוח שברצונך למחוק את החשבון? לא ניתן לבטל פעולה זו.')) return
            await deleteAccount(userId, 'rabbi')
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="w-full border border-red-200 text-red-500 rounded-xl py-2.5 text-sm hover:bg-red-50 transition-colors"
        >
          מחיקת חשבון
        </button>
      </div>
    </div>
  )
}
