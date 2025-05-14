'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Login method
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Invalid email or password' }
  }

  return { success: true }
}

// Signup method
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Check mitwpu email
  if (!email.endsWith('@mitwpu.edu.in')) {
    return { error: 'Please use your college email (mitwpu.edu.in)' }
  }

  // Check if email already exists in 'profiles' table
  const { data } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)

  if (data && data.length > 0) {
    return { error: 'Email already registered' }
  }

  // If not found, allow signup
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// Logout method
export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
  }

  // ✅ Revalidate cache and redirect
  revalidatePath('/', 'layout')  // clears session cache
  redirect('/login')             // force redirect to login
}