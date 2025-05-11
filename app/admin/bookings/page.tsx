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

  const handleStatusChange = async () => {
    if (!confirmId) return
    setLoading(true)

    const newStatus = actionType === 'check-in' ? 'checked-in' : 'booked'

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', confirmId)

    if (!error) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === confirmId ? { ...b, status: newStatus } : b
        )
      )
      toast.success(`${actionType === 'check-in' ? 'Checked-in' : 'Checked-out'} ✅`)
    } else {
      toast.error('Failed to update status')
    }

    setLoading(false)
    setConfirmId(null)
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

  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  }

  const filteredBookings = bookings.filter((b) => {
    const query = search.toLowerCase()
    const startTime12hr = formatTime12hr(b.slots?.start_time || '')
    const endTime12hr = formatTime12hr(b.slots?.end_time || '')

    return (
      b.id.toLowerCase().includes(query) ||
      b.profiles?.first_name?.toLowerCase().includes(query) ||
      b.profiles?.last_name?.toLowerCase().includes(query) ||
      b.sports?.name?.toLowerCase().includes(query) ||
      b.slots?.start_time?.toLowerCase().includes(query) ||
      b.slots?.end_time?.toLowerCase().includes(query) ||
      startTime12hr.includes(query) ||
      endTime12hr.includes(query) ||
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
          <Input
            placeholder="Search booking #, name, sport, slot or date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="min-w-fit">
            <table className="w-full text-sm border rounded-md">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 text-left whitespace-nowrap">Booking #</th>
                  <th className="p-3 text-left whitespace-nowrap">User</th>
                  <th className="p-3 text-left whitespace-nowrap">Sport</th>
                  <th className="p-3 text-left whitespace-nowrap">Slot</th>
                  <th className="p-3 text-left whitespace-nowrap">Date</th>
                  <th className="p-3 text-left whitespace-nowrap">Seat #</th>
                  <th className="p-3 text-left whitespace-nowrap">Status</th>
                  <th className="p-3 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  // ✅ Disable logic if slot end time is passed
                  const now = new Date()
                  const [hour, minute] = (b.slots?.end_time || '00:00').split(':').map(Number)
                  const slotEnd = new Date()
                  slotEnd.setHours(hour, minute, 0, 0)
                  const slotOver = now > slotEnd

                  return (
                    <tr
                      key={b.id}
                      className="border-t hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap">
                        <button
                          onClick={() => setShowBookingId(b.id)}
                          className="underline underline-offset-4 text-primary"
                        >
                          {b.id.slice(0, 6)}...
                        </button>
                      </td>
                      <td className="p-3 whitespace-nowrap">{b.profiles?.first_name} {b.profiles?.last_name}</td>
                      <td className="p-3 whitespace-nowrap">{b.sports?.name}</td>
                      <td className="p-3 whitespace-nowrap">
                        {formatTime12hr(b.slots?.start_time)} – {formatTime12hr(b.slots?.end_time)}
                      </td>
                      <td className="p-3 whitespace-nowrap">{b.booking_date}</td>
                      <td className="p-3 whitespace-nowrap">{b.seat_number}</td>
                      <td className="p-3 whitespace-nowrap">
                        {b.status === 'booked' ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Booked
                          </Badge>
                        ) : (
                          <Badge variant="default">Checked-in</Badge>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex gap-2 flex-nowrap">
                          <Button
                            size="sm"
                            variant={b.status === 'booked' ? 'default' : 'outline'}
                            onClick={() => {
                              setActionType(b.status === 'booked' ? 'check-in' : 'check-out')
                              setConfirmId(b.id)
                            }}
                            disabled={loading || slotOver}
                            className={`${b.status === 'booked' ? '' : 'opacity-50'} ${slotOver ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {b.status === 'booked' ? 'Check-in ✅' : 'Check-out'}
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(b.id)}
                            disabled={slotOver}
                            className={`${slotOver ? 'opacity-50 cursor-not-allowed' : ''} whitespace-nowrap`}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!filteredBookings.length && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-4 text-center text-muted-foreground whitespace-nowrap"
                    >
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Delete Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !deleting && setDeleteId(open ? deleteId : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This booking will be permanently removed.
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

      {/* ✅ Check-in/out Dialog */}
      <AlertDialog
        open={confirmId !== null}
        onOpenChange={(open) => !loading && setConfirmId(open ? confirmId : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'check-in' ? 'Check-in User?' : 'Check-out User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'check-in'
                ? 'Mark this booking as checked-in?'
                : 'Mark this booking back to booked?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} disabled={loading}>
              {loading ? 'Please wait...' : 'Yes, confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Booking ID Dialog */}
      <AlertDialog
        open={showBookingId !== null}
        onOpenChange={(open) => {
          setShowBookingId(open ? showBookingId : null)
          setCopied(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Number</AlertDialogTitle>
            <AlertDialogDescription className="flex items-center justify-between mt-2 font-mono text-sm bg-muted p-2 rounded-md">
              {showBookingId}
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="ml-2"
              >
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