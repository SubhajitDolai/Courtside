'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SportsList from '../sports-list'
import { createClient } from '@/utils/supabase/client'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import BannedRedirect from '@/components/banned-redirect'

interface Sport {
  id: string
  name: string
  image_url: string | null
}

export default function SportsShell({ initialSports }: { initialSports: Sport[] }) {
  const [sports, setSports] = useState(initialSports)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { start } = useGlobalLoadingBar()

  useEffect(() => {
    const fetchSports = async () => {
      const { data } = await supabase
        .from('sports')
        .select('id, name, image_url')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (data) setSports(data)
    }

    const interval = setInterval(fetchSports, 5000)
    return () => clearInterval(interval)
  }, [supabase])

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