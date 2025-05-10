'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminBookingsPage() {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, 
          booking_date, 
          status, 
          created_at,
          seat_number,
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

  // ✅ filter logic — by booking id, user name, or sport
  const filteredBookings = bookings.filter((b) => {
    const query = search.toLowerCase()
    return (
      b.id.toLowerCase().includes(query) || 
      b.profiles?.first_name?.toLowerCase().includes(query) || 
      b.profiles?.last_name?.toLowerCase().includes(query) || 
      b.sports?.name?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-bold">Manage Bookings</CardTitle>

          {/* ✅ Search */}
          <Input
            placeholder="Search booking #, name, or sport"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border rounded-md">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Booking #</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Sport</th>
                <th className="p-3 text-left">Slot</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Seat Number</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="border-t hover:bg-accent transition-colors">
                  <td className="p-3">{b.id.slice(0, 6)}...</td>
                  <td className="p-3">{b.profiles?.first_name} {b.profiles?.last_name}</td>
                  <td className="p-3">{b.sports?.name}</td>
                  <td className="p-3">{b.slots?.start_time} – {b.slots?.end_time}</td>
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
                        onClick={() => handleCheckIn(b.id)}
                        disabled={loading}
                        className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                      >
                        {loading ? 'Please wait...' : 'Check-in ✅'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredBookings.length && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
