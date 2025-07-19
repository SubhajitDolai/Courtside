
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { email } = await req.json()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase config missing', exists: false }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  try {
    const { data, error } = await supabase.rpc('user_exists_by_email', { input_email: email })
    if (error) {
      return NextResponse.json({ error: error.message, exists: false }, { status: 500 })
    }
    return NextResponse.json({ exists: !!data })
  } catch (err) {
    console.error('Supabase user_exists_by_email RPC error:', err)
    return NextResponse.json({ error: 'Internal error', exists: false }, { status: 500 })
  }
}
