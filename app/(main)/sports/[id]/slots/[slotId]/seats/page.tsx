'use client'

import { useEffect, useState } from 'react'
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
import { Loader, Clock, Users, CheckCircle, XCircle, Calendar, Trophy } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

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

  // ✅ Seat limit from sports table
  const [seatLimit, setSeatLimit] = useState<number | null>(null)
  const [sportName, setSportName] = useState<string>('')
  // ✅ Seat bookings fetched from Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])

  // ✅ Loading states
  const [loading, setLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  // ✅ Seat user has clicked
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)

  // ✅ Terms & Conditions checkbox
  const [agreed, setAgreed] = useState(false)

  // ✅ Slot details (start time, end time, gender)
  const [slotDetails, setSlotDetails] = useState<{ start_time: string; end_time: string; gender: string } | null>(null)

  // ✅ Count seats summary safely
  const totalSeats = seatLimit || 0
  const availableSeats = totalSeats - bookings.length
  const bookedSeats = bookings.filter((b) => b.status === 'booked').length
  const checkedInSeats = bookings.filter((b) => b.status === 'checked-in').length
  const checkedOutSeats = bookings.filter((b) => b.status === 'checked-out').length

  // ✅ Initial fetch (with gender check)
  useEffect(() => {
    checkGenderAndFetch()
  }, [])

  // ✅ Auto refresh bookings every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBookings()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ✅ Checks user gender & loads seats & slot details
  const checkGenderAndFetch = async () => {
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
      .select('gender, start_time, end_time')
      .eq('id', slotId)
      .single()
    if (!slot) return router.push(`/sports/${sportId}/slots`)

    // 🚫 Block wrong gender
    if (slot.gender !== 'any' && profile.gender !== slot.gender) {
      toast.error(`This slot is only for ${slot.gender} users`)
      return router.push(`/sports/${sportId}/slots`)
    }

    setSlotDetails(slot) // ✅ Save slot details

    // ✅ Load seat limit
    const { data: sport } = await supabase
      .from('sports')
      .select('seat_limit, name')
      .eq('id', sportId)
      .single()

    setSeatLimit(sport?.seat_limit || 0)
    setSportName(sport?.name || '')
    await refreshBookings()
    setLoading(false)
  }

  // ✅ Fetch current seat bookings
  const refreshBookings = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .eq('sport_id', sportId)
      .eq('slot_id', slotId)
      .eq('booking_date', today)
    setBookings(bookingsData || [])
  }

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

    // booking_date logic broken coz of time zone issue fix-later
    const today = new Date().toISOString().split('T')[0]

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
        toast.error('Sorry, this spot was just booked by someone else. Pick another.')
        await refreshBookings()
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
      <div className="min-h-screen flex flex-col items-center pt-30 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="w-full">
          <Skeleton className="h-10 w-32 mx-auto mb-6" />
          <div className="mb-8 space-y-2 max-w-lg mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-4/5 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6 max-w-2xl mx-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="mt-10 space-y-2 max-w-lg mx-auto">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-30 pb-10 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* ✅ Booking loader */}
      {isBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-white" />
            <p className="text-white text-md">Booking your spot...</p>
          </div>
        </div>
      )}

      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Select Your Spot
        </h1>

        {slotDetails && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-base text-muted-foreground mt-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">{sportName}</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatTime12hr(slotDetails.start_time)} – {formatTime12hr(slotDetails.end_time)}</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium capitalize">{slotDetails.gender}</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl mx-auto mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm text-center">
          <div className="flex flex-col items-center bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
            <div className="w-4 h-4 bg-green-500 rounded-full mb-2" />
            <span>Available</span>
          </div>
          <div className="flex flex-col items-center bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mb-2" />
            <span>Booked</span>
          </div>
          <div className="flex flex-col items-center bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
            <div className="w-4 h-4 bg-rose-500 rounded-full mb-2" />
            <span>Checked-in</span>
          </div>
          <div className="flex flex-col items-center bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
            <div className="w-4 h-4 bg-gray-400 rounded-full mb-2" />
            <span>Checked-out</span>
          </div>
        </div>

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

      {/* ✅ Live Seat Analytics */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center w-full max-w-2xl mx-auto">
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
                <div className="bg-[#F6F5F4] dark:bg-neutral-800 p-4 rounded-lg mb-4 border border-muted">
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">
                    Spot <span className="text-primary text-2xl">{selectedSeat}</span>
                  </p>
                  {slotDetails && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatTime12hr(slotDetails.start_time)} – {formatTime12hr(slotDetails.end_time)} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="text-left text-sm border rounded-xl bg-white dark:bg-neutral-800 border-muted p-4 h-48 overflow-y-auto mb-4 space-y-4">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">Terms & Conditions</h4>

                  {/* Swimming Rules */}
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

                  {/* Badminton Rules */}
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
              className={`sm:w-32 ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    </div>
  )
}