'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  MessageSquare,
  User,
  LayoutDashboard,
  Image,
  Calendar,
  CheckSquare,
  LogOut,
  Scissors,
  Users,
  MessageCircle,
  Trash2,
  ShieldCheck,
} from 'lucide-react'

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { lang, t, setLang } = useLanguage()

  const RABBI_LINKS = [
    { href: '/rabbi', label: t.dashboard, icon: LayoutDashboard },
    { href: '/rabbi/inbox', label: t.inbox, icon: MessageSquare },
    { href: '/rabbi/profile', label: t.profile, icon: User },
  ]

  const BEAUTY_LINKS = [
    { href: '/beauty', label: t.dashboard, icon: LayoutDashboard },
    { href: '/beauty/appointments', label: t.appointments, icon: CheckSquare },
    { href: '/beauty/availability', label: t.availability, icon: Calendar },
    { href: '/beauty/portfolio', label: t.portfolio, icon: Image },
    { href: '/beauty/services', label: t.services, icon: Scissors },
    { href: '/beauty/profile', label: t.profile, icon: User },
  ]

  const ADMIN_LINKS = [
    { href: '/admin', label: 'לוח בקרה', icon: ShieldCheck },
    { href: '/admin/providers', label: 'ניהול עסקים', icon: Scissors },
    { href: '/admin/rabbis', label: 'ניהול רבנים', icon: Users },
    { href: '/rabbi/inbox', label: 'הודעות רבנים', icon: MessageSquare },
    { href: '/admin/appointments', label: 'ניהול תורים', icon: Calendar },
    { href: '/admin/forum', label: 'קהילה', icon: MessageCircle },
    { href: '/admin/deletion-requests', label: 'בקשות מחיקה', icon: Trash2 },
    { href: '/beauty', label: 'הדשבורד שלי', icon: LayoutDashboard },
  ]

  const links = role === 'rabbi' ? RABBI_LINKS : role === 'admin' ? ADMIN_LINKS : BEAUTY_LINKS
  const accentColor = role === 'rabbi' ? 'bg-oak' : role === 'admin' ? 'bg-purple-600' : 'bg-pink'

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  function toggleLang() {
    const next = lang === 'he' ? 'en' : 'he'
    setLang(next)
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-beige flex flex-col h-screen fixed top-0 left-0">
      {/* Logo */}
      <div className="p-6 border-b border-beige">
        <span className="text-2xl font-bold tracking-widest text-oak">SIEL</span>
        <p className="text-xs text-textMuted mt-1">
          {role === 'rabbi' ? t.rabbiManagement : role === 'admin' ? 'ניהול מערכת' : t.beautyManagement}
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
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Language toggle + Sign out */}
      <div className="p-4 border-t border-beige space-y-1">
        <button
          onClick={toggleLang}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:bg-cream hover:text-textMain w-full transition-all"
        >
          <span className="text-base">{lang === 'he' ? '🇬🇧' : '🇮🇱'}</span>
          <span>{lang === 'he' ? 'English' : 'עברית'}</span>
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted hover:bg-cream hover:text-textMain w-full transition-all"
        >
          <LogOut size={16} />
          <span>{t.signOut}</span>
        </button>
      </div>
    </aside>
  )
}
