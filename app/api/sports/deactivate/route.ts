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

// 2) Fetch currently active sports
async function fetchActiveSports() {
  const { data: sports, error } = await supabase
    .from('sports')
    .select('id, name')
    .eq('is_active', true)
  
  if (error) throw new Error(`Failed to fetch active sports: ${error.message}`)
  return sports!
}

// 3) Deactivate all sports
async function deactivateAllSports() {
  const { error } = await supabase
    .from('sports')
    .update({ is_active: false })
    .eq('is_active', true)
  
  if (error) throw new Error(`Failed to deactivate sports: ${error.message}`)
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!isValidSecret(secret)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const activeSports = await fetchActiveSports()
    const count = activeSports.length

    if (count > 0) {
      await deactivateAllSports()
    }

    return NextResponse.json({
      success: true,
      deactivatedCount: count,
      message: count
        ? `Deactivated ${count} sports for Sunday.`
        : 'No active sports to deactivate.',
      timestamp: new Date().toISOString(),
      operation: 'deactivate'
    })
  } catch (err: unknown) {
    console.error('Sports deactivation error:', err);
    const message =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
