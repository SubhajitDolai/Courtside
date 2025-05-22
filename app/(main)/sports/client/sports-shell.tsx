'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import SportsList from '../sports-list'
import { createClient } from '@/utils/supabase/client'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import BannedRedirect from '@/components/banned-redirect'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

interface Sport {
  id: string
  name: string
  image_url: string | null
}

export default function SportsShell({ initialSports }: { initialSports: Sport[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { start } = useGlobalLoadingBar()
  
  // Define fetchSports function that returns data instead of setting state
  const fetchSports = useCallback(async () => {
    const { data, error } = await supabase
      .from('sports')
      .select('id, name, image_url')
      .eq('is_active', true)
      .order('name', { ascending: true })
      
    if (error) {
      console.error('Error fetching sports:', error)
      return []
    }
    
    return data || []
  }, [supabase])
  
  // Use Realtime subscription instead of polling
  const { data: sports } = useRealtimeSubscription<Sport>(
    'sports',       // table name
    initialSports,  // initial data from server
    fetchSports     // fetch function
  )

  const handleViewSlots = (sportId: string) => {
    setLoadingId(sportId)
    start()
    router.push(`/sports/${sportId}/slots`)
  }

  return (
    <>
      <BannedRedirect />
      <SportsList
        sports={sports}
        loadingId={loadingId}
        handleViewSlots={handleViewSlots}
      />
    </>
  )
}