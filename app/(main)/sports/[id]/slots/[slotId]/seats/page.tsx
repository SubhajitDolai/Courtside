'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Loader, Clock, Users, CheckCircle, XCircle, Calendar, Trophy, TicketCheck, UserCheck, ArrowLeft } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { getTodayDateInIST } from '@/lib/date'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import BannedRedirect from '@/components/banned-redirect'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import QRCodeComponent from 'react-qr-code'

// Define types for real-time subscription
interface Booking {
  id: string;
  sport_id: string;
  slot_id: string;
  user_id: string;
  booking_date: string;
  seat_number: number;
  status: string;
  created_at: string;
}

// ✅ Convert 24hr time to 12hr format
const formatTime12hr = (time24: string) => {
  const [hour, minute] = time24.split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute))
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function SeatsPage() {
  const params = useParams()
  const router = useRouter()

  // ✅ Memoize supabase client instead of recreating it
  const supabase = useMemo(() => createClient(), [])

  const sportId = params.id as string
  const slotId = params.slotId as string

  // Invite state
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // ✅ Seat limit from sports table
  const [seatLimit, setSeatLimit] = useState<number | null>(null)
  const [sportName, setSportName] = useState<string>('')

  // ✅ Loading states
  const [loading, setLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  // ✅ Seat user has clicked
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  // ✅ Terms & Conditions checkbox
  const [agreed, setAgreed] = useState(false)

  // ✅ show connection status state
  const [showConnectionStatus, setShowConnectionStatus] = useState(false)

  // ✅ Slot details (start time, end time, gender, allowedUserType)
  const [slotDetails, setSlotDetails] = useState<{ start_time: string; end_time: string; gender: string; allowedUserType: string } | null>(null)

  const { start } = useGlobalLoadingBar()

  // ✅ Add back handler function after your other handlers
  const handleGoBack = () => {
    start()
    router.push(`/sports/${sportId}/slots`)
  }

  // ✅ Fetch current seat bookings with Realtime
  const fetchBookings = useCallback(async () => {
    const today = getTodayDateInIST()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('sport_id', sportId)
      .eq('slot_id', slotId)
      .eq('booking_date', today)

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    return data || []
  }, [sportId, slotId, supabase])

  // ✅ Use Realtime subscription for bookings
  const { data: bookings, isConnected, forceReconnect } = useRealtimeSubscription<Booking>(
    'bookings',     // table name
    [],             // initial data (empty array)
    fetchBookings,  // fetch function
    'slot_id',      // filter column
    slotId         // filter value
  )

  // ✅ Count seats summary safely
  const totalSeats = seatLimit || 0
  const availableSeats = totalSeats - bookings.length
  const bookedSeats = bookings.filter((b) => b.status === 'booked').length
  const checkedInSeats = bookings.filter((b) => b.status === 'checked-in').length
  const checkedOutSeats = bookings.filter((b) => b.status === 'checked-out').length

  // ✅ Checks user gender & loads seats & slot details
  const checkGenderAndFetch = useCallback(async () => {
    setLoading(true)

    try {
      // ✅ Check user login first (this needs to be sequential)
      const userRes = await supabase.auth.getUser()
      const user = userRes.data.user
      if (!user) return router.push('/login')

      // ✅ PARALLEL API CALLS - Make all these requests at once
      const [profileResult, slotResult, sportResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('gender, user_type')
          .eq('id', user.id)
          .single(),
        supabase
          .from('slots')
          .select('gender, start_time, end_time, allowed_user_type, is_active')
          .eq('id', slotId)
          .single(),
        supabase
          .from('sports')
          .select('seat_limit, name, is_active')
          .eq('id', sportId)
          .single()
      ])

      // ✅ Handle profile check
      if (!profileResult.data) return router.push('/onboarding')

      // ✅ Handle slot check
      if (!slotResult.data) return router.push(`/sports/${sportId}/slots`)

      // ✅ Check if sport is active
      if (!sportResult.data?.is_active) {
        toast.error(`${sportResult.data?.name} is currently unavailable`)
        return router.push('/sports')
      }

      // ✅ Check if slot is active  
      if (!slotResult.data.is_active) {
        toast.error('This time slot is currently unavailable')
        return router.push(`/sports/${sportId}/slots`)
      }

      // ✅ Check gender rule (after we have both profile and slot data)
      const profile = profileResult.data
      const slot = slotResult.data

      if (slot.gender !== 'any' && profile.gender !== slot.gender) {
        toast.error(`This slot is only for ${slot.gender} users`)
        return router.push(`/sports/${sportId}/slots`)
      }

      // ✅ Check user type eligibility 
      if (slot.allowed_user_type !== 'any' && profile.user_type !== slot.allowed_user_type) {
        toast.error(`This slot is reserved for ${slot.allowed_user_type} members only`)
        return router.push(`/sports/${sportId}/slots`)
      }

      // ✅ Set all state at once
      setSlotDetails({
        start_time: slot.start_time,
        end_time: slot.end_time,
        gender: slot.gender,
        allowedUserType: slot.allowed_user_type
      })

      setSeatLimit(sportResult.data?.seat_limit || 0)
      setSportName(sportResult.data?.name || '')

    } catch (error) {
      console.error('Error in checkGenderAndFetch:', error)
      toast.error('Failed to load page data')
    } finally {
      setLoading(false)
    }
  }, [router, slotId, sportId, supabase])

  // ✅ Initial fetch (with gender check)
  useEffect(() => {
    checkGenderAndFetch()
  }, [checkGenderAndFetch])

  useEffect(() => {
    // Only show connection status after a delay to prevent initial flash
    const timer = setTimeout(() => {
      setShowConnectionStatus(true)
    }, 3000) // Show after 3 seconds
    return () => clearTimeout(timer)
  }, [])

  // ✅ Get current status of seat
  const getSeatStatus = (seatNumber: number) => {
    const booking = bookings.find((b) => b.seat_number === seatNumber)
    if (booking?.status === 'checked-in') return 'occupied'
    if (booking?.status === 'checked-out') return 'checkedout'
    if (booking?.status === 'booked') return 'booked'
    return 'free'
  }

  // ✅ Confirm & create booking
  const handleConfirmBooking = async () => {
    if (!selectedSeat) return
    if (!agreed) {
      toast.error('Please accept the Terms and Conditions to proceed')
      return
    }

    setIsBooking(true)

    // ✅ Check user
    const userRes = await supabase.auth.getUser()
    const user = userRes.data.user
    if (!user) {
      toast.error('Please login to continue')
      setIsBooking(false)
      return
    }

    // Store the current date by using "@/lib/date.ts" which has the function in order to set the 'booking_date'
    const today = getTodayDateInIST()

    // ✅ NEW: Double-check sport and slot are still active before booking
    const [sportCheck, slotCheck] = await Promise.all([
      supabase
        .from('sports')
        .select('is_active, name')
        .eq('id', sportId)
        .single(),
      supabase
        .from('slots')
        .select('is_active')
        .eq('id', slotId)
        .single()
    ])

    if (!sportCheck.data?.is_active) {
      toast.error(`${sportCheck.data?.name || 'This sport'} is no longer available`)
      setIsBooking(false)
      return
    }

    if (!slotCheck.data?.is_active) {
      toast.error('This time slot is no longer available')
      setIsBooking(false)
      return
    }

    // ✅ NEW: Check if user already has ANY booking for this sport today (regardless of slot)
    // const { data: existingSportBooking } = await supabase
    //   .from('bookings')
    //   .select('id, slot_id')
    //   .eq('user_id', user.id)
    //   .eq('sport_id', sportId) // Same sport
    //   .eq('booking_date', today)
    //   .in('status', ['booked', 'checked-in', 'checked-out'])
    //   .maybeSingle()

    // if (existingSportBooking) {
    //   // ✅ Get slot details separately to avoid join complexity
    //   const { data: slotData } = await supabase
    //     .from('slots')
    //     .select('start_time, end_time')
    //     .eq('id', existingSportBooking.slot_id)
    //     .single()

    //   const timeInfo = slotData ?
    //     `${formatTime12hr(slotData.start_time)} - ${formatTime12hr(slotData.end_time)}` :
    //     'Unknown time'

    //   // Replace the existing toast message in the existingSportBooking check:
    //   toast.error(`Booking limit reached! You've already secured your ${sportName} spot today (${timeInfo}). Try exploring other sports or come back tomorrow for another session!`)
    //   setIsBooking(false)
    //   return
    // }

    // ✅ Prevent multiple booking by user
    const { data: existing, error: existingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .eq('sport_id', sportId)
      .eq('slot_id', slotId)
      .eq('booking_date', today)
      .maybeSingle()

    if (existingError) {
      console.error('Existing booking check error:', existingError)
      toast.error('Unable to verify your existing bookings. Please try again.')
      setIsBooking(false)
      return
    }

    if (existing) {
      toast.error(`You've already secured spot #${existing.seat_number} for this session!`)
      setIsBooking(false)
      return
    }

    // 🆕 Check for time conflicts with other bookings
    if (slotDetails) {
      // First get information about all the user's bookings for today
      const { data: userBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, slot_id, sport_id, status')
        .eq('user_id', user.id)
        .eq('booking_date', today)
        .in('status', ['booked', 'checked-in'])

      if (bookingsError) {
        console.error('User bookings check error:', bookingsError)
        toast.error('Unable to check for booking conflicts. Please try again.')
        setIsBooking(false)
        return
      }

      // If the user has other bookings, check for time overlap
      if (userBookings && userBookings.length > 0) {
        // Current slot times
        const currentStartTime = slotDetails.start_time
        const currentEndTime = slotDetails.end_time

        // For each booking, fetch slot details and check for overlap
        for (const booking of userBookings) {
          // Skip the current sport/slot if user is trying to book the same one
          if (booking.sport_id === sportId && booking.slot_id === slotId) continue

          // Get slot details for this booking
          const { data: bookingSlot } = await supabase
            .from('slots')
            .select('start_time, end_time')
            .eq('id', booking.slot_id)
            .single()

          // Get sport details for this booking
          const { data: bookingSport } = await supabase
            .from('sports')
            .select('name')
            .eq('id', booking.sport_id)
            .single()

          if (!bookingSlot || !bookingSport) continue

          const existingStartTime = bookingSlot.start_time
          const existingEndTime = bookingSlot.end_time

          // Check for any overlap between time slots
          const hasOverlap = (
            // New booking starts during existing booking
            (currentStartTime >= existingStartTime && currentStartTime < existingEndTime) ||
            // New booking ends during existing booking
            (currentEndTime > existingStartTime && currentEndTime <= existingEndTime) ||
            // New booking completely contains existing booking
            (currentStartTime <= existingStartTime && currentEndTime >= existingEndTime)
          )

          if (hasOverlap) {
            toast.error(`You already have a booking for ${bookingSport.name} during this time slot`)
            setIsBooking(false)
            return
          }
        }
      }
    }

    // ✅ Try booking seat (DB constraint prevents double booking)
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        sport_id: sportId,
        slot_id: slotId,
        booking_date: today,
        seat_number: selectedSeat,
        status: 'booked',
      })
      .select()
      .single()

    if (error) {
      console.error('Booking creation error:', error)

      // ✅ Enhanced error handling by error code
      if (error.code === '23505') {
        toast.error(`Oops! Someone just booked spot #${selectedSeat}. Please choose another available spot.`)
      } else if (error.code === '23503') {
        toast.error('Invalid booking data. Please refresh the page and try again.')
      } else if (error.message?.includes('jwt')) {
        toast.error('Your session has expired. Please log in again.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network connection issue. Please check your internet and try again.')
      } else {
        toast.error('Unable to complete your booking. Please try again or contact support if the issue persists.')
      }

      setIsBooking(false)
      return
    }

    // ✅ Success!
    toast.success(`Spot #${selectedSeat} is yours! Redirecting to confirmation...`)
    router.prefetch(`/sports/${sportId}/slots/${slotId}/success?booking_id=${data.id}`)
    window.location.href = `/sports/${sportId}/slots/${slotId}/success?booking_id=${data.id}`
  }

  // ✅ Loading UI
  if (loading || seatLimit === null) {
    return (
      <>
        <BannedRedirect />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
            {/* Header Skeleton - EXACTLY MATCHING */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
              </div>
              <Skeleton className="h-9 sm:h-11 md:h-14 lg:h-16 w-80 sm:w-96 md:w-[30rem] lg:w-[36rem] mx-auto mb-4 sm:mb-6" />

              {/* Breadcrumb info skeleton - EXACTLY MATCHING */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-20" /> {/* Sport name */}
                </div>
                <Skeleton className="h-1 w-1 rounded-full" /> {/* Dot */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" /> {/* Time range */}
                </div>
                <Skeleton className="h-1 w-1 rounded-full" /> {/* Dot */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" /> {/* Gender */}
                </div>
                <Skeleton className="h-1 w-1 rounded-full" /> {/* Dot */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-18" /> {/* User type */}
                </div>
                <Skeleton className="h-1 w-1 rounded-full" /> {/* Dot */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-20" /> {/* Date */}
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Seat Selection Card Skeleton */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    {/* Left side - Title and description skeleton */}
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 sm:h-6 w-40 mb-1" />
                      <Skeleton className="h-3 sm:h-4 w-64" />
                    </div>

                    {/* Right side - Connection status skeleton */}
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                      <Skeleton className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" />
                      <Skeleton className="h-3 w-12 sm:w-16" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Legend Skeleton */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <Skeleton className="h-4 w-13" />
                      </div>
                    ))}
                  </div>

                  {/* Seats Grid Skeleton - Dynamic like actual UI */}
                  <div className="flex justify-center">
                    <div className="grid gap-4 sm:gap-5 max-w-fit mx-auto grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <Skeleton key={i} className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Analytics Skeleton - EXACTLY MATCHING */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 p-3 text-center">
                  <Skeleton className="h-5 w-6 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-md border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                  <Skeleton className="h-5 w-6 mx-auto mb-2" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800 p-3 text-center">
                  <Skeleton className="h-5 w-6 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/50 rounded-md border border-rose-200 dark:border-rose-800 p-3 text-center">
                  <Skeleton className="h-5 w-6 mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 p-3 text-center col-span-2 sm:col-span-1">
                  <Skeleton className="h-5 w-6 mx-auto mb-2 bg-neutral-200 dark:bg-neutral-600" />
                  <Skeleton className="h-4 w-14 mx-auto bg-neutral-200 dark:bg-neutral-600" />
                </div>
              </div>

              {/* Action Buttons Skeleton - EXACTLY MATCHING */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="flex-1 h-14 sm:h-12 rounded-lg" />
                <Skeleton className="flex-1 h-14 sm:h-12 rounded-lg" />
              </div>
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
          {/* ✅ Connection Status Indicator */}
          {!isConnected && showConnectionStatus && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-800 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">

                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                      <div className="w-3 h-3 bg-amber-500 rounded-full absolute inset-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Reconnecting...
                      </span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        Live updates paused
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />

                  {/* Retry button */}
                  <button
                    onClick={forceReconnect}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors duration-200 flex items-center gap-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Booking loader */}
          {isBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-8 max-w-sm mx-4 relative overflow-hidden">
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-50/50 to-neutral-100/30 dark:from-neutral-800/30 dark:to-neutral-900/50 rounded-3xl" />

                <div className="relative flex flex-col items-center gap-6">
                  {/* Enhanced Animated Seat Icon */}
                  <div className="relative">
                    {/* Pulsing Background Ring */}
                    <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl animate-ping" />

                    {/* Main Icon Container */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-neutral-700 to-neutral-900 dark:from-neutral-600 dark:to-neutral-800 rounded-xl flex items-center justify-center shadow-lg">
                      <TicketCheck className="w-8 h-8 text-white animate-pulse" />
                    </div>

                    {/* Enhanced Spinning Ring */}
                    <div className="absolute inset-0 rounded-xl border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 animate-spin" />
                    <div className="absolute inset-1 rounded-lg border-2 border-transparent border-b-neutral-700/30 dark:border-b-neutral-400/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>

                  {/* Enhanced Text Content */}
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      Securing Your Spot
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {selectedSeat && `Booking spot #${selectedSeat}...`}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        This will only take a moment
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Progress Dots with Different Animation */}
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-neutral-700 to-neutral-800 dark:from-neutral-400 dark:to-neutral-300 rounded-full animate-bounce shadow-sm" />
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-neutral-700 to-neutral-800 dark:from-neutral-400 dark:to-neutral-300 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-neutral-700 to-neutral-800 dark:from-neutral-400 dark:to-neutral-300 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }} />
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-pulse shadow-sm" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Section - EXACTLY MATCHING SPORTS PAGE */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div 
                className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl"
                onClick={handleGoBack}
              >
                <TicketCheck className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Select Your
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Spot</span>
            </h1>

            {slotDetails && (
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">{sportName}</span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600">•</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTime12hr(slotDetails.start_time)} – {formatTime12hr(slotDetails.end_time)}</span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600">•</div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span className="font-medium capitalize">{slotDetails.gender}</span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600">•</div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium capitalize">{slotDetails.allowedUserType}</span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600">•</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            )}
          </div>

          {/* ✅ REDESIGNED SEATS SECTION - CLEAN & MODERN */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Seat Selection Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  {/* Left side - Title and description */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white leading-tight">Choose Your Spot</h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 sm:mt-1">Select an available spot for your session</p>
                  </div>

                  {/* Right side - Live connection status */}
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {isConnected ? (
                        <>
                          <div className="relative">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full absolute inset-0 animate-ping" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            <span className="hidden sm:inline">Live Status</span>
                            <span className="sm:hidden">Live</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse" />
                          <span className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                            <span className="hidden sm:inline">Connecting...</span>
                            <span className="sm:hidden">Connecting</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Legend - Clean & Minimal */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">In Use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-neutral-400 rounded-full" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Finished</span>
                  </div>
                </div>

                {/* Seats Grid - BIGGER SEATS + DYNAMIC CENTERING */}
                <div className="flex justify-center">
                  <div className={`grid gap-4 sm:gap-5 max-w-fit mx-auto ${seatLimit <= 4 ? 'grid-cols-2 sm:grid-cols-4' :
                    seatLimit <= 6 ? 'grid-cols-3 sm:grid-cols-6' :
                      seatLimit <= 8 ? 'grid-cols-4 sm:grid-cols-8' :
                        seatLimit <= 12 ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-12' :
                          seatLimit <= 16 ? 'grid-cols-4 sm:grid-cols-8 md:grid-cols-16' :
                            'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8'
                    }`}>
                    {Array.from({ length: seatLimit }, (_, i) => {
                      const seatNumber = i + 1
                      const status = getSeatStatus(seatNumber)

                      let bgColor = 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                      let icon = null
                      let disabled = false

                      if (status === 'booked') {
                        bgColor = 'bg-amber-500 shadow-amber-500/20'
                        icon = <CheckCircle className="w-4 h-4 absolute top-1.5 right-1.5 text-white" />
                        disabled = true
                      }
                      if (status === 'occupied') {
                        bgColor = 'bg-rose-500 shadow-rose-500/20'
                        icon = <Users className="w-4 h-4 absolute top-1.5 right-1.5 text-white" />
                        disabled = true
                      }
                      if (status === 'checkedout') {
                        bgColor = 'bg-neutral-400 shadow-neutral-400/20'
                        icon = <XCircle className="w-4 h-4 absolute top-1.5 right-1.5 text-white" />
                        disabled = true
                      }

                      return (
                        <Button
                          key={seatNumber}
                          className={`
                            w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-lg font-bold text-white text-base sm:text-lg
                            ${bgColor} 
                            ${disabled ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'} 
                            transition-all duration-200 shadow-lg relative
                            ${selectedSeat === seatNumber ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-2' : ''}
                          `}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedSeat(seatNumber)
                            setAgreed(false)
                          }}
                          title={`Spot #${seatNumber} - ${status === 'free' ? 'Available' : status}`}
                        >
                          {icon}
                          <span>{seatNumber}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Analytics - Modern Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-800 p-3 text-center">
                <div className="text-xl sm:text-lg font-bold text-neutral-900 dark:text-white">{totalSeats}</div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-md border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                <div className="text-xl sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">{availableSeats}</div>
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Available</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800 p-3 text-center">
                <div className="text-xl sm:text-lg font-bold text-amber-600 dark:text-amber-400">{bookedSeats}</div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Booked</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/50 rounded-md border border-rose-200 dark:border-rose-800 p-3 text-center">
                <div className="text-xl sm:text-lg font-bold text-rose-600 dark:text-rose-400">{checkedInSeats}</div>
                <div className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">In Use</div>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 p-3 text-center col-span-2 sm:col-span-1">
                <div className="text-xl sm:text-lg font-bold text-neutral-600 dark:text-neutral-400">{checkedOutSeats}</div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Finished</div>
              </div>
            </div>

            {/* Action Buttons - Clean & Prominent */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsInviteOpen(true)}
                className="flex-1 h-14 sm:h-12 cursor-pointer rounded-lg bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-base order-1 sm:order-2"
              >
                <Users className="w-4 h-4 mr-2 animate-pulse" />
                Invite Friends
              </Button>

              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1 h-14 sm:h-12 cursor-pointer rounded-lg border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 font-medium text-base order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Slots
              </Button>
            </div>
          </div>

          {/* ✅ Booking Confirm Dialog */}
          <AlertDialog open={selectedSeat !== null} onOpenChange={(open) => {
            if (!isBooking && !open) {
              setSelectedSeat(null)
              setAgreed(false)
            }
          }}>
            <AlertDialogContent className="sm:max-w-md border bg-white dark:bg-neutral-900 shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Confirm Your Booking
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="text-center text-neutral-700 dark:text-neutral-300">
                    <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg mb-4 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-lg font-medium text-neutral-900 dark:text-white">
                        Spot <span className="text-2xl font-bold bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent">{selectedSeat}</span>
                      </p>
                      {slotDetails && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatTime12hr(slotDetails.start_time)} – {formatTime12hr(slotDetails.end_time)} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>

                    <div className="text-left text-sm border rounded-xl bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 p-4 h-48 overflow-y-auto mb-4 space-y-4">
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">Terms & Conditions</h4>

                      {/* Conditionally Render T&C Based on Sport */}
                      {sportName?.toLowerCase().includes('swimming') && (
                        <div>
                          <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Swimming Pool Rules</h5>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Swimming is allowed only during designated hours under supervision.</li>
                            <li>Proper swimwear must be worn at all times.</li>
                            <li>Users must shower before entering the pool.</li>
                            <li>No running, rough play, acrobatics, or reckless diving.</li>
                            <li>No chewing gum or shoes allowed on the pool deck.</li>
                            <li>Personal belongings are your responsibility.</li>
                            <li>Inappropriate behavior may result in removal from the facility.</li>
                          </ul>
                        </div>
                      )}

                      {sportName?.toLowerCase().includes('badminton') && (
                        <div>
                          <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Badminton Court Rules</h5>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Use the court only during allocated slots.</li>
                            <li>Wear non-marking sports shoes and proper attire.</li>
                            <li>Bring your own rackets and shuttlecocks.</li>
                            <li>No spitting, chewing gum, or food inside the court.</li>
                            <li>Rough behavior or misuse of equipment is not allowed.</li>
                            <li>Unauthorized access or slot misuse may lead to penalties.</li>
                            <li>You are responsible for your personal belongings.</li>
                          </ul>
                        </div>
                      )}

                      {sportName?.toLowerCase().includes('wrestling') && (
                        <div>
                          <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Wrestling Rules</h5>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Practice only during your allotted slot under supervision.</li>
                            <li>Wear appropriate wrestling attire and maintain hygiene.</li>
                            <li>Remove footwear before stepping on the mats.</li>
                            <li>No roughhousing or aggressive behavior beyond training guidelines.</li>
                            <li>Do not use the facility if you have open wounds or infections.</li>
                            <li>Report any injuries immediately to the supervisor.</li>
                            <li>Personal belongings should be kept outside the wrestling area.</li>
                          </ul>
                        </div>
                      )}

                      {sportName?.toLowerCase().includes('table tennis') && (
                        <div>
                          <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Table Tennis Rules</h5>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Play only during your reserved slot time.</li>
                            <li>Wear appropriate indoor sports shoes and comfortable attire.</li>
                            <li>Handle equipment with care; no rough or aggressive play.</li>
                            <li>Food, drinks, and chewing gum are prohibited in the playing area.</li>
                            <li>Maintain respectful behavior towards other players and staff.</li>
                            <li>Personal belongings are your responsibility.</li>
                          </ul>
                        </div>
                      )}

                      {!['swimming', 'badminton', 'wrestling', 'table tennis'].some(sport =>
                        sportName?.toLowerCase().includes(sport)
                      ) && (
                          <div>
                            <h5 className="font-medium text-neutral-800 dark:text-neutral-100">General Rules</h5>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                              <li>Facility usage is permitted only during your allocated booking time.</li>
                              <li>Please handle all equipment with care and respect to maintain quality.</li>
                              <li>Maintain cleanliness and ensure all waste is disposed of appropriately.</li>
                              <li>Respect fellow users by maintaining a quiet and considerate environment.</li>
                              <li>Consumption of food and beverages near the gaming area is strictly prohibited.</li>
                              <li>Return all equipment to its designated place upon completion of use.</li>
                              <li>Report any damaged or malfunctioning equipment to the facility staff promptly.</li>
                              <li>Follow all instructions provided by facility personnel at all times.</li>
                              <li>Ensure mobile devices are set to silent mode to minimize disruptions.</li>
                            </ul>
                          </div>
                        )}

                      {/* Medical Declaration */}
                      <div>
                        <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Medical Declaration</h5>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>I am medically fit and have no known health conditions that may endanger myself or others.</li>
                          <li>I authorize the university to take action in a medical emergency.</li>
                        </ul>
                      </div>

                      {/* Penalties */}
                      <div>
                        <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Penalties & Disciplinary Actions</h5>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Temporary suspension (up to 1 month) for violations.</li>
                          <li>Year-long or permanent bans for serious or repeated offenses.</li>
                          <li>Damage caused intentionally or negligently will be charged to the user.</li>
                          <li>The university&apos;s decision is final and binding.</li>
                        </ul>
                      </div>

                      {/* Liability Waiver */}
                      <div>
                        <h5 className="font-medium text-neutral-800 dark:text-neutral-100">Liability Waiver</h5>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Facility usage is at your own risk.</li>
                          <li>The university/staff are not responsible for any injury, loss, or damage.</li>
                        </ul>
                      </div>

                      <p className="text-muted-foreground">
                        By booking and using the facility, you agree to these terms and conditions.
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground">Cancellation allowed up to 30 minutes prior.</p>

                    <div className="flex items-start sm:items-center space-x-2 pt-4 justify-center text-left">
                      <Checkbox className='cursor-pointer' id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
                      <label htmlFor="terms" className="text-sm leading-snug">
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 underline underline-offset-4">
                          Terms & Conditions
                        </Link>
                      </label>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
                <AlertDialogCancel disabled={isBooking} className="sm:w-32 cursor-pointer border text-neutral-700 dark:text-neutral-300">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !agreed}
                  className={`sm:w-32 cursor-pointer ${!agreed || isBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isBooking ? (
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Booking...
                    </div>
                  ) : 'Confirm'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Invite Friends Dialog */}
          <AlertDialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <AlertDialogContent className="sm:max-w-md border bg-white dark:bg-neutral-900 shadow-xl rounded-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Invite Friends
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="text-center text-neutral-700 dark:text-neutral-300 mt-4">
                    {/* QR Code with Loading State */}
                    <div className="flex justify-center my-4 relative min-h-[170px]">
                      <QRCodeComponent
                        value={typeof window !== 'undefined' ? window.location.href : ''}
                        size={150}
                        className="rounded-lg border border-gray-300 shadow-md bg-white p-2"
                        style={{ height: "150px", maxWidth: "150px", width: "150px" }}
                        viewBox="0 0 150 150"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Ask a nearby friend to scan this code to join.
                    </p>

                    {/* Social Media Buttons - WhatsApp and Device only */}
                    <div className="flex flex-col gap-4">
                      <Button
                        className="bg-[#25D366] text-white hover:bg-[#22c15e] py-3 rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(
                              `Join me for ${sportName} at this slot (${formatTime12hr(
                                slotDetails?.start_time || ''
                              )} – ${formatTime12hr(slotDetails?.end_time || '')}): ${window.location.href}`
                            )}`,
                            '_blank'
                          )
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                        </svg>
                        Share via WhatsApp
                      </Button>
                      <Button
                        className="bg-neutral-800 text-white hover:bg-neutral-900 py-3 rounded-lg cursor-pointer shadow-md flex items-center justify-center gap-2"
                        onClick={async () => {
                          if (!navigator.share) {
                            toast.error('Sharing not supported on this device');
                            return;
                          }

                          try {
                            await navigator.share({
                              title: `Join me for ${sportName}`,
                              text: `Join me for ${sportName} at this slot (${formatTime12hr(
                                slotDetails?.start_time || ''
                              )} – ${formatTime12hr(slotDetails?.end_time || '')})`,
                              url: window.location.href,
                            });
                            toast.success('Link shared successfully!');
                          } catch (error: unknown) {
                            // Don't show error for user cancellations
                            if (error instanceof Error && error.name === 'AbortError') {
                              return;
                            } else {
                              toast.error('Could not share link');
                              console.error('Sharing error:', error);
                            }
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                        </svg>
                        Share via device
                      </Button>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center pt-6">
                <AlertDialogCancel className="sm:w-32 cursor-pointer border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                  Close
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  )
}