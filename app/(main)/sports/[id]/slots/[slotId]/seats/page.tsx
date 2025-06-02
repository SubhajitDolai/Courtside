'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { Loader, Clock, Users, CheckCircle, XCircle, Calendar, Trophy, TicketCheck } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { getTodayDateInIST } from '@/lib/date'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import BannedRedirect from '@/components/banned-redirect'

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
  const supabase = createClient()

  const sportId = params.id as string
  const slotId = params.slotId as string

  // Invite state & qrLoading state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);

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

  // ✅ Slot details (start time, end time, gender, allowedUserType)
  const [slotDetails, setSlotDetails] = useState<{ start_time: string; end_time: string; gender: string; allowedUserType: string } | null>(null)

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
  const { data: bookings } = useRealtimeSubscription<Booking>(
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

    // ✅ Check user login
    const userRes = await supabase.auth.getUser()
    const user = userRes.data.user
    if (!user) return router.push('/login')

    // ✅ Check profile gender
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single()
    if (!profile) return router.push('/onboarding')

    // ✅ Fetch slot's gender rule & timings
    const { data: slot } = await supabase
      .from('slots')
      .select('gender, start_time, end_time, allowed_user_type')
      .eq('id', slotId)
      .single()
    if (!slot) return router.push(`/sports/${sportId}/slots`)

    // 🚫 Block wrong gender
    if (slot.gender !== 'any' && profile.gender !== slot.gender) {
      toast.error(`This slot is only for ${slot.gender} users`)
      return router.push(`/sports/${sportId}/slots`)
    }

    setSlotDetails({
      start_time: slot.start_time,
      end_time: slot.end_time,
      gender: slot.gender,
      allowedUserType: slot.allowed_user_type
    }) // ✅ Save slot details

    // ✅ Load seat limit
    const { data: sport } = await supabase
      .from('sports')
      .select('seat_limit, name')
      .eq('id', sportId)
      .single()

    setSeatLimit(sport?.seat_limit || 0)
    setSportName(sport?.name || '')
    setLoading(false)
  }, [router, slotId, sportId, supabase])

  // ✅ Initial fetch (with gender check)
  useEffect(() => {
    checkGenderAndFetch()
  }, [checkGenderAndFetch])

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
    //   toast.error(`Booking limit reached! You've already secured your ${sportName} spot today (${timeInfo}). Try exploring other sports or come back tomorrow for another session! 🎯`)
    //   setIsBooking(false)
    //   return
    // }

    // ✅ Prevent multiple booking by user
    const { data: existing } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .eq('sport_id', sportId)
      .eq('slot_id', slotId)
      .eq('booking_date', today)
      .maybeSingle()

    if (existing) {
      toast.error('You already booked this slot today 🚫')
      setIsBooking(false)
      return
    }

    // 🆕 Check for time conflicts with other bookings
    if (slotDetails) {
      // First get information about all the user's bookings for today
      const { data: userBookings } = await supabase
        .from('bookings')
        .select('id, slot_id, sport_id, status')
        .eq('user_id', user.id)
        .eq('booking_date', today)
        .in('status', ['booked', 'checked-in'])

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
      console.error(error)

      // ✅ Seat already booked
      if (error.code === '23505') {
        toast.error('Someone else just grabbed this spot! Please select another.')
        // No need to manually refresh - Realtime will handle it
      } else {
        toast.error('Booking failed. Please try again.')
      }

      setIsBooking(false)
      return
    }

    // ✅ Success!
    toast.success('Booking successful')
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
            {/* Header Skeleton - MATCHING SPORTS PAGE */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
              </div>
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto" />
            </div>
            
            {/* Seats Grid Skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl mx-auto mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
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
          {/* ✅ Booking loader */}
          {isBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader className="w-8 h-8 animate-spin text-white" />
                <p className="text-white text-md">Booking your spot...</p>
              </div>
            </div>
          )}

          {/* Header Section - EXACTLY MATCHING SPORTS PAGE */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
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
                  <Users className="h-4 w-4" />
                  <span className="font-medium capitalize">{slotDetails.gender}</span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-600">•</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seats Selection Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl mx-auto mb-8">
            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm text-center">
              <div className="flex flex-col items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full mb-2" />
                <span>Available</span>
              </div>
              <div className="flex flex-col items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mb-2" />
                <span>Booked</span>
              </div>
              <div className="flex flex-col items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                <div className="w-4 h-4 bg-rose-500 rounded-full mb-2" />
                <span>Checked-in</span>
              </div>
              <div className="flex flex-col items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                <div className="w-4 h-4 bg-gray-400 rounded-full mb-2" />
                <span>Checked-out</span>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 max-w-2xl mx-auto">
              {Array.from({ length: seatLimit }, (_, i) => {
                const seatNumber = i + 1
                const status = getSeatStatus(seatNumber)
                let bgColor = 'bg-green-500 hover:bg-green-600'
                let icon = null

                if (status === 'booked') {
                  bgColor = 'bg-yellow-400'
                  icon = <CheckCircle className="w-4 h-4 absolute top-1 right-1 text-white opacity-80" />
                }
                if (status === 'occupied') {
                  bgColor = 'bg-rose-500'
                  icon = <Users className="w-4 h-4 absolute top-1 right-1 text-white opacity-80" />
                }
                if (status === 'checkedout') {
                  bgColor = 'bg-gray-400'
                  icon = <XCircle className="w-4 h-4 absolute top-1 right-1 text-white opacity-80" />
                }

                return (
                  <Button
                    key={seatNumber}
                    className={`h-16 text-white font-semibold ${bgColor} hover:brightness-105 transition rounded-xl relative flex items-center justify-center`}
                    disabled={status !== 'free'}
                    onClick={() => {
                      setSelectedSeat(seatNumber)
                      setAgreed(false)
                    }}
                    title={`Spot #${seatNumber}`}
                  >
                    {icon}
                    <span className="text-lg">{seatNumber}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Invite Friends Button */}
          <div className="text-center mb-8">
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900 transition-all duration-200 shadow-lg hover:shadow-xl"
              variant="secondary"
            >
              <Users className="h-4 w-4 mr-2 animate-pulse" />
              Invite Friends
            </Button>
          </div>

          {/* ✅ Live Seat Analytics */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center w-full max-w-2xl mx-auto">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold">{totalSeats}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="text-xl font-bold text-green-600">{availableSeats}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Booked</span>
              <span className="text-xl font-bold text-yellow-600">{bookedSeats}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Checked-in</span>
              <span className="text-xl font-bold text-red-600">{checkedInSeats}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Checked-out</span>
              <span className="text-xl font-bold text-gray-600">{checkedOutSeats}</span>
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
                      <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
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
                <AlertDialogCancel disabled={isBooking} className="sm:w-32 border text-neutral-700 dark:text-neutral-300">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !agreed}
                  className={`sm:w-32 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900 ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      {qrLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader className="h-8 w-8 animate-spin text-primary" />
                          <span className="sr-only">Loading QR code</span>
                        </div>
                      ) : null}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                          window.location.href
                        )}&size=150x150`}
                        alt="QR Code"
                        className={`rounded-lg border border-gray-300 shadow-md bg-white p-2 ${qrLoading ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => setQrLoading(false)}
                        onError={() => {
                          setQrLoading(false);
                          toast.error("Failed to load QR code");
                        }}
                        style={{ transition: 'opacity 0.3s ease' }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Ask a nearby friend to scan this code to join.
                    </p>

                    {/* Social Media Buttons - WhatsApp and Device only */}
                    <div className="flex flex-col gap-4">
                      <Button
                        className="bg-[#25D366] text-white hover:bg-[#22c15e] py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
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
                        className="bg-neutral-800 text-white hover:bg-neutral-900 py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
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
                <AlertDialogCancel className="sm:w-32 border text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
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