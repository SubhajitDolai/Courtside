'use client'

import { useCallback, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader, Copy, Check, Calendar, Clock, User, Tag, InfoIcon, AlertCircle, QrCode, Download, History } from 'lucide-react'
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
import { useRouter } from 'next/navigation'
import BannedRedirect from '@/components/banned-redirect'
import { Skeleton } from '@/components/ui/skeleton'
import QRCode from 'qrcode'
import QRCodeComponent from 'react-qr-code'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

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
  const router = useRouter()
  const { start } = useGlobalLoadingBar()
  const [canceling, setCanceling] = useState<string | null>(null)
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null)

  // Prefetch booking-history page on mount
  useEffect(() => {
    router.prefetch('/my-bookings/booking-history')
  }, [router])

  // QR Code states
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)

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

    if (error) {
      console.error(error)
      toast.error('Failed to load bookings')
      return initialBookings
    }

    const bookingsWithSports = (data || []).map(item => ({
      ...item,
      sports: item.sports || null,
      slots: item.slots || null
    })) as unknown as Booking[]

    // Sort bookings by proximity to current time
    const now = new Date()
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()

    return bookingsWithSports.sort((a, b) => {
      // Helper function to calculate time difference in minutes
      const getTimeDifference = (booking: typeof bookingsWithSports[0]) => {
        const startTime = booking.slots?.start_time
        if (!startTime) return Infinity
        
        const [hour, minute] = startTime.split(':').map(Number)
        const bookingTimeInMinutes = hour * 60 + minute
        
        // Return absolute difference from current time
        return Math.abs(currentTimeInMinutes - bookingTimeInMinutes)
      }

      const diffA = getTimeDifference(a)
      const diffB = getTimeDifference(b)

      // First sort by time proximity (closest to current time first)
      if (diffA !== diffB) {
        return diffA - diffB
      }

      // If time difference is the same, sort by status priority
      const statusPriority = { 'checked-in': 0, 'booked': 1, 'checked-out': 2 }
      const priorityA = statusPriority[a.status as keyof typeof statusPriority] ?? 3
      const priorityB = statusPriority[b.status as keyof typeof statusPriority] ?? 3
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      // Finally, sort by creation date (most recent first)
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
  }, [supabase, userId, initialBookings])

  // ✅ Use Realtime subscription with initial data - filter by user_id
  const { data: bookings, loading: loadingBookings } = useRealtimeSubscription<Booking>(
    'bookings',
    initialBookings as Booking[],
    fetchBookings,
    'user_id',
    userId
  )

  // Generate QR code when dialog opens
  useEffect(() => {
    const generateQRCode = async () => {
      if (!showBookingId) {
        setQrCodeUrl(null)
        return
      }

      setGeneratingQR(true)
      try {
        // Generate QR code with just the booking ID using qrcode package
        const qrDataUrl = await QRCode.toDataURL(showBookingId, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        })
        setQrCodeUrl(qrDataUrl)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        toast.error('Failed to generate QR code')
      } finally {
        setGeneratingQR(false)
      }
    }

    generateQRCode()
  }, [showBookingId])

  // Download QR code function
  const downloadQRCode = () => {
    if (!qrCodeUrl || !showBookingId) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `booking-qr-${showBookingId.slice(0, 8)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

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

  const isSlotActuallyStarted = (slotStartTime: string) => {
    const now = new Date()
    const [hour, minute] = slotStartTime.split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(hour, minute, 0, 0)
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
    toast.success('Booking ID copied to clipboard!')
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
      case 'booked': return 'Upcoming'
      case 'checked-in': return 'Live'
      case 'checked-out': return 'Past'
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
              <div className="grid grid-cols-4 w-full gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>

              {/* Grid of Skeleton Cards - 1 cards to match actual layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(1)].map((_, index) => (
                  <Card key={index} className="border-2 shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-28" /> {/* Sport name */}
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-20" /> {/* Booking ID */}
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" /> {/* Status badge */}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {/* Date and Time Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" /> {/* Calendar icon */}
                          <Skeleton className="h-4 w-20" /> {/* Date */}
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" /> {/* Clock icon */}
                          <Skeleton className="h-4 w-24" /> {/* Time */}
                        </div>
                      </div>

                      {/* Spot info */}
                      <div className="flex items-center gap-2 text-sm">
                        <Skeleton className="h-4 w-4" /> {/* User icon */}
                        <Skeleton className="h-4 w-16" /> {/* Spot number */}
                      </div>

                      {/* Created at */}
                      <div className="flex items-center gap-2 text-xs">
                        <Skeleton className="h-3 w-3" /> {/* Tag icon */}
                        <Skeleton className="h-3 w-32" /> {/* Created date */}
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 flex flex-col space-y-2">
                      <Skeleton className="h-9 w-full" /> {/* QR Code button */}
                      <Skeleton className="h-9 w-full" /> {/* Cancel button */}
                    </CardFooter>
                  </Card>
                ))}
              </div>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Your Reservations</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your sports facility bookings</p>
              </div>
              <button
                onClick={() => {
                  start()
                  router.push('/my-bookings/booking-history')
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 cursor-pointer text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
              >
                <History className="h-4 w-4 animate-pulse" />
                <span className="hidden sm:inline">View History</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-4 cursor-pointer">All</TabsTrigger>
                <TabsTrigger value="booked" className="text-xs sm:text-sm px-1 sm:px-4 cursor-pointer">Upcoming</TabsTrigger>
                <TabsTrigger value="checked-in" className="text-xs sm:text-sm px-1 sm:px-4 cursor-pointer">Live</TabsTrigger>
                <TabsTrigger value="checked-out" className="text-xs sm:text-sm px-1 sm:px-4 cursor-pointer">Past</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredBookings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBookings.map((booking) => {
                      const slotStarted = booking.slots?.start_time ? isSlotStarted(booking.slots.start_time) : false
                      const slotActuallyStarted = booking.slots?.start_time ? isSlotActuallyStarted(booking.slots.start_time) : false
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
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                  <span>#{booking.id.slice(0, 8)}...</span>
                                </div>
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
                              {slotActuallyStarted && (
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

                          <CardFooter className="pt-0 flex flex-col space-y-2">
                            {/* QR Code Button - Always Visible */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowBookingId(booking.id)}
                              className="w-full cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950/20 transition-colors"
                            >
                              <QrCode className="h-4 w-4" />
                              View QR Code & Booking ID
                            </Button>

                            {/* Cancel Button - Only for Active Bookings */}
                            {booking.status === 'booked' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={canceling === booking.id || slotStarted}
                                onClick={() => setShowCancelDialog(booking.id)}
                                className="w-full cursor-pointer text-rose-600 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-950/20"
                              >
                                {canceling === booking.id ? (
                                  <>
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  'Cancel Booking'
                                )}
                              </Button>
                            )}
                          </CardFooter>
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
                        : `No ${activeTab === "booked" ? "upcoming" : formatStatus(activeTab).toLowerCase()} bookings found.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Booking ID Dialog with QR Code */}
        <Dialog open={showBookingId !== null} onOpenChange={(open) => {
          if (!open) {
            setShowBookingId(null)
            setCopied(false)
            setQrCodeUrl(null) // Clear QR code when closing
          }
        }}>
          <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
                Booking Reference
              </DialogTitle>
              <DialogDescription className="text-sm">
                Show this QR code or booking ID during check-in and checkout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Booking ID Section */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Booking ID
                </label>
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 sm:p-4 flex items-center justify-between font-mono text-xs sm:text-sm">
                  <span className="break-all text-neutral-900 dark:text-neutral-100">
                    {showBookingId}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(showBookingId!)}
                    className="ml-2 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </Button>
                </div>
              </div>

              {/* QR Code Section - IMPROVED UI */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  QR Code
                </label>
                <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-600 shadow-sm">
                  {generatingQR ? (
                    <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                      <div className="relative">
                        <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-emerald-600 mb-3" />
                        <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 border-2 border-transparent border-t-emerald-300 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Generating QR code...</p>
                    </div>
                  ) : showBookingId ? (
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                      {/* QR Code with subtle enhancements */}
                      <div className="relative group">
                        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md border border-neutral-100 dark:border-neutral-700 transition-transform duration-200 group-hover:scale-105">
                          <QRCodeComponent
                            value={showBookingId}
                            size={160}
                            className="w-full h-auto max-w-[160px] sm:max-w-[180px]"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 160 160`}
                          />
                        </div>
                        {/* Corner brackets for scan effect */}
                        <div className="absolute -inset-1 pointer-events-none opacity-60">
                          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-emerald-500 rounded-tl"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-emerald-500 rounded-tr"></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-emerald-500 rounded-bl"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-emerald-500 rounded-br"></div>
                        </div>
                      </div>

                      {/* Download button with subtle styling */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadQRCode}
                        disabled={!qrCodeUrl}
                        className="flex items-center cursor-pointer gap-1 sm:gap-2 bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 text-emerald-700 dark:text-emerald-300 transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4 py-2"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        Download QR
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Failed to generate QR code</p>
                      <p className="text-xs text-muted-foreground mt-1">Please try again</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">
                  <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  Instructions:
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-2 sm:ml-4">
                  <li className="block sm:hidden">• Show QR/ID at check-in & checkout</li>
                  <li className="hidden sm:block">• Show this QR code or booking ID during check-in and checkout</li>
                  <li className="block sm:hidden">• Bring your university ID card</li>
                  <li className="hidden sm:block">• Bring your university ID card for verification</li>
                  <li className="block sm:hidden">• Arrive 10 minutes early</li>
                  <li className="hidden sm:block">• Arrive 10 minutes early for smooth check-in</li>
                  <li className="block sm:hidden">• Download QR for offline use</li>
                  <li className="hidden sm:block">• Download QR for offline access if needed</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowBookingId(null)} className="w-full cursor-pointer">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog !== null} onOpenChange={(open) => {
          if (!open) setShowCancelDialog(null)
        }}>
          <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Cancel Booking?
              </DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400 text-sm">
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

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(null)}
                disabled={canceling === showCancelDialog}
                className="w-full cursor-pointer sm:w-1/2 order-2 sm:order-1"
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={() => showCancelDialog && handleCancel(showCancelDialog)}
                disabled={canceling === showCancelDialog}
                className="cursor-pointer bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-1/2 order-1 sm:order-2"
              >
                {canceling === showCancelDialog ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
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