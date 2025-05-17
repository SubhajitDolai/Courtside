import { getUserWithProfile } from '@/lib/getUserWithProfile'
import { createClient } from '@/utils/supabase/server'
import SportsClientPage from './client/client-page'

export default async function SportsPage() {
  await getUserWithProfile()

  const supabase = await createClient()
  const { data: sports } = await supabase
    .from('sports')
    .select('id, name, image_url')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Sports</h2>
      <SportsClientPage sports={sports ?? []} />
    </div>
  )
}
