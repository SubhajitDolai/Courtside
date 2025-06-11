'use client'

import { useCallback, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Database, Copy, Check } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import BannedRedirect from '@/components/banned-redirect'
import BookingHistoryFilters, { FilterState, Sport } from './components/BookingHistoryFilters'
import BookingHistoryTable from './components/BookingHistoryTable'

// Define the BookingHistory type
interface BookingHistory {
  id: string
  booking_date: string
  status: string
  seat_number: number
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
  sports: { name: string } | null
  slots: { start_time: string, end_time: string } | null
}

interface MyBookingHistoryClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBookings: any[]
  userId: string
}

export default function MyBookingHistoryClient({ userId }: MyBookingHistoryClientProps) {
  const supabase = createClient()
  const [bookings, setBookings] = useState<BookingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(true)
  const itemsPerPage = 20

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    search: '',
    status: 'all',
    sport: 'all'
  })

  // Fetch bookings from bookings_history table
  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage

      // Build the query
      let query = supabase
        .from('bookings_history')
        .select(`
          id, booking_date, status, created_at, seat_number, checked_in_at, checked_out_at,
          sports ( name ),
          slots ( start_time, end_time )
        `, { count: 'exact' })
        .eq('user_id', userId)

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Apply sport filter
      if (filters.sport && filters.sport !== 'all') {
        query = query.eq('sport_id', filters.sport)
      }

      // Apply date range filter
      if (filters.dateRange?.from) {
        query = query.gte('booking_date', filters.dateRange.from.toISOString().split('T')[0])
      }
      if (filters.dateRange?.to) {
        query = query.lte('booking_date', filters.dateRange.to.toISOString().split('T')[0])
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Cast the response as BookingHistory[]
      let fetchedBookings = (data || []) as unknown as BookingHistory[]

      // Apply search filter on client side
      if (filters.search && filters.search.trim()) {
        const search = filters.search.toLowerCase().trim()
        fetchedBookings = fetchedBookings.filter(booking => {
          const bookingId = booking.id.toLowerCase()
          const sportName = booking.sports?.name?.toLowerCase() || ''
          const seatNumber = booking.seat_number.toString()
          
          return (
            bookingId.includes(search) ||
            sportName.includes(search) ||
            seatNumber.includes(search)
          )
        })
      }

      setBookings(fetchedBookings)
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching booking history:', error)
      toast.error('Failed to load booking history')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters, supabase, userId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Fetch available statuses and sports for the dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilterOptions(true)
      try {
        // Fetch sports
        const { data: sportsData, error: sportsError } = await supabase
          .from('sports')
          .select('id, name')
          .order('name')

        if (sportsError) throw sportsError
        setSports(sportsData || [])

        // Fetch available statuses
        const { data, error } = await supabase
          .from('bookings_history')
          .select('status')
          .eq('user_id', userId)
          .not('status', 'is', null)

        if (error) {
          console.error('Error fetching statuses:', error)
          return
        }

        // Get unique statuses and sort them
        const uniqueStatuses = [...new Set(data?.map(item => item.status) || [])]
        setAvailableStatuses(uniqueStatuses.sort())
      } catch (error) {
        console.error('Error fetching filter options:', error)
      } finally {
        setLoadingFilterOptions(false)
      }
    }

    fetchFilterOptions()
  }, [supabase, userId])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Refresh both bookings and available statuses
      await Promise.all([
        fetchBookings(),
        // Refresh available statuses and sports
        (async () => {
          try {
            // Fetch sports
            const { data: sportsData, error: sportsError } = await supabase
              .from('sports')
              .select('id, name')
              .order('name')

            if (!sportsError && sportsData) {
              setSports(sportsData)
            }

            // Fetch statuses
            const { data, error } = await supabase
              .from('bookings_history')
              .select('status')
              .eq('user_id', userId)
              .not('status', 'is', null)

            if (!error && data) {
              const uniqueStatuses = [...new Set(data.map(item => item.status))]
              setAvailableStatuses(uniqueStatuses.sort())
            }
          } catch (error) {
            console.error('Error refreshing filter options:', error)
          }
        })()
      ])
    } finally {
      setRefreshing(false)
    }
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.sport !== 'all' || filters.dateRange

  const handleCopy = () => {
    if (showBookingId) {
      navigator.clipboard.writeText(showBookingId)
      setCopied(true)
      toast.success('Booking ID copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <BannedRedirect />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Advanced Filters Section */}
        <BookingHistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableStatuses={availableStatuses}
          sports={sports}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          loadingFilterOptions={loadingFilterOptions}
        />

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-950/50 dark:to-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            {loading && bookings.length === 0 ? (
              <Skeleton className="h-6 w-64" />
            ) : (
              <span className="font-medium text-neutral-900 dark:text-white">
                {loading ? (
                  <>Loading booking history...</>
                ) : filters.search ? (
                  <>Found {bookings.length} result{bookings.length !== 1 ? 's' : ''} for &quot;{filters.search}&quot;</>
                ) : (
                  <>Showing {bookings.length} of {totalCount} total bookings</>
                )}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {loading && bookings.length === 0 ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              !loading && `Page ${currentPage} of ${totalPages}`
            )}
          </div>
        </div>

        {/* Table */}
        <BookingHistoryTable
          bookings={bookings}
          loading={loading}
          hasActiveFilters={!!hasActiveFilters}
          searchTerm={filters.search}
          onShowBookingId={setShowBookingId}
        />

        {/* Pagination */}
        {(totalPages > 1 || (loading && bookings.length === 0)) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <div className="text-sm text-muted-foreground">
              {loading && bookings.length === 0 ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <>
                  Showing <span className="font-medium text-neutral-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium text-neutral-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                  <span className="font-medium text-neutral-900 dark:text-white">{totalCount}</span> entries
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {loading && bookings.length === 0 ? (
                <>
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-9 w-16" />
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{currentPage}</span>
                    <span className="text-sm text-muted-foreground">of {totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Booking ID Dialog */}
        <AlertDialog open={showBookingId !== null} onOpenChange={(open) => {
          if (!open) {
            setShowBookingId(null)
            setCopied(false)
          }
        }}>
          <AlertDialogContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-neutral-900 dark:text-white">Booking Number</AlertDialogTitle>
              <AlertDialogDescription className="flex items-center justify-between mt-3 font-mono text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <span className="text-neutral-900 dark:text-white select-all">{showBookingId}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCopy}
                  className="ml-3 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowBookingId(null)}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}