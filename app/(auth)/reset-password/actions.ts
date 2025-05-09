'use server'

import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData, code: string) {
  const supabase = await createClient()

  // Step 1: Exchange code to session
  const { error: codeError } = await supabase.auth.exchangeCodeForSession(code)

  if (codeError) {
    return { status: codeError.message }
  }

  // Step 2: Update user password
  const { error } = await supabase.auth.updateUser({
    password: formData.get('password') as string,
  })

  if (error) {
    return { status: error.message }
  }

  return { status: 'success' }
}
