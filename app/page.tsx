'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LandingPage() {
  const { t, lang } = useLanguage()
  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold tracking-[0.3em] text-oak mb-2">SIEL</h1>
        <p className="text-textMuted text-sm tracking-widest uppercase">{t.providerSystem}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        <Link href="/login?role=rabbi" className="flex-1 group">
          <div className="bg-white border border-beige rounded-2xl p-10 text-center hover:border-pink hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="w-16 h-16 bg-pink-pale rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✡</span>
            </div>
            <h2 className="text-xl font-semibold text-textMain mb-3">{t.rabbiRole}</h2>
            <p className="text-textMuted text-sm leading-relaxed">{t.rabbiDesc}</p>
            <div className="mt-6 inline-block bg-oak text-white text-sm font-medium px-6 py-2.5 rounded-full group-hover:bg-textMain transition-colors">
              {t.rabbiEnter}
            </div>
          </div>
        </Link>

        <div className="flex-1">
          <div className="bg-white border border-beige rounded-2xl p-10 text-center hover:border-pink hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-pink-pale rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">💅</span>
            </div>
            <h2 className="text-xl font-semibold text-textMain mb-3">{t.beautyRole}</h2>
            <p className="text-textMuted text-sm leading-relaxed">{t.beautyDesc}</p>
            <div className="mt-4 text-xs text-pink font-medium bg-pink-pale px-3 py-1 rounded-full inline-block mb-4">
              ₪100 / {lang === 'he' ? 'חודש' : 'month'}
            </div>
            <Link href="/login?role=beauty_pro" className="block bg-pink text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity">
              {t.beautyEnter}
            </Link>
            <Link href="/for-beauty" className="block mt-3 text-xs text-pink hover:underline">
              {lang === 'he' ? 'רוצי לדעת יותר על SIEL לעסקים? ←' : 'Learn how SIEL works for businesses →'}
            </Link>
          </div>
        </div>
      </div>

      <Link href="/for-beauty" className="w-full max-w-2xl mt-4 block">
        <div className="bg-white border border-pink/30 rounded-2xl px-6 py-4 text-center hover:border-pink hover:shadow-sm transition-all duration-200">
          <p className="text-sm font-medium text-pink">
            {lang === 'he' ? '✨ רוצי לדעת יותר על SIEL לעסקים?' : '✨ Learn how SIEL works for businesses'}
          </p>
          <p className="text-xs text-textMuted mt-1">
            {lang === 'he' ? 'למה שווה להצטרף · איך עובד · מה צריך' : 'Why join · How it works · What you need'}
          </p>
        </div>
      </Link>

      <Link href="/about-app" className="w-full max-w-2xl mt-3 block">
        <div className="bg-white border border-beige rounded-2xl px-6 py-4 text-center hover:border-oak hover:shadow-sm transition-all duration-200">
          <p className="text-sm font-medium text-oak">
            {lang === 'he' ? '📱 הסבר על אפליקציית SIEL' : '📱 About the SIEL app'}
          </p>
          <p className="text-xs text-textMuted mt-1">
            {lang === 'he' ? 'מה האפליקציה עושה · מדריך לבודקים' : 'What the app does · Guide for testers'}
          </p>
        </div>
      </Link>

      <p className="mt-10 text-textMuted text-xs">
        SIEL © {new Date().getFullYear()} · {t.allRightsReserved}
      </p>
    </main>
  )
}
