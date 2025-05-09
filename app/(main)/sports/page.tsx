'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function SportsPage() {
  const [sports, setSports] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSports = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true)
      setSports(data || [])
    }

    fetchSports()
  }, [])

  const handleViewSlots = (sportId: string) => {
    setLoadingId(sportId)
    router.push(`/sports/${sportId}/slots`)
  }

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <h2 className="text-2xl font-bold mb-6 text-center">Available Sports</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sports.map((sport) => (
          <Card key={sport.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{sport.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="w-full h-48 relative rounded-md overflow-hidden">
                <Image
                  src={sport.image_url || '/mit.jpg'}
                  alt={sport.name}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                className="w-full flex items-center justify-center gap-2"
                disabled={loadingId === sport.id}
                onClick={() => handleViewSlots(sport.id)}
              >
                {loadingId === sport.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'View Slots'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
        {!sports.length && (
          <p className="col-span-full text-center text-muted-foreground">
            No sports available at the moment.
          </p>
        )}
      </div>
    </div>
  )
}
