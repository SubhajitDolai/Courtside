import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ✅ Not logged in ➔ redirect to login
  if (!user) {
    return NextResponse.json({ redirect: '/login' })
  }

  // ✅ Check profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role') // only fetching role
    .eq('id', user.id)
    .single()

  // ✅ No profile ➔ redirect to onboarding
  if (!profile) {
    return NextResponse.json({ redirect: '/onboarding' })
  }

  // ✅ All good ➔ allow
  return NextResponse.json({ status: 'ok' })
}
