import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SportsList from './sports-list'

export default async function SportsPage() {
  const supabase = await createClient()

  // ✅ Fetch both in parallel!
  const [{ data: { user } }, { data: sports }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('sports').select('*').eq('is_active', true)
  ])

  // ✅ Auth check
  if (!user) {
    redirect('/login')
  }

  // ✅ Profile check
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <h2 className="text-2xl font-bold mb-6 text-center">Available Sports</h2>
      <SportsList /> {/* ✅ No more sports prop */}
    </div>
  )
}