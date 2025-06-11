'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { History, Calendar, Clock, Loader } from 'lucide-react'
import { format } from 'date-fns'

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

interface BookingHistoryTableProps {
  bookings: BookingHistory[]
  loading: boolean
  hasActiveFilters: boolean
  searchTerm: string
  onShowBookingId: (id: string) => void
}

// Helper function to format time to 12hr format
const formatTime12hr = (time24: string) => {
  if (!time24) return ''
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
      label: 'Completed' 
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

  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300 dark:from-neutral-800/50 dark:to-neutral-700/50 dark:text-neutral-200 dark:border-neutral-600',
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
  }
  
  return (
    <Badge className={`${config.color} border font-medium px-3 py-1`}>
      {config.label}
    </Badge>
  )
}

function BookingHistoryTable({ 
  bookings, 
  loading, 
  hasActiveFilters, 
  searchTerm, 
  onShowBookingId 
}: BookingHistoryTableProps) {
  // Show skeleton loading for initial load
  if (loading && bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden">
        {/* Mobile Skeleton Layout */}
        <div className="block md:hidden">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4">
                {/* Header Row Skeleton */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="ml-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>

                {/* Details Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-neutral-500" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-neutral-500" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Skeleton Layout */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Booking #</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Sport</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Date</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Time Slot</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Seat #</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Status</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Booked At</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Check-in</TableHead>
                <TableHead className="font-semibold text-neutral-900 dark:text-white">Check-out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow 
                  key={index} 
                  className={`${index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}`}
                >
                  <TableCell className="font-mono text-sm">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (bookings.length === 0 && !loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
            <History className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No booking history found</h3>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            {hasActiveFilters ? (
              "No bookings match your search criteria. Try adjusting your filters."
            ) : (
              "You don't have any booking history yet. Visit the sports section to make your first booking."
            )}
          </p>
          {searchTerm && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 bg-neutral-50 dark:bg-neutral-950/50 px-3 py-1 rounded-full">
              Searched for: &quot;{searchTerm}&quot;
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg overflow-hidden relative">
      {/* Loading Overlay - only shows over table content during filtering */}
      {loading && bookings.length > 0 && (
        <div className="absolute inset-0 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader className="h-6 w-6 text-neutral-600 animate-spin" />
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-500">Updating...</p>
          </div>
        </div>
      )}
      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full">
                      {booking.sports?.name || 'N/A'}
                    </span>
                    <Badge variant="outline" className="text-xs border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950/50 font-mono">
                      #{booking.seat_number}
                    </Badge>
                  </div>
                  <button 
                    onClick={() => onShowBookingId(booking.id)} 
                    className="text-xs font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 underline hover:no-underline transition-all duration-200 truncate"
                  >
                    {booking.id.slice(0, 12)}...
                  </button>
                </div>
                <div className="ml-2">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-neutral-500" />
                    <span className="font-medium text-neutral-900 dark:text-white text-xs">
                      {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-neutral-500" />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {formatTime12hr(booking.slots?.start_time || '')} - {formatTime12hr(booking.slots?.end_time || '')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">
                    <span className="block">Booked:</span>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {booking.created_at ? new Date(booking.created_at.replace(' ', 'T')).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }) : ''}
                    </span>
                  </div>
                  {(booking.checked_in_at || booking.checked_out_at) && (
                    <div className="text-xs text-neutral-500">
                      {booking.checked_in_at && (
                        <div>
                          <span className="block">Check-in:</span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {formatISTTimestamp(booking.checked_in_at)}
                          </span>
                        </div>
                      )}
                      {booking.checked_out_at && (
                        <div className="mt-1">
                          <span className="block">Check-out:</span>
                          <span className="text-neutral-600 dark:text-neutral-400">
                            {formatISTTimestamp(booking.checked_out_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Booking #</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Sport</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Date</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Time Slot</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Seat #</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Status</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Booked At</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Check-in</TableHead>
              <TableHead className="font-semibold text-neutral-900 dark:text-white">Check-out</TableHead>
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
                    onClick={() => onShowBookingId(booking.id)} 
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 underline hover:no-underline transition-all duration-200 font-medium"
                  >
                    {booking.id.slice(0, 8)}...
                  </button>
                </TableCell>
                
                <TableCell>
                  <span className="font-medium bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm">
                    {booking.sports?.name || 'N/A'}
                  </span>
                </TableCell>
                
                <TableCell>
                  <span className="font-medium">
                    {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                  </span>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium">
                      {formatTime12hr(booking.slots?.start_time || '')}
                    </span>
                    <span className="text-neutral-400 mx-1">–</span>
                    <span className="font-medium">
                      {formatTime12hr(booking.slots?.end_time || '')}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950/50 font-mono">
                    #{booking.seat_number}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  {getStatusBadge(booking.status)}
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(BookingHistoryTable)
