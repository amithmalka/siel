'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { updatePortfolioPaths } from '@/app/beauty/portfolio/actions'

interface Props {
  providerId: string
  initialPaths: string[]
}

export function PortfolioGrid({ providerId, initialPaths }: Props) {
  const [paths, setPaths] = useState<string[]>(initialPaths)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const getPublicUrl = (path: string) => `${supabaseUrl}/storage/v1/object/public/service-portfolios/${path}`

  async function upload(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `portfolio/${providerId}/${Date.now()}.${ext}`

    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'service-portfolios')
    form.append('path', path)

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok) {
      toast.error('שגיאה בהעלאה: ' + json.error)
      setUploading(false)
      return
    }
    const newPaths = [...paths, path]
    try {
      await updatePortfolioPaths(newPaths)
      setPaths(newPaths)
      toast.success('התמונה הועלתה')
    } catch {
      toast.error('שגיאה בשמירה')
    }
    setUploading(false)
  }

  async function remove(path: string) {
    const newPaths = paths.filter((p) => p !== path)
    try {
      await updatePortfolioPaths(newPaths)
      setPaths(newPaths)
      toast.success('התמונה הוסרה')
    } catch {
      toast.error('שגיאה בהסרה')
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border-2 border-dashed border-beige-deep rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-pink hover:bg-pink-pale/30 transition-all disabled:opacity-60 text-textMuted"
        >
          <Plus size={24} />
          <span className="text-xs">{uploading ? 'מעלה...' : 'הוסיפי תמונה'}</span>
        </button>

        {paths.map((path) => (
          <div key={path} className="relative aspect-square group rounded-2xl overflow-hidden bg-beige">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPublicUrl(path)} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => remove(path)}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} className="text-pink-deep" />
            </button>
          </div>
        ))}
      </div>

      {paths.length > 0 && (
        <button
          onClick={() => { window.location.href = '/beauty/setup' }}
          className="mt-6 w-full max-w-3xl bg-pink text-white font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          סיימתי ←
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />
    </div>
  )
}
