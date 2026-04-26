import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SIEL Admin',
  description: 'מערכת ניהול SIEL',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'SIEL Admin',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#C4948E',
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
