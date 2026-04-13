import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SIEL · ניהול ספקים',
  description: 'מערכת ניהול ספקי שירות SIEL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="ltr">
      <body className={`${inter.variable} font-sans bg-cream min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
