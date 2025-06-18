import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase client using Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1) Validate the secret key
function isValidSecret(secret: string | null): boolean {
  return secret === process.env.BACKUP_CRON_SECRET
}

// 2) Fetch currently inactive sports
async function fetchInactiveSports() {
  const { data: sports, error } = await supabase
    .from('sports')
    .select('id, name')
    .eq('is_active', false)
  
  if (error) throw new Error(`Failed to fetch inactive sports: ${error.message}`)
  return sports!
}

// 3) Activate all sports
async function activateAllSports() {
  const { error } = await supabase
    .from('sports')
    .update({ is_active: true })
    .eq('is_active', false)
  
  if (error) throw new Error(`Failed to activate sports: ${error.message}`)
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!isValidSecret(secret)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const inactiveSports = await fetchInactiveSports()
    const count = inactiveSports.length

    if (count > 0) {
      await activateAllSports()
    }

    return NextResponse.json({
      success: true,
      activatedCount: count,
      message: count
        ? `Activated ${count} sports for Monday.`
        : 'No inactive sports to activate.',
      timestamp: new Date().toISOString(),
      operation: 'activate'
    })
  } catch (err: unknown) {
    console.error('Sports activation error:', err);
    const message =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
