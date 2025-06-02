'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Login method
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }

  // Get user profile for role-based redirect
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Role-based redirect
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/')
    }
  }

  return { error: null }
}

// Signup method
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate MITWPU email
  if (!email.endsWith('@mitwpu.edu.in')) {
    return { error: 'Please use your college email (mitwpu.edu.in)' }
  }

  try {
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

    // best error handling
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('fetch failed')) {
        return { error: 'No internet connection. Please check your network.' }
      }
      return { error: error.message }
    }

    return { success: true }

  } catch {
    // Random error (e.g. network crash, unexpected)
    return { error: 'Something went wrong. Please try again.' }
  }
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