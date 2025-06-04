import { getUserWithProfile } from '@/lib/getUserWithProfile'
import { createClient } from '@/utils/supabase/server'
import SportsPageClient from './sports-page-client'

export default async function SportsPage() {
  await getUserWithProfile()

  const supabase = await createClient()
  const { data: sports } = await supabase
    .from('sports')
    .select('id, name, image_url')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return <SportsPageClient sports={sports ?? []} />
}