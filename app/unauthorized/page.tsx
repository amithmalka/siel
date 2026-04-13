'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function UnauthorizedPage() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-textMain mb-3">{t.noAccess}</h1>
        <p className="text-textMuted mb-6">{t.noPermission}</p>
        <Link href="/" className="bg-pink text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90">
          {t.backToHome}
        </Link>
      </div>
    </main>
  )
}
