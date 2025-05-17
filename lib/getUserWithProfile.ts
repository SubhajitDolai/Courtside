import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserWithProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.role === 'ban') redirect('/banned')

  return { user, profile }
}