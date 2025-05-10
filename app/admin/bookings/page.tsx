'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function AdminBookingsPage() {
  const supabase = createClient()

  const [bookings, setBookings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  useEffect(() => {
    fetchBookings()

    const interval = setInterval(() => {
      fetchBookings()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
      toast.success('Checked-in ✅')
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteId))
      toast.success('Booking deleted ❌')
    } else {
      toast.error('Failed to delete')
    }

    setDeleting(false)
    setDeleteId(null)
  }

  // ✅ Convert 24hr "HH:MM" to 12hr "h:mm AM/PM"
  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  }

  // ✅ Search: by name, sport, slot (24hr & 12hr), date
  const filteredBookings = bookings.filter((b) => {
    const query = search.toLowerCase()

    const startTime12hr = formatTime12hr(b.slots?.start_time || '')
    const endTime12hr = formatTime12hr(b.slots?.end_time || '')

    return (
      b.id.toLowerCase().includes(query) ||
      b.profiles?.first_name?.toLowerCase().includes(query) ||
      b.profiles?.last_name?.toLowerCase().includes(query) ||
      b.sports?.name?.toLowerCase().includes(query) ||
      b.slots?.start_time?.toLowerCase().includes(query) ||  // 24hr
      b.slots?.end_time?.toLowerCase().includes(query) ||    // 24hr
      startTime12hr.includes(query) ||                       // 12hr
      endTime12hr.includes(query) ||                         // 12hr
      b.booking_date?.toLowerCase().includes(query)          // date search
    )
  })

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-bold">Manage Bookings</CardTitle>

          <Input
            placeholder="Search booking #, name, sport, slot or date"
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
                <th className="p-3 text-left">Seat #</th>
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
                  <td className="p-3">
                    {formatTime12hr(b.slots?.start_time)} – {formatTime12hr(b.slots?.end_time)}
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
                        onClick={() => handleCheckIn(b.id)}
                        disabled={loading}
                        className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                      >
                        {loading ? 'Please wait...' : 'Check-in ✅'}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(b.id)}
                    >
                      Delete
                    </Button>
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

      {/* ✅ Delete Confirm Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !deleting && setDeleteId(open ? deleteId : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The booking will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}