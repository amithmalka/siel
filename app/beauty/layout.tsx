import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function BeautyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?role=beauty_pro')

  return (
    <div className="flex min-h-screen">
      <Sidebar role="beauty_pro" />
      <main className="ml-64 flex-1 p-8 bg-cream min-h-screen">
        {children}
      </main>
    </div>
  )
}
