'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import BannedRedirect from '@/components/banned-redirect'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

// Define the types
interface Slot {
  id: string
  start_time: string
  end_time: string
  sport_id: string
  is_active: boolean
  gender: string
  allowed_user_type: string
}

export default function SportSlotsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sportId = params.id
  const supabase = createClient()

  // Remove this state as it will be handled by the hook
  // const [slots, setSlots] = useState<any[]>([])
  
  const [userGender, setUserGender] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null)
  const [sportName, setSportName] = useState<string>('')
  // Keep loading for initial state
  const [loading, setLoading] = useState(true)
  const { start } = useGlobalLoadingBar()

  // Get user profile data (this doesn't need to be part of the realtime subscription)
  useEffect(() => {
    const fetchUserData = async () => {
      const userRes = await supabase.auth.getUser()
      const user = userRes.data.user

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gender, user_type')
          .eq('id', user.id)
          .single()

        setUserGender(profile?.gender || null)
        setUserType(profile?.user_type || null)
      }
    }

    fetchUserData()
  }, [supabase])

  // Fetch sport name (separate from slot data)
  useEffect(() => {
    const fetchSportName = async () => {
      const { data: sport } = await supabase
        .from('sports')
        .select('name')
        .eq('id', sportId)
        .single()

      setSportName(sport?.name || '')
    }

    fetchSportName()
  }, [sportId, supabase])

  // ✅ Fetch slots with realtime updates
  const fetchSlots = useCallback(async () => {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('sport_id', sportId)
      .eq('is_active', true)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching slots:', error)
      return []
    }
      
    setLoading(false) // Set loading to false after initial load
    return data || []
  }, [sportId, supabase])
  
  // Use Realtime subscription for slots
  const { data: slots } = useRealtimeSubscription<Slot>(
    'slots',        // table name
    [],             // initial data (empty array)
    fetchSlots,     // fetch function
    'sport_id',     // filter column
    sportId         // filter value
  )

  // ✅ Gender + user_type filter logic
  const visibleSlots = slots.filter((slot) => {
    // ✅ Gender filter
    const genderOk = slot.gender === 'any' || slot.gender === userGender

    // ✅ User type filter
    const userTypeOk = slot.allowed_user_type === 'any' || slot.allowed_user_type === userType

    return genderOk && userTypeOk
  })

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-500 text-white'
      case 'female': return 'bg-pink-500 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  // ✅ Check if slot expired
  const isSlotPast = (slot: Slot) => {
    const now = new Date()
    const [hour, minute] = slot.end_time.split(':').map(Number)
    const slotEnd = new Date()
    slotEnd.setHours(hour, minute, 0, 0)
    return now > slotEnd
  }

  // ✅ Convert to 12hr (eg: 5:30 PM)
  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const handleViewSeats = (slotId: string) => {
    setLoadingSlotId(slotId)
    start()
    router.push(`/sports/${sportId}/slots/${slotId}/seats`)
  }

  return (
    <>
      <BannedRedirect />
      <div className="pt-30 p-6 min-h-screen bg-muted/40">
        <h1 className="text-3xl font-bold mb-2 text-center">Available Slots</h1>

        {/* ✅ Sport name */}
        {sportName && (
          <p className="text-center text-muted-foreground mb-6 text-lg">{sportName}</p>
        )}

        {loading ? (
          <div className="pt-13 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : visibleSlots.length === 0 ? (
          <div className='flex items-center justify-center min-h-[60vh] my-12'>
            <p className="text-center text-muted-foreground text-lg">No slots available for {sportName}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {visibleSlots.map((slot) => {
              const past = isSlotPast(slot)

              return (
                <Card key={slot.id} className={`hover:shadow-md transition-shadow ${past ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CardHeader className="flex flex-col gap-2">
                    <div className="flex items-center justify-between w-full">
                      <CardTitle className="text-lg font-semibold">
                        {formatTime12hr(slot.start_time)} – {formatTime12hr(slot.end_time)}
                      </CardTitle>
                      <Badge className={`px-4 py-1 rounded-full text-sm whitespace-nowrap ${getGenderBadgeColor(slot.gender)}`}>
                        {slot.gender === 'any' ? 'Open to All' : slot.gender.charAt(0).toUpperCase() + slot.gender.slice(1)}
                      </Badge>
                    </div>
                    {past && (
                      <Badge variant="destructive" className="w-fit text-xs">
                        Ended
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handleViewSeats(slot.id)} className="w-full" disabled={past || loadingSlotId === slot.id}>
                      {loadingSlotId === slot.id ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : 'Book now'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}