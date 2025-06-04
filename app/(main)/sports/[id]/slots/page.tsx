'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader, Clock, Users } from 'lucide-react'
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

  const [userGender, setUserGender] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null)
  const [sportName, setSportName] = useState<string>('')
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
      case 'male': return 'bg-blue-500/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
      case 'female': return 'bg-pink-500/10 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
      default: return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
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

  if (loading) {
    return (
      <>
        <BannedRedirect />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
            {/* Header Skeleton */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
              </div>
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto" />
            </div>
            
            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-11 w-full rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <BannedRedirect />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section - EXACTLY MATCHING SPORTS PAGE */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div
                className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl"
                onClick={() => router.push('/sports')}
              >
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Available
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Slots</span>
            </h1>
            
            {sportName && (
              <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300">
                {sportName}
              </p>
            )}
          </div>

          {visibleSlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Slots Available</h3>
              <p className="text-muted-foreground text-center max-w-md">
                No time slots are currently available for {sportName}. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleSlots.map((slot) => {
                const past = isSlotPast(slot)

                return (
                  <Card 
                    key={slot.id} 
                    className={`group border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden ${
                      past ? 'opacity-50' : ''
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                          <Clock className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                          <span className="text-lg">
                            {formatTime12hr(slot.start_time)} – {formatTime12hr(slot.end_time)}
                          </span>
                        </CardTitle>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getGenderBadgeColor(slot.gender)}`}>
                          <Users className="h-3 w-3 mr-1" />
                          {slot.gender === 'any' ? 'Open to All' : slot.gender.charAt(0).toUpperCase() + slot.gender.slice(1)}
                        </Badge>
                        
                        {past && (
                          <Badge variant="destructive" className="px-3 py-1 rounded-full text-xs">
                            Ended
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Button 
                        onClick={() => handleViewSeats(slot.id)} 
                        className="w-full h-11 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        disabled={past || loadingSlotId === slot.id}
                      >
                        {loadingSlotId === slot.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Select Seats</span>
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}