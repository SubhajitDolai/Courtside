'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    prn: formData.get('prn'),
    email: user.email,
    course: formData.get('course'),
    gender: formData.get('gender')
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/sports')
}