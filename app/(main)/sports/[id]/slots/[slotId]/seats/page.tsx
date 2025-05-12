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
import { Loader } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

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
      .select('seat_limit')
      .eq('id', sportId)
      .single()

    setSeatLimit(sport?.seat_limit || 0)
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
        toast.error('Sorry, this seat was just booked by someone else. Pick another.')
        await refreshBookings()
      } else {
        toast.error('Booking failed. Please try again.')
      }

      setIsBooking(false)
      return
    }

    // ✅ Success!
    toast.success('Booking successful ✅')
    router.prefetch(`/sports/${sportId}/slots/${slotId}/success?booking_id=${data.id}`)
    window.location.href = `/sports/${sportId}/slots/${slotId}/success?booking_id=${data.id}`
  }

  // ✅ Loading UI
  if (loading || seatLimit === null) {
    return (
      <div className="flex flex-row min-h-screen items-center justify-center p-4">
        <p>Loading seats...</p>
      </div>
    )
  }

  return (
    <div className="pt-30 p-4">
      {/* ✅ Booking loader */}
      {isBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      <h2 className="text-2xl font-bold mb-2">Seats</h2>

      {/* ✅ Slot details */}
      {slotDetails && (
        <div className="mb-6 text-sm text-muted-foreground">
          Slot Time: <span className="font-medium">{formatTime12hr(slotDetails.start_time)} – {formatTime12hr(slotDetails.end_time)}</span> • 
          Gender: <span className="font-medium capitalize">{slotDetails.gender}</span>
        </div>
      )}

      {/* ✅ Seat Legend */}
      <div className="flex gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
          Booked
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm" />
          Checked-in
        </div>
      </div>

      {/* ✅ Seats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {Array.from({ length: seatLimit }, (_, i) => {
          const seatNumber = i + 1
          const status = getSeatStatus(seatNumber)

          let bgColor = 'bg-green-500'
          if (status === 'booked') bgColor = 'bg-yellow-500'
          if (status === 'occupied') bgColor = 'bg-red-500'

          return (
            <Button
              key={seatNumber}
              className={`h-16 text-white font-semibold ${bgColor} hover:opacity-90 transition rounded-md`}
              disabled={status !== 'free'}
              onClick={() => {
                setSelectedSeat(seatNumber)
                setAgreed(false) // ✅ Reset checkbox
              }}
              title={`Seat #${seatNumber}`}
            >
              {seatNumber}
            </Button>
          )
        })}
      </div>

      {/* ✅ Booking Confirm Dialog */}
      <AlertDialog open={selectedSeat !== null} onOpenChange={(open) => {
        if (!isBooking && !open) {
          setSelectedSeat(null)
          setAgreed(false)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm booking</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Are you sure you want to book seat #{selectedSeat}? This action cannot be undone.

                {/* ✅ Terms Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(!!checked)} />
                  <label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <Link href="/terms" target="_blank" className="underline underline-offset-4">
                      Terms & Conditions
                    </Link>
                  </label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBooking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking} disabled={isBooking}>
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