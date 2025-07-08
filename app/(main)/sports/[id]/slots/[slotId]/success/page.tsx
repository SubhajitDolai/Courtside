'use client'

import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Check, Copy, ArrowLeft, Clock, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import { createClient } from '@/utils/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

// ✅ Convert 24hr time to 12hr format
const formatTime12hr = (time24: string | undefined) => {
  if (!time24) return 'Loading...'

  const [hour, minute] = time24.split(':')
  const date = new Date()
  date.setHours(Number(hour), Number(minute))
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
}

interface BookingDetails {
  id: string
  seat_number: number
  booking_date: string
  status: string
  created_at: string
  sports: { name: string }
  slots: { start_time: string; end_time: string; gender: string }
}

export default function BookingSuccessPage() {
  const params = useSearchParams()
  const routeParams = useParams()
  const bookingId = params.get('booking_id')
  const sportId = routeParams.id as string
  const slotId = routeParams.slotId as string

  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { start } = useGlobalLoadingBar()
  const supabase = createClient()

  // Prefetch /my-bookings on mount
  useEffect(() => {
    router.prefetch('/my-bookings')
  }, [router])

  useEffect(() => {
    setMounted(true)

    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            seat_number,
            booking_date,
            status,
            created_at,
            sports (name),
            slots (start_time, end_time, gender)
          `)
          .eq('id', bookingId)
          .single()

        if (error) {
          console.error('Error fetching booking details:', error)
        } else {
          setBookingDetails(data as unknown as BookingDetails)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, supabase])

  const handleGoBack = () => {
    start()
    router.push(`/sports/${sportId}/slots/${slotId}/seats`)
  }

  const handleCopy = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!mounted) {
    return null
  }

  // ✅ Loading state - MATCH APP DESIGN
  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
            {/* Header Skeleton */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
              </div>
              
              {/* Single title skeleton - MUCH BETTER */}
              <Skeleton className="h-9 sm:h-11 md:h-13 lg:h-15 w-80 sm:w-96 md:w-[30rem] lg:w-[36rem] mx-auto mb-4 sm:mb-6" />
              <Skeleton className="h-5 sm:h-6 lg:h-7 w-90 sm:w-160 mx-auto" />
            </div>

            {/* Content Skeleton */}
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Booking Details Card Skeleton */}
              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="text-center pb-4">
                  <Skeleton className="h-6 w-48 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info Grid Skeleton */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Timeline Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="ml-6 space-y-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Booking ID Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-12 flex-1 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Notes Card Skeleton */}
              <Card className="border border-amber-200 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/20">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-11/12" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Skeleton className="h-10 flex-1 rounded" />
                <Skeleton className="h-10 flex-1 rounded" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">

          {/* ✅ Success Header - NICER GREEN */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
                <Check className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Booking
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent"> Confirmed!</span>
            </h1>

            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Your spot has been successfully reserved. Save your booking details for check-in.
            </p>
          </div>

          {/* ✅ Main Content */}
          <div className="max-w-2xl mx-auto space-y-6">

            {/* ✅ Booking Details Card - MATCH MODAL DESIGN */}
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-neutral-900 dark:text-white">
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {bookingDetails ? (
                  <div className="space-y-4">
                    {/* ✅ Basic Info Grid - MATCH MODAL STYLE */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-neutral-600 dark:text-neutral-400">Sport</label>
                        <p className="text-neutral-900 dark:text-white font-semibold">
                          {bookingDetails.sports?.name || 'Unknown Sport'}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-neutral-600 dark:text-neutral-400">Spot Number</label>
                        <p className="text-neutral-900 dark:text-white font-semibold text-lg">
                          #{bookingDetails.seat_number}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-neutral-600 dark:text-neutral-400">Date</label>
                        <p className="text-neutral-900 dark:text-white font-semibold">
                          {format(new Date(bookingDetails.booking_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-neutral-600 dark:text-neutral-400">Time Slot</label>
                        <p className="text-neutral-900 dark:text-white font-semibold">
                          {bookingDetails.slots?.start_time && bookingDetails.slots?.end_time
                            ? `${formatTime12hr(bookingDetails.slots.start_time)} - ${formatTime12hr(bookingDetails.slots.end_time)}`
                            : 'Time not available'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-neutral-600 dark:text-neutral-400">Gender Requirement</label>
                        <p className="text-neutral-900 dark:text-white font-semibold capitalize">
                          {bookingDetails.slots?.gender === 'any' ? 'Open to All' : (bookingDetails.slots?.gender || 'Not specified')}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium text-neutral-600 dark:text-neutral-400">Status</label>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                          {bookingDetails.status || 'Booked'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* ✅ Timeline - MATCH MODAL STYLE */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-neutral-900 dark:text-white">
                        <Clock className="h-4 w-4" />
                        Booking Timeline
                      </h4>
                      <div className="text-sm space-y-1 ml-6">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Booked:</span>
                          <span className="text-neutral-900 dark:text-white">
                            {format(new Date(bookingDetails.created_at), 'MMM dd, yyyy • h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* ✅ Booking ID - MATCH MODAL STYLE */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-neutral-900 dark:text-white">
                        <Hash className="h-4 w-4" />
                        Booking ID
                      </h4>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 p-3 rounded border flex-1 break-all text-neutral-900 dark:text-white">
                          {bookingId}
                        </p>
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          size="lg"
                          className="shrink-0 cursor-pointer"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                    <p>Unable to load booking details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ✅ Important Notes - IMPROVED DESIGN */}
            <Card className="border border-amber-200 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-900/20">
              <CardContent className="p-4"> {/* ✅ Reduced from p-6 to p-4 */}
                <div className="space-y-2"> {/* ✅ Reduced from space-y-3 to space-y-2 */}
                  <h3 className="font-medium text-amber-900 dark:text-amber-200 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full" /> {/* ✅ Smaller dot, better colors */}
                    Important Notes
                  </h3>
                  <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-300"> {/* ✅ Reduced spacing, better contrast */}
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5 font-bold">•</span> {/* ✅ Better bullet color */}
                      <span>Show this booking ID at the sports complex desk</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5 font-bold">•</span>
                      <span>Arrive 5-10 minutes before your slot time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5 font-bold">•</span>
                      <span>Cancellation allowed up to 30 minutes prior</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5 font-bold">•</span>
                      <span>Bring your student/faculty ID for verification</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* ✅ Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => {
                  start()
                  router.push('/my-bookings')
                }}
                className="flex-1 cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-700 hover:grayscale-25 dark:from-emerald-600 dark:to-emerald-700 text-white order-1 sm:order-2"
              >
                View My Bookings
              </Button>

              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1 cursor-pointer border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Spots
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}