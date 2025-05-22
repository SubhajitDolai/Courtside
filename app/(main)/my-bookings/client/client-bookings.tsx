'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader, Copy, Check, Calendar, Clock, User, Tag, InfoIcon } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

// Define the Booking type
interface Booking {
  id: string
  booking_date: string
  status: string
  seat_number: number
  created_at: string
  sports: { name: string }
  slots: { start_time: string, end_time: string }
}

export default function MyBookingsClient() {
  const supabase = createClient()

  const [canceling, setCanceling] = useState<string | null>(null)

  // ✅ Booking ID Dialog states
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // ✅ Profile protection
  useEffect(() => {
    const checkProfile = async () => {
      const res = await fetch('/api/check-profile')
      const data = await res.json()

      if (data.redirect) {
        window.location.href = data.redirect
      }
    }

    checkProfile()
  }, [])

  // ✅ Booking fetcher (reusable)
  const fetchBookings = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      toast.error('Please login')
      return []
    }

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
      .eq('user_id', userData.user.id)
      .order('booking_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast.error('Failed to load bookings')
      return []
    } else {
      // Transform the data to match our Booking interface
      return (data || []).map(item => ({
        ...item,
        // Ensure these are objects not arrays
        sports: item.sports || null,
        slots: item.slots || null
      })) as unknown as Booking[]
    }
  }, [supabase])

  // ✅ Use Realtime subscription instead of polling
  const { data: bookings, loading: loadingBookings } = useRealtimeSubscription<Booking>(
    'bookings',     // table name
    [],             // initial data (empty array)
    fetchBookings   // fetch function
  )

  const handleCancel = async (bookingId: string) => {
    setCanceling(bookingId)
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
    if (error) {
      console.error(error)
      toast.error('Cancellation failed')
    } else {
      toast.success('Booking cancelled.')
      // No need to manually update state - Realtime will handle it
      // setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    }
    setCanceling(null)
  }

  // Rest of your functions remain the same
  const isSlotStarted = (slotStartTime: string) => {
    const now = new Date()
    const [hour, minute] = slotStartTime.split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(hour, minute, 0, 0)
    slotStart.setMinutes(slotStart.getMinutes() - 30) // Subtract 30 min
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
    : bookings.filter(b => b.status === activeTab);

  // Get the status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'checked-in': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'checked-out': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Format status label
  const formatStatus = (status: string) => {
    switch (status) {
      case 'booked': return 'Booked';
      case 'checked-in': return 'Checked In';
      case 'checked-out': return 'Completed';
      default: return status;
    }
  }

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  return (
    <div className="pt-30 p-4 md:pt-30 min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <Card className="max-w-6xl mx-auto shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">My Bookings</CardTitle>
        </CardHeader>

        <CardContent className="p-4 md:p-6 space-y-6">
          {loadingBookings ? (
            <>
              <div className="flex gap-3 mb-11">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2 bg-muted/30 border-b">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="pt-8 flex justify-end">
                        <Skeleton className="h-8 w-28 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              <Tabs
                defaultValue="all"
                className="mb-6"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="booked">Active</TabsTrigger>
                  <TabsTrigger value="checked-in">Checked In</TabsTrigger>
                  <TabsTrigger value="checked-out">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredBookings.map((booking) => {
                        const slotStarted = isSlotStarted(booking.slots?.start_time);
                        const startTime = formatTime12hr(booking.slots?.start_time);
                        const endTime = formatTime12hr(booking.slots?.end_time);
                        const bookingDate = booking.booking_date ? formatDate(booking.booking_date) : '';

                        return (
                          <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-all">
                            <CardHeader className="p-4 pb-2 space-y-1 bg-muted/30 border-b">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-lg text-primary">
                                    {booking.sports?.name}
                                  </h3>
                                  <button
                                    onClick={() => setShowBookingId(booking.id)}
                                    className="text-xs text-muted-foreground hover:text-emerald-500 flex items-center gap-1"
                                  >
                                    <span>Booking #{booking.id.slice(0, 6)}...</span>
                                    <InfoIcon size={12} />
                                  </button>
                                </div>
                                <div>
                                  <Badge className={`${getStatusColor(booking.status)} transition-colors`}>
                                    {formatStatus(booking.status)}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <Calendar size={16} className="text-muted-foreground" />
                                  <span>{bookingDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock size={16} className="text-muted-foreground" />
                                  <div>
                                    <span>{startTime} - {endTime}</span>
                                    {slotStarted && <span className="ml-2 text-xs text-red-500 font-medium">Started</span>}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <User size={16} className="text-muted-foreground" />
                                <span>Spot #{booking.seat_number}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Tag size={16} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {booking.created_at ?
                                    `Booked on ${new Date(booking.created_at.replace(' ', 'T')).toLocaleString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}` : ''}
                                </span>
                              </div>
                            </CardContent>

                            {booking.status === 'booked' && (
                              <CardFooter className="p-4 pt-0 flex justify-end">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={canceling === booking.id || slotStarted}
                                  onClick={() => handleCancel(booking.id)}
                                  className={`${slotStarted ? 'opacity-50 cursor-not-allowed' : ''} transition-opacity`}
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
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-muted rounded-full p-4 mb-4">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                      <p className="text-muted-foreground max-w-md">
                        {activeTab === "all"
                          ? "You don't have any bookings yet. Start by making a new booking."
                          : `You don't have any ${activeTab === "booked" ? "active" : activeTab} bookings.`}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* ✅ Booking ID Dialog */}
      <Dialog open={showBookingId !== null} onOpenChange={(open) => {
        if (!open) {
          setShowBookingId(null)
          setCopied(false)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Number</DialogTitle>
            <DialogDescription>
              This is your full booking ID. Show this at the check-in counter.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted rounded-md p-4 flex items-center justify-between font-mono text-sm">
            <span className="break-all">{showBookingId}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(showBookingId!)}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowBookingId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}