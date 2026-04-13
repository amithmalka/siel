'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/lib/types'
import {
  MessageSquare,
  User,
  LayoutDashboard,
  Image,
  Calendar,
  CheckSquare,
  LogOut,
} from 'lucide-react'

const RABBI_LINKS = [
  { href: '/rabbi', label: 'דשבורד', icon: LayoutDashboard },
  { href: '/rabbi/inbox', label: 'תיבת הודעות', icon: MessageSquare },
  { href: '/rabbi/profile', label: 'פרופיל', icon: User },
]

const BEAUTY_LINKS = [
  { href: '/beauty', label: 'דשבורד', icon: LayoutDashboard },
  { href: '/beauty/appointments', label: 'תורים', icon: CheckSquare },
  { href: '/beauty/availability', label: 'זמינות', icon: Calendar },
  { href: '/beauty/portfolio', label: 'פורטפוליו', icon: Image },
  { href: '/beauty/profile', label: 'פרופיל', icon: User },
]

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const links = role === 'rabbi' ? RABBI_LINKS : BEAUTY_LINKS
  const accentColor = role === 'rabbi' ? 'bg-oak' : 'bg-pink'

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-beige flex flex-col h-screen fixed top-0 left-0">
      {/* Logo */}
      <div className="p-6 border-b border-beige">
        <span className="text-2xl font-bold tracking-widest text-oak">SIEL</span>
        <p className="text-xs text-textMuted mt-1">
          {role === 'rabbi' ? 'ניהול רב' : 'ניהול בעלת מקצוע'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' + role && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? `${accentColor} text-white`
                  : 'text-textLight hover:bg-cream hover:text-textMain'
              }`}
            >
              <Icon size={16} />
              <span dir="rtl">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-beige">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:bg-cream hover:text-textMain w-full transition-all"
        >
          <LogOut size={16} />
          <span>יציאה</span>
        </button>
      </div>
    </aside>
  )
}
