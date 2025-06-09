'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import BannedRedirect from '@/components/banned-redirect'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { Loader, Calendar, Users, Trophy } from 'lucide-react'

interface Sport {
  id: string
  name: string
  image_url: string | null
}

// ✅ Individual Sport Card Component - Memoized for optimal performance
const SportCard = React.memo(function SportCard({
  sport,
  index,
  isLoading,
  onViewSlots,
}: {
  sport: Sport
  index: number
  isLoading: boolean
  onViewSlots: (sportId: string) => void
}) {
  return (
    <Card 
      className="group border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden"
    >
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          {sport.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sport Image */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={sport.image_url || '/mit.webp'}
            alt={sport.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 4} // ✅ Priority load first 4 images
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Sport Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Book Now</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full h-11 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            disabled={isLoading}
            onClick={() => onViewSlots(sport.id)}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>View Slots</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  // ✅ Custom comparison function for optimal memoization
  // Only re-render if sport data or loading state for this specific card changes
  return (
    prevProps.sport.id === nextProps.sport.id &&
    prevProps.sport.name === nextProps.sport.name &&
    prevProps.sport.image_url === nextProps.sport.image_url &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.index === nextProps.index
  )
})

// ✅ Sports List Component - Now uses memoized individual cards
const SportsList = React.memo(function SportsList({
  sports,
  loadingId,
  handleViewSlots,
}: {
  sports: Sport[]
  loadingId: string | null
  handleViewSlots: (sportId: string) => void
}) {
  if (!sports.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
          <Trophy className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Sports Available</h3>
        <p className="text-muted-foreground text-center max-w-md">
          No sports are currently available for booking. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sports.map((sport, index) => (
        <SportCard
          key={sport.id}
          sport={sport}
          index={index}
          isLoading={loadingId === sport.id}
          onViewSlots={handleViewSlots}
        />
      ))}
    </div>
  )
})

// ✅ Loading Skeleton Component (moved from separate file) - Now memoized
const LoadingSkeleton = React.memo(function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="group border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-24" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Sport Image Skeleton */}
            <Skeleton className="w-full h-48 rounded-lg" />

            {/* Sport Info Skeleton */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Action Button Skeleton */}
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

export default function SportsPageClient({ sports: initialSports }: { sports: Sport[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showConnectionStatus, setShowConnectionStatus] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // ✅ Add error state
  const [debouncedIsConnected, setDebouncedIsConnected] = useState(false) // ✅ Debounced connection status
  const supabase = createClient()
  const router = useRouter()
  const { start } = useGlobalLoadingBar()
  
  // ✅ Enhanced fetchSports function with better error handling
  const fetchSports = useCallback(async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('sports')
        .select('id, name, image_url')
        .eq('is_active', true)
        .order('name', { ascending: true })
        
      if (error) {
        console.error('Error fetching sports:', error)
        setError('Failed to fetch sports data')
        return initialSports // ✅ Fallback to initial data on error
      }
      
      return data || []
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Unexpected error occurred')
      return initialSports
    }
  }, [supabase, initialSports])
  
  // Use Realtime subscription and get connection status
  const { data: sports, isConnected } = useRealtimeSubscription<Sport>(
    'sports',       // table name
    initialSports,  // initial data from server
    fetchSports     // fetch function
  )

  // ✅ Debounce connection status to prevent flickering - OPTIMIZED: Reduced delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIsConnected(isConnected)
    }, 200) // Reduced from 500ms to 200ms for faster response
    
    return () => clearTimeout(timer)
  }, [isConnected])

  // Show connection status after initial load - OPTIMIZED: Reduced delay for faster loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectionStatus(true)
      setIsLoading(false)
    }, 800) // Reduced from 2000ms to 800ms for faster loading
    return () => clearTimeout(timer)
  }, [])

  // ✅ Memoize handleViewSlots to prevent SportsList re-renders
  const handleViewSlots = useCallback((sportId: string) => {
    setLoadingId(sportId)
    start()
    router.push(`/sports/${sportId}/slots`)
  }, [start, router])

  return (
    <>
      <BannedRedirect />
      
      {/* ✅ Error state */}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 max-w-sm animate-in slide-in-from-right-4 duration-300">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl relative">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                
                {/* Dynamic Live Status - Using debounced connection status */}
                {showConnectionStatus && debouncedIsConnected && (
                  <>
                    {/* Live pulse ring */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-3xl bg-emerald-500/20 animate-ping" />
                    
                    {/* Live status dot */}
                    <div className="absolute -top-1 -right-1">
                      <div className="relative">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900" />
                        <div className="w-3 h-3 bg-emerald-500 rounded-full absolute inset-0 animate-ping" />
                      </div>
                    </div>
                  </>
                )}

                {/* Connecting/Disconnected State */}
                {showConnectionStatus && !debouncedIsConnected && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Sport</span>
            </h1>
          </div>

          {/* Sports Content */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <SportsList
              sports={sports}
              loadingId={loadingId}
              handleViewSlots={handleViewSlots}
            />
          )}
        </div>
      </div>
    </>
  )
}