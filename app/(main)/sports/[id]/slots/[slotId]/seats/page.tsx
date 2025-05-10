'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
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
import { Loader2 } from 'lucide-react'

export default function SeatsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const sportId = params.id as string
  const slotId = params.slotId as string

  const [seatLimit, setSeatLimit] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ✅ Protect + initial fetch
  useEffect(() => {
    checkGenderAndFetch()
  }, [])

  // ✅ Auto-refresh bookings every 5 sec
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBookings()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const checkGenderAndFetch = async () => {
    setLoading(true)

    const userRes = await supabase.auth.getUser()
    const user = userRes.data.user

    if (!user) {
      return router.push('/login')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return router.push('/onboarding')
    }

    const { data: slot } = await supabase
      .from('slots')
      .select('gender')
      .eq('id', slotId)
      .single()

    if (!slot) {
      return router.push(`/sports/${sportId}/slots`)
    }

    if (slot.gender !== 'any' && profile.gender !== slot.gender) {
      alert(`This slot is only for ${slot.gender} users`)
      return router.push(`/sports/${sportId}/slots`)
    }

    const { data: sport } = await supabase
      .from('sports')
      .select('seat_limit')
      .eq('id', sportId)
      .single()

    setSeatLimit(sport?.seat_limit || 0)
    await refreshBookings()
    setLoading(false)
  }

  // ✅ Re-fetch current slot bookings
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

  const getSeatStatus = (seatNumber: number) => {
    const booking = bookings.find((b) => b.seat_number === seatNumber)
    if (booking?.status === 'checked-in') return 'occupied'
    if (booking?.status === 'booked') return 'booked'
    return 'free'
  }

  const handleConfirmBooking = async () => {
    if (!selectedSeat) return;
    setIsBooking(true);
    setErrorMessage(null);

    const userRes = await supabase.auth.getUser();
    const user = userRes.data.user;

    if (!user) {
      setErrorMessage('Please login to continue');
      setIsBooking(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // ✅ Check if user already booked this slot today
    const { data: existing } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .eq('sport_id', sportId)
      .eq('slot_id', slotId)
      .eq('booking_date', today)
      .maybeSingle();

    if (existing) {
      setErrorMessage('You already booked this slot today 🚫');
      setIsBooking(false);
      return;
    }

    // ✅ Try to insert booking (db constraint will prevent double seat booking)
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
      .single();

    if (error) {
      console.error(error);

      // ✅ If it's unique violation → show seat already booked
      if (error.code === '23505') {
        setErrorMessage('Sorry, this seat was just booked by someone else. Please pick another seat.');
        await refreshBookings(); // ✅ Refresh seats UI
      } else {
        setErrorMessage('Booking failed. Please try again.');
      }

      setIsBooking(false);
      return;
    }

    router.prefetch(`/sports/${sportId}/slots/${slotId}/success?booking_id=${data.id}`);
    window.location.href = `/sports/${sportId}/slots/${slotId}/success?booking_id=${data.id}`;
  };

  if (loading || seatLimit === null) {
    return (
      <div className="flex flex-row min-h-screen items-center justify-center p-4">
        <p>Loading seats...</p>
      </div>
    )
  }

  return (
    <div className="pt-30 p-4">
      <h2 className="text-2xl font-bold mb-6">Seats</h2>

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
              onClick={() => setSelectedSeat(seatNumber)}
              title={`Seat #${seatNumber}`}
            >
              {seatNumber}
            </Button>
          )
        })}
      </div>

      {/* ✅ Booking Confirm Dialog */}
      <AlertDialog open={selectedSeat !== null || isBooking} onOpenChange={(open) => {
        if (!isBooking && !open) {
          setSelectedSeat(null)
          setErrorMessage(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isBooking ? 'Booking your seat...' : 'Confirm booking'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {isBooking
                ? `Please wait while we book the seat for you...`
                : `Are you sure you want to book seat #${selectedSeat}? This action cannot be undone.`}

              {errorMessage && (
                <span className="text-red-500 font-medium">{errorMessage}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBooking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBooking} disabled={isBooking}>
              {isBooking ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
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
