import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Supabase config missing', exists: false }, { status: 500 })
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: {
        apiKey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    })

    const data = await response.json()
    const exactMatch = (data.users || []).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (user: any) => user.email && user.email.toLowerCase() === email.toLowerCase()
    )

    return NextResponse.json({ exists: !!exactMatch })
  } catch {
    return NextResponse.json({ error: 'Internal error', exists: false }, { status: 500 })
  }
}
