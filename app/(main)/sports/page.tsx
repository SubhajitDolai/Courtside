import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SportsClientPage from './client/client-page'

export default async function SportsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.role === 'ban') redirect('/banned')

  const { data: sports } = await supabase
    .from('sports')
    .select('id, name, image_url')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Sports</h2>
      <SportsClientPage sports={sports ?? []} />
    </div>
  )
}
