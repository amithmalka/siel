import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

const ADMIN_EMAIL = 'amitmalka1@gmail.com'

export default async function BeautyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?role=beauty_pro')

  const role = user.email === ADMIN_EMAIL ? 'admin' : 'beauty_pro'

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="ml-64 flex-1 p-8 bg-cream min-h-screen">
        {children}
      </main>
    </div>
  )
}
