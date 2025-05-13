import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  // ✅ 1) Get logged-in user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // ✅ 2) Get user profile (fetch role too)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single()

  // ❌ No profile ➔ go to onboarding
  if (!profile) {
    redirect('/onboarding')
  }

  // ❌ If banned ➔ kick to banned page
  if (profile.role === 'ban') {
    redirect('/banned')
  }

  // ✅ All good ➔ show profile form
  return (
    <main className="py-30 px-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

      {/* ✅ Profile Edit Form */}
      <ProfileForm profile={profile} />
    </main>
  )
}
