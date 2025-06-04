'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader, Copy, Check, Calendar, Clock, User, Tag, InfoIcon, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import BannedRedirect from '@/components/banned-redirect'
import { Skeleton } from '@/components/ui/skeleton'

// Define the Booking type
interface Booking {
  id: string
  booking_date: string
  status: string
  seat_number: number
  created_at: string
  sports: { name: string } | null
  slots: { start_time: string, end_time: string } | null
}

interface MyBookingsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBookings: any[]
  userId: string
}

export default function MyBookingsClient({ initialBookings, userId }: MyBookingsClientProps) {
  const supabase = createClient()
  const [canceling, setCanceling] = useState<string | null>(null)
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null)

  // ✅ Booking fetcher for real-time updates
  const fetchBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, 
        booking_date, 
        status, 
        seat_number,
        created_at,
        sports ( name ),
        slots ( start_time, end_time )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast.error('Failed to load bookings')
      return initialBookings
    }

    return (data || []).map(item => ({
      ...item,
      sports: item.sports || null,
      slots: item.slots || null
    })) as unknown as Booking[]
  }, [supabase, userId, initialBookings])

  // ✅ Use Realtime subscription with initial data
  const { data: bookings, loading: loadingBookings } = useRealtimeSubscription<Booking>(
    'bookings',
    initialBookings as Booking[],
    fetchBookings
  )

  const handleCancel = async (bookingId: string) => {
    setCanceling(bookingId)
    setShowCancelDialog(null) // Close dialog

    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
    if (error) {
      console.error(error)
      toast.error('Cancellation failed')
    } else {
      toast.success('Booking cancelled.')
    }
    setCanceling(null)
  }

  const isSlotStarted = (slotStartTime: string) => {
    const now = new Date()
    const [hour, minute] = slotStartTime.split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(hour, minute, 0, 0)
    slotStart.setMinutes(slotStart.getMinutes() - 30)
    return now >= slotStart
  }

  const formatTime12hr = (time24: string) => {
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter bookings based on status
  const filteredBookings = activeTab === "all"
    ? bookings
    : bookings.filter(b => b.status === activeTab)

  // Get the status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300'
      case 'checked-in': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'checked-out': return 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
    }
  }

  // Format status label
  const formatStatus = (status: string) => {
    switch (status) {
      case 'booked': return 'Active'
      case 'checked-in': return 'In Progress'
      case 'checked-out': return 'Completed'
      default: return status
    }
  }

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // loading skeleton
  if (loadingBookings) {
    return (
      <>
        <BannedRedirect />
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <div className="p-6 space-y-6">
              {/* Tabs Skeleton */}
              <div className="grid grid-cols-4 w-full max-w-md gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>

              {/* Single Card Skeleton - Matching Actual Structure */}
              <Card className="border-2 shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" /> {/* Sport name */}
                      <Skeleton className="h-4 w-16" /> {/* Status badge */}
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" /> {/* Menu button */}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Date and Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" /> {/* Calendar icon */}
                      <Skeleton className="h-4 w-20" /> {/* Date */}
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" /> {/* Clock icon */}
                      <Skeleton className="h-4 w-24" /> {/* Time */}
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" /> {/* User icon */}
                      <Skeleton className="h-4 w-16" /> {/* Spot number */}
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="pt-2">
                    <Skeleton className="h-3 w-10 mb-1" /> {/* "ID:" label */}
                    <Skeleton className="h-4 w-32" /> {/* Booking ID */}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Skeleton className="h-9 w-full" /> {/* Action button */}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <BannedRedirect />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Your Reservations</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your sports facility bookings</p>
          </div>

          <div className="p-6">
            <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="booked">Active</TabsTrigger>
                <TabsTrigger value="checked-in">In Progress</TabsTrigger>
                <TabsTrigger value="checked-out">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredBookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookings.map((booking) => {
                      const slotStarted = booking.slots?.start_time ? isSlotStarted(booking.slots.start_time) : false
                      const startTime = booking.slots?.start_time ? formatTime12hr(booking.slots.start_time) : 'N/A'
                      const endTime = booking.slots?.end_time ? formatTime12hr(booking.slots.end_time) : 'N/A'
                      const bookingDate = booking.booking_date ? formatDate(booking.booking_date) : 'N/A'

                      return (
                        <Card key={booking.id} className={`
                          border-2 shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900
                          ${booking.status === 'booked' ? 'border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700' :
                            booking.status === 'checked-in' ? 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700' :
                              booking.status === 'checked-out' ? 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600' :
                                'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                          }
                        `}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <CardTitle className="text-lg text-neutral-900 dark:text-white">
                                  {booking.sports?.name || 'Unknown Sport'}
                                </CardTitle>
                                <button
                                  onClick={() => setShowBookingId(booking.id)}
                                  className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                                >
                                  <span>#{booking.id.slice(0, 8)}...</span>
                                  <InfoIcon className="h-3 w-3" />
                                </button>
                              </div>
                              <Badge className={`${getStatusColor(booking.status)} border-0`}>
                                {formatStatus(booking.status)}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3 pt-0">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Calendar className="h-4 w-4" />
                                <span>{bookingDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Clock className="h-4 w-4" />
                                <span>{startTime} - {endTime}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                              <User className="h-4 w-4" />
                              <span>Spot #{booking.seat_number}</span>
                              {slotStarted && (
                                <Badge variant="outline" className="ml-auto text-xs text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-800">
                                  Started
                                </Badge>
                              )}
                            </div>

                            {booking.created_at && (
                              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <Tag className="h-3 w-3" />
                                <span>
                                  Booked {new Date(booking.created_at.replace(' ', 'T')).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                            )}
                          </CardContent>

                          {booking.status === 'booked' && (
                            <CardFooter className="pt-0">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={canceling === booking.id || slotStarted}
                                onClick={() => setShowCancelDialog(booking.id)}
                                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/20"
                              >
                                {canceling === booking.id ? (
                                  <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  'Cancel Booking'
                                )}
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
                      <Calendar className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No bookings found</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                      {activeTab === "all"
                        ? "You don't have any bookings yet. Visit the sports section to make your first booking."
                        : `No ${activeTab === "booked" ? "active" : formatStatus(activeTab).toLowerCase()} bookings found.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Booking ID Dialog */}
        <Dialog open={showBookingId !== null} onOpenChange={(open) => {
          if (!open) {
            setShowBookingId(null)
            setCopied(false)
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Reference</DialogTitle>
              <DialogDescription>
                Your complete booking ID. Show this at the facility counter for check-in.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 flex items-center justify-between font-mono text-sm">
              <span className="break-all text-neutral-900 dark:text-neutral-100">{showBookingId}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(showBookingId!)}
                className="ml-2 flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowBookingId(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog !== null} onOpenChange={(open) => {
          if (!open) setShowCancelDialog(null)
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
                Cancel Booking?
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                This action cannot be undone. Your booking will be permanently cancelled and the spot will become available for others.
              </DialogDescription>
            </DialogHeader>

            {showCancelDialog && (() => {
              const booking = bookings.find(b => b.id === showCancelDialog)
              return booking ? (
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
                  <div className="font-medium text-neutral-900 dark:text-white">
                    {booking.sports?.name || 'Unknown Sport'}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {booking.slots?.start_time ? formatTime12hr(booking.slots.start_time) : 'N/A'} - {booking.slots?.end_time ? formatTime12hr(booking.slots.end_time) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Spot #{booking.seat_number}</span>
                    </div>
                  </div>
                </div>
              ) : null
            })()}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(null)}
                disabled={canceling === showCancelDialog}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={() => showCancelDialog && handleCancel(showCancelDialog)}
                disabled={canceling === showCancelDialog}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {canceling === showCancelDialog ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Booking'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}