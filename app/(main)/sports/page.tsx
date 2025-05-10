
import { checkProfile } from '@/lib/check-profile'
import { createClient } from '@/utils/supabase/server'
import SportsList from './sports-list'

export default async function SportsPage() {
  // ✅ Protect page server-side
  await checkProfile()

  // ✅ Fetch sports server-side
  const supabase = await createClient()
  const { data: sports } = await supabase
    .from('sports')
    .select('*')
    .eq('is_active', true)

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <h2 className="text-2xl font-bold mb-6 text-center">Available Sports</h2>

      {/* ✅ Pass data to client component */}
      <SportsList sports={sports || []} />
    </div>
  )
}
