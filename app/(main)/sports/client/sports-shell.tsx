'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SportsList from '../sports-list'
import { createClient } from '@/utils/supabase/client'

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

  useEffect(() => {
    const fetchSports = async () => {
      const { data } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (data) setSports(data)
    }

    const interval = setInterval(fetchSports, 5000)
    return () => clearInterval(interval)
  }, [supabase])

  const handleViewSlots = (sportId: string) => {
    setLoadingId(sportId)
    router.push(`/sports/${sportId}/slots`)
  }

  return (
    <SportsList
      sports={sports}
      loadingId={loadingId}
      handleViewSlots={handleViewSlots}
    />
  )
}