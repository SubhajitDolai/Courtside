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
import { Badge } from '@/components/ui/badge'
import { Copy, Check } from 'lucide-react'

export default function AdminBookingsPage() {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ For delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ✅ For check-in/out confirm dialog
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'check-in' | 'check-out'>('check-in')

  // ✅ For Booking ID dialog
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_date, status, created_at, seat_number,
        profiles ( first_name, last_name ),
        sports ( name ),
        slots ( start_time, end_time )
      `)
      .order('created_at', { ascending: false })
    if (!error) setBookings(data || [])
  }

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(() => fetchBookings(), 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async () => {
    if (!confirmId) return
    setLoading(true)
    const booking = bookings.find((b) => b.id === confirmId)
    if (!booking) return toast.error('Booking not found')

    let newStatus = booking.status

    if (actionType === 'check-in') {
      newStatus = booking.status === 'booked' ? 'checked-in' : 'booked'
    } else if (actionType === 'check-out') {
      newStatus = booking.status === 'checked-in' ? 'checked-out' : 'checked-in'
    }

    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', confirmId)

    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === confirmId ? { ...b, status: newStatus } : b)))
      toast.success(`Status updated to "${newStatus}" ✅`)
    } else {
      toast.error('Failed to update status')
    }

    setLoading(false)
    setConfirmId(null)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('bookings').delete().eq('id', deleteId)
    if (!error) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteId))
      toast.success('Booking deleted ❌')
    } else {
      toast.error('Failed to delete')
    }
    setDeleting(false)
    setDeleteId(null)
  }

  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  }

  const filteredBookings = bookings.filter((b) => {
    const query = search.toLowerCase()
    const st12 = formatTime12hr(b.slots?.start_time || '')
    const et12 = formatTime12hr(b.slots?.end_time || '')
    return (
      b.id.toLowerCase().includes(query) ||
      b.profiles?.first_name?.toLowerCase().includes(query) ||
      b.profiles?.last_name?.toLowerCase().includes(query) ||
      b.sports?.name?.toLowerCase().includes(query) ||
      b.slots?.start_time?.toLowerCase().includes(query) ||
      b.slots?.end_time?.toLowerCase().includes(query) ||
      st12.includes(query) ||
      et12.includes(query) ||
      b.booking_date?.toLowerCase().includes(query)
    )
  })

  const handleCopy = () => {
    if (showBookingId) {
      navigator.clipboard.writeText(showBookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="pt-30 p-6 min-h-screen bg-muted/40">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-bold">Manage Bookings</CardTitle>
          <Input placeholder="Search booking #, name, sport, slot or date" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="min-w-fit">
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
                {filteredBookings.map((b) => {
                  const now = new Date()
                  const [eh, em] = (b.slots?.end_time || '00:00').split(':').map(Number)
                  const slotEnd = new Date()
                  slotEnd.setHours(eh, em, 0, 0)
                  const slotOver = now > slotEnd

                  // ✅ Disable rules
                  const disableDelete = slotOver
                  const disableCheckIn = ['checked-in', 'checked-out', 'booked'].includes(b.status) && slotOver
                  const disableCheckOut = ['booked', 'checked-out'].includes(b.status) && slotOver

                  return (
                    <tr key={b.id} className="border-t hover:bg-accent/50 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <button onClick={() => setShowBookingId(b.id)} className="underline text-primary">
                          {b.id.slice(0, 6)}...
                        </button>
                      </td>
                      <td className="p-3 whitespace-nowrap">{b.profiles?.first_name} {b.profiles?.last_name}</td>
                      <td className="p-3 whitespace-nowrap">{b.sports?.name}</td>
                      <td className="p-3 whitespace-nowrap">{formatTime12hr(b.slots?.start_time)} – {formatTime12hr(b.slots?.end_time)}</td>
                      <td className="p-3 whitespace-nowrap">{b.booking_date}</td>
                      <td className="p-3 whitespace-nowrap">{b.seat_number}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline">{b.status.replace('-', ' ')}</Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap flex gap-2 flex-wrap">

                        {/* ✅ Check-in */}
                        <Button
                          size="sm"
                          onClick={() => { setActionType('check-in'); setConfirmId(b.id) }}
                          disabled={loading || disableCheckIn}
                          className={disableCheckIn ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Check-in ✅
                        </Button>

                        {/* ✅ Check-out */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setActionType('check-out'); setConfirmId(b.id) }}
                          disabled={loading || disableCheckOut}
                          className={disableCheckOut ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Check-out
                        </Button>

                        {/* ✅ Delete */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteId(b.id)}
                          disabled={disableDelete}
                          className={disableDelete ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          Delete
                        </Button>

                      </td>
                    </tr>
                  )
                })}
                {!filteredBookings.length && (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-muted-foreground">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Dialogs */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !deleting && setDeleteId(o ? deleteId : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the booking.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmId !== null} onOpenChange={(o) => !loading && setConfirmId(o ? confirmId : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionType === 'check-in' ? 'Check-in User?' : 'Check-out User?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'check-in' ? 'Mark this booking as checked-in?' : 'Mark this booking checked-out?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} disabled={loading}>{loading ? 'Please wait...' : 'Yes, confirm'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBookingId !== null} onOpenChange={(o) => { setShowBookingId(o ? showBookingId : null); setCopied(false) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Number</AlertDialogTitle>
            <AlertDialogDescription className="flex items-center justify-between mt-2 font-mono text-sm bg-muted p-2 rounded-md">
              {showBookingId}
              <Button size="icon" variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBookingId(null)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}