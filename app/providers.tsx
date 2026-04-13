'use client'

import { Toaster } from 'react-hot-toast'

export function Providers() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: { fontFamily: 'var(--font-inter)', background: '#FAF8F3', color: '#2A1F17' },
      }}
    />
  )
}
