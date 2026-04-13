'use client'

import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/contexts/LanguageContext'

export function Providers({ children }: { children?: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'var(--font-inter)', background: '#FAF8F3', color: '#2A1F17' },
        }}
      />
    </LanguageProvider>
  )
}
