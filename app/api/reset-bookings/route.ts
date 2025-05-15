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

// 2) Fetch all bookings
async function fetchBookings() {
  const { data: bookings, error } = await supabase.from('bookings').select('*')
  if (error) throw new Error(`Failed to fetch bookings: ${error.message}`)
  return bookings!
}

// 3) Archive into bookings_history
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function archiveBookings(bookings: any[]) {
  const { error } = await supabase.from('bookings_history').insert(bookings)
  if (error) throw new Error(`Failed to insert into bookings_history: ${error.message}`)
}

// 4) Delete only the rows (not the table) by matching every non‑null id
async function resetBookings() {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .not('id', 'is', null)
  if (error) throw new Error(`Failed to delete bookings: ${error.message}`)
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!isValidSecret(secret)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookings = await fetchBookings()
    const count = bookings.length

    if (count > 0) {
      await archiveBookings(bookings)
      await resetBookings()
    }

    return NextResponse.json({
      success: true,
      archivedCount: count,
      message: count
        ? `Archived ${count} bookings and cleared table.`
        : 'No bookings to archive.',
    })
  } catch (err: unknown) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
