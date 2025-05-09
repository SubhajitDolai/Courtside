'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function MyBookingsPage() {
  const supabase = createClient()

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        toast.error('Please login')
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_date, 
          status, 
          seat_number,
          sports ( name ),
          slots ( start_time, end_time )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
      console.log(data)

      if (error) {
        console.error(error)
        toast.error('Failed to load bookings')
      } else {
        setBookings(data || [])
      }

      setLoading(false)
    }

    fetchBookings()
  }, [supabase])

  const handleCancel = async (bookingId: string) => {
    setCanceling(bookingId)
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
    if (error) {
      console.error(error)
      toast.error('Cancellation failed')
    } else {
      toast.success('Booking cancelled ✅')
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    }
    setCanceling(null)
  }

  // ✅ Simple logic → current time > slot start time = slot started
  const isSlotStarted = (slotStartTime: string) => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"
    return currentTime >= slotStartTime
  }

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Bookings</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <table className="w-full text-sm border rounded-md">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Booking #</th>
                  <th className="p-3 text-left">Sport</th>
                  <th className="p-3 text-left">Slot</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Seat #</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const slotStarted = isSlotStarted(b.slots?.start_time)

                  return (
                    <tr key={b.id} className="border-t hover:bg-accent transition-colors">
                      <td className="p-3">{b.id.slice(0, 6)}...</td>
                      <td className="p-3">{b.sports?.name}</td>
                      <td className="p-3">
                        {b.slots?.start_time} – {b.slots?.end_time}{' '}
                        {slotStarted && <span className="text-xs text-red-500 ml-2">Started</span>}
                      </td>
                      <td className="p-3">{b.booking_date}</td>
                      <td className="p-3">{b.seat_number}</td>
                      <td className="p-3">
                        {b.status === 'booked' ? (
                          <span className="text-yellow-600">Booked</span>
                        ) : (
                          <span className="text-green-600">Checked-in</span>
                        )}
                      </td>
                      <td className="p-3 space-x-2">
                        {b.status === 'booked' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={canceling === b.id || slotStarted}
                            onClick={() => handleCancel(b.id)}
                            className={slotStarted ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            {canceling === b.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {!bookings.length && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
