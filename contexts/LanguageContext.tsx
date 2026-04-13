'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type Lang, type Translations, getT } from '@/lib/i18n/translations'

interface LanguageContextValue {
  lang: Lang
  t: Translations
  dir: 'rtl' | 'ltr'
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'he',
  t: getT('he'),
  dir: 'rtl',
  setLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he')

  useEffect(() => {
    const saved = document.cookie.match(/siel-lang=([^;]+)/)?.[1] as Lang | undefined
    if (saved === 'en' || saved === 'he') setLangState(saved)
  }, [])

  function setLang(newLang: Lang) {
    setLangState(newLang)
    document.cookie = `siel-lang=${newLang}; path=/; max-age=31536000`
  }

  return (
    <LanguageContext.Provider value={{ lang, t: getT(lang), dir: lang === 'he' ? 'rtl' : 'ltr', setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
