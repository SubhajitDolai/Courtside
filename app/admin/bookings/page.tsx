'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export default function AdminBookingsPage() {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_date, 
          status, 
          created_at,
          profiles ( first_name, last_name ),
          sports ( name ),
          slots ( start_time, end_time )
        `)
        .order('created_at', { ascending: false })

      if (!error) {
        setBookings(data || [])
      }
    }

    fetchBookings()
  }, [supabase])

  // confirm check-in
  const handleCheckIn = async (bookingId: string) => {
    setLoading(true)

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'checked-in' })
      .eq('id', bookingId)

    if (!error) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'checked-in' } : b
        )
      )
    }

    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Bookings</h2>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Booking #</th>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Sport</th>
            <th className="p-2 text-left">Slot</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b">
              <td className="p-2 text-sm">{b.id.slice(0, 6)}...</td>
              <td className="p-2 text-sm">
                {b.profiles?.first_name} {b.profiles?.last_name}
              </td>
              <td className="p-2 text-sm">{b.sports?.name}</td>
              <td className="p-2 text-sm">
                {b.slots?.start_time} - {b.slots?.end_time}
              </td>
              <td className="p-2 text-sm">{b.booking_date}</td>
              <td className="p-2 text-sm">
                {b.status === 'booked' ? (
                  <span className="text-yellow-600">Booked</span>
                ) : (
                  <span className="text-green-600">Checked-in</span>
                )}
              </td>
              <td className="p-2">
                {b.status === 'booked' && (
                  <Button
                    size="sm"
                    onClick={() => handleCheckIn(b.id)}
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : 'Check-in ✅'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
