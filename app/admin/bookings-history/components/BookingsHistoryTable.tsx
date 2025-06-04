'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, User, Copy, Check, ChevronLeft, ChevronRight, Database, Search, Loader } from 'lucide-react'
import { format } from 'date-fns'
import BookingDetailsModal from './BookingDetailsModal'
import { FilterState } from './BookingsHistoryFilters'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

// Define types matching your bookings table structure
interface Profile {
  first_name: string;
  last_name: string;
  prn: string;
  gender: string;
  user_type: string;
  email: string;
  phone_number: string;
}

interface Sport {
  name: string;
}

interface Slot {
  start_time: string;
  end_time: string;
}

interface BookingHistory {
  id: string
  user_id: string
  sport_id: string
  slot_id: string
  booking_date: string
  seat_number: number
  status: string
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
  // Joined data - matching your bookings table structure
  profiles: Profile
  sports: Sport
  slots: Slot
}

interface BookingsHistoryTableProps {
  filters: FilterState
}

export default function BookingsHistoryTable({ filters }: BookingsHistoryTableProps) {
  const [bookings, setBookings] = useState<BookingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const itemsPerPage = 50

  const supabase = createClient()

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage

      // Build the query - exactly like your bookings table
      let query = supabase
        .from('bookings_history')
        .select(`
          id, booking_date, status, created_at, seat_number, checked_in_at, checked_out_at,
          profiles ( first_name, last_name, prn, gender, user_type, email, phone_number ),
          sports ( name ),
          slots ( start_time, end_time )
        `, { count: 'exact' })

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.sport && filters.sport !== 'all') {
        query = query.eq('sport_id', filters.sport)
      }

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

      // Apply search filter on client side (more comprehensive)
      if (filters.search && filters.search.trim()) {
        const searchQuery = filters.search.toLowerCase().trim()
        fetchedBookings = fetchedBookings.filter(booking => {
          const firstName = booking.profiles?.first_name?.toLowerCase() || ''
          const lastName = booking.profiles?.last_name?.toLowerCase() || ''
          const fullName = `${firstName} ${lastName}`.trim()
          const prn = booking.profiles?.prn?.toLowerCase() || ''
          const bookingId = booking.id.toLowerCase()
          
          return (
            firstName.includes(searchQuery) ||
            lastName.includes(searchQuery) ||
            fullName.includes(searchQuery) ||
            prn.includes(searchQuery) ||
            bookingId.includes(searchQuery)
          )
        })
      }

      setBookings(fetchedBookings)
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filters, supabase])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCopy = () => {
    if (showBookingId) {
      navigator.clipboard.writeText(showBookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'booked': { 
        color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 dark:from-yellow-900/50 dark:to-yellow-800/50 dark:text-yellow-200 dark:border-yellow-700', 
        label: 'Booked' 
      },
      'checked-in': { 
        color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200 dark:border-green-700', 
        label: 'Checked In' 
      },
      'checked-out': { 
        color: 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300 dark:from-neutral-800/50 dark:to-neutral-700/50 dark:text-neutral-200 dark:border-neutral-600', 
        label: 'Checked Out' 
      },
      'cancelled': { 
        color: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-200 dark:border-red-700', 
        label: 'Cancelled' 
      },
      'no-show': { 
        color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 dark:from-orange-900/50 dark:to-orange-800/50 dark:text-orange-200 dark:border-orange-700', 
        label: 'No Show' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['booked']
    
    return (
      <Badge className={`${config.color} border font-medium px-3 py-1`}>
        {config.label}
      </Badge>
    )
  }

  // Helper function to format time to 12hr format
  const formatTime12hr = (time24: string) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  }

  // Helper function to format timestamp in IST
  const formatISTTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '-'

    try {
      return new Date(timestamp).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      })
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return '-'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <Loader className="animate-spin text-green-600 dark:text-green-400" />
        <p className="text-muted-foreground mt-4 font-medium">Loading bookings...</p>
      </div>
    )
  }

  if (!bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
          {filters.search ? (
            <Search className="h-10 w-10 text-neutral-400" />
          ) : (
            <Database className="h-10 w-10 text-neutral-400" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          {filters.search ? 'No matching bookings' : 'No bookings found'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {filters.search ? (
            <>No bookings match your search criteria. Try adjusting your filters or search terms.</>
          ) : Object.values(filters).some(v => v && v !== 'all') ? (
            <>Try adjusting your filters to see more results.</>
          ) : (
            <>No booking records exist in the database yet.</>
          )}
        </p>
        {filters.search && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-950/50 px-3 py-1 rounded-full">
            Searched for: &quot;{filters.search}&quot;
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-neutral-900 dark:text-white">
            {filters.search ? (
              <>Found {bookings.length} result{bookings.length !== 1 ? 's' : ''} for &quot;{filters.search}&quot;</>
            ) : (
              <>Showing {bookings.length} of {totalCount} total bookings</>
            )}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Booking #</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">User</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">PRN/ID</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Gender</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">User Type</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Sport</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Slot</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Date</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Booked At</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Check-in</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Check-out</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Spot #</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Status</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking, index) => (
                <TableRow 
                  key={booking.id} 
                  className={`
                    hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200
                    ${index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}
                  `}
                >
                  <TableCell className="font-mono text-sm">
                    <button 
                      onClick={() => setShowBookingId(booking.id)} 
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline hover:no-underline transition-all duration-200 font-medium"
                    >
                      {booking.id.slice(0, 8)}...
                    </button>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {booking.profiles?.first_name} {booking.profiles?.last_name}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      {booking.profiles?.prn || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{booking.profiles?.gender || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{booking.profiles?.user_type || '-'}</span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm">
                      {booking.sports?.name || 'N/A'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">
                        {formatTime12hr(booking.slots?.start_time || '')}
                      </span>
                      <span className="text-neutral-400 mx-1">&ndash;</span>
                      <span className="font-medium">
                        {formatTime12hr(booking.slots?.end_time || '')}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">
                      {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {booking.created_at ? new Date(booking.created_at.replace(' ', 'T')).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }) : ''}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">{formatISTTimestamp(booking.checked_in_at)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatISTTimestamp(booking.checked_out_at)}</span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/50 font-mono">
                      #{booking.seat_number}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                      className="h-8 w-8 p-0 hover:bg-green-50 dark:hover:bg-green-950/50 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-neutral-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
          <span className="font-medium text-neutral-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
          <span className="font-medium text-neutral-900 dark:text-white">{totalCount}</span> entries
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Booking ID Dialog */}
      <AlertDialog open={showBookingId !== null} onOpenChange={(o) => { setShowBookingId(o ? showBookingId : null); setCopied(false) }}>
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
  )
}