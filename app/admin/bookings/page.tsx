'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Copy, Check, ClipboardList, Search, Loader } from 'lucide-react'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

// Define types
interface Profile {
  first_name: string;
  last_name: string;
  prn: string;
  gender: string;
  user_type: string;
  phone_number: string;
}

interface Sport {
  name: string;
}

interface Slot {
  start_time: string;
  end_time: string;
}

interface Booking {
  id: string;
  status: string;
  created_at: string;
  seat_number: number;
  checked_in_at: string | null;
  checked_out_at: string | null;
  profiles: Profile;
  sports: Sport;
  slots: Slot;
}

export default function AdminBookingsPage() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'check-in' | 'check-out'>('check-in')
  const [showBookingId, setShowBookingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [genderFilter, setGenderFilter] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showConnectionStatus, setShowConnectionStatus] = useState(false)
  const [debouncedIsConnected, setDebouncedIsConnected] = useState(false)
  const perPage = 50

  const fetchBookings = useCallback(async () => {
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, error } = await supabase
      .from('bookings')
      .select(`
      id, status, created_at, seat_number, checked_in_at, checked_out_at,
      profiles ( first_name, last_name, prn, gender, user_type, phone_number ),
      sports ( name ),
      slots ( start_time, end_time )
    `)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    // Cast the response as Booking[]
    return (data || []) as unknown as Booking[]
  }, [page, supabase])

  // Use our realtime hook
  const { data: bookings, loading: loadingBookings, isConnected } = useRealtimeSubscription<Booking>(
    'bookings',     // table name
    [],             // initial data (empty array)
    fetchBookings   // fetch function
  )

  // ✅ Debounce connection status to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedIsConnected(isConnected)
    }, 500) // Debounce connection status by 500ms

    return () => clearTimeout(timer)
  }, [isConnected])

  // ✅ Show connection status after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectionStatus(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  // Helper function to get current IST timestamp
  const getCurrentISTTimestamp = () => {
    return new Date().toISOString()
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

  const handleStatusChange = async () => {
    if (!confirmId) return
    setLoading(true)
    const booking = bookings.find((b) => b.id === confirmId)
    if (!booking) return toast.error('Booking not found')

    let newStatus = booking.status
    const now = getCurrentISTTimestamp()
    let updateData: {
      status: string;
      checked_in_at?: string | null;
      checked_out_at?: string | null
    } = {
      status: newStatus
    }

    if (actionType === 'check-in') {
      if (booking.status === 'checked-in') {
        // Revert to booked, clear check-in time
        newStatus = 'booked'
        updateData = {
          status: newStatus,
          checked_in_at: null
        }
      } else {
        // Set to checked-in with current time
        newStatus = 'checked-in'
        updateData = {
          status: newStatus,
          checked_in_at: now
        }
      }
    } else if (actionType === 'check-out') {
      if (booking.status === 'checked-out') {
        // Revert to checked-in, clear check-out time
        newStatus = 'checked-in'
        updateData = {
          status: newStatus,
          checked_out_at: null
        }
      } else {
        // Set to checked-out with current time
        newStatus = 'checked-out'
        updateData = {
          status: newStatus,
          checked_out_at: now
        }
      }
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', confirmId)

    if (!error) {
      toast.success(`Status updated to "${newStatus}"`)
      // No need to manually update state - Realtime will handle it
    } else {
      toast.error(`Failed to update status: ${error.message}`) // Use error message here
      console.error('Error updating booking status:', error) // Log the error object
    }

    setLoading(false)
    setConfirmId(null)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('bookings').delete().eq('id', deleteId)
    if (!error) {
      toast.success('Booking deleted')
      // No need to manually update state - Realtime will handle it
    } else {
      toast.error('Failed to delete')
    }
    setDeleting(false)
    setDeleteId(null)
  }

  const uniqueGenders = Array.from(new Set(bookings.filter(b => b.profiles?.gender).map(b => b.profiles.gender)))
  const uniqueUserTypes = Array.from(new Set(bookings.filter(b => b.profiles?.user_type).map(b => b.profiles.user_type)))
  const uniqueSports = Array.from(new Set(bookings.filter(b => b.sports?.name).map(b => b.sports.name)))
  const uniqueStatuses = Array.from(new Set(bookings.filter(b => b.status).map(b => b.status)))

  const formatTime12hr = (time24: string) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
  }

  const filteredBookings = bookings.filter((b) => {
    const query = search.toLowerCase()
    const st12 = formatTime12hr(b.slots?.start_time || '')
    const et12 = formatTime12hr(b.slots?.end_time || '')
    const gender = b.profiles?.gender?.toLowerCase() || ''
    const userType = b.profiles?.user_type?.toLowerCase() || ''
    const sport = b.sports?.name?.toLowerCase() || ''
    const status = b.status?.toLowerCase() || ''

    const matchesSearch = (
      b.id.toLowerCase().includes(query) ||
      (b.profiles?.first_name?.toLowerCase() || '').includes(query) ||
      (b.profiles?.last_name?.toLowerCase() || '').includes(query) ||
      (b.profiles?.prn?.toLowerCase() || '').includes(query) ||
      (b.profiles?.phone_number?.toLowerCase() || '').includes(query) ||
      gender.includes(query) ||
      userType.includes(query) ||
      sport.includes(query) ||
      status.includes(query) ||
      (b.slots?.start_time?.toLowerCase() || '').includes(query) ||
      (b.slots?.end_time?.toLowerCase() || '').includes(query) ||
      st12.includes(query) ||
      et12.includes(query) ||
      (b.seat_number?.toString().toLowerCase() || '').includes(query) ||
      (b.checked_in_at ? formatISTTimestamp(b.checked_in_at).toLowerCase().includes(query) : false) ||
      (b.checked_out_at ? formatISTTimestamp(b.checked_out_at).toLowerCase().includes(query) : false)
    )

    const matchesGender = !genderFilter || gender === genderFilter.toLowerCase()
    const matchesUserType = !userTypeFilter || userType === userTypeFilter.toLowerCase()
    const matchesSport = !sportFilter || sport === sportFilter.toLowerCase()
    const matchesStatus = !statusFilter || status === statusFilter.toLowerCase()

    return matchesSearch && matchesGender && matchesUserType && matchesSport && matchesStatus
  })

  const handleCopy = () => {
    if (showBookingId) {
      navigator.clipboard.writeText(showBookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-green-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-green-950/20">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                  Manage Bookings
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and manage current bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/20">
              {showConnectionStatus && (
                <>
                  {debouncedIsConnected ? (
                    <>
                      <div className="relative">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full" />
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full absolute inset-0 animate-ping" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        <span className="hidden sm:inline">Live Bookings: {filteredBookings.length}</span>
                        <span className="sm:hidden">Live Bookings: {filteredBookings.length}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        <span className="hidden sm:inline">Connecting...</span>
                        <span className="sm:hidden">Connecting</span>
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-500" />
              Current Bookings
            </CardTitle>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4">
              <div className="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-center">
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-green-500 dark:focus:border-green-400"
                  />
                </div>

                <Select value={genderFilter} onValueChange={(val) => setGenderFilter(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full md:w-[180px] border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    {uniqueGenders.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={userTypeFilter} onValueChange={(val) => setUserTypeFilter(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full md:w-[180px] border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="All User Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All User Types</SelectItem>
                    {uniqueUserTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sportFilter} onValueChange={(val) => setSportFilter(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full md:w-[180px] border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {uniqueSports.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full md:w-[180px] border-neutral-200 dark:border-neutral-700">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loadingBookings && (
              <div className="flex flex-col justify-center items-center py-16">
                <Loader className="animate-spin text-green-600 dark:text-green-400" />
                <p className="text-muted-foreground mt-4 font-medium">Loading bookings...</p>
              </div>
            )}

            {!loadingBookings && (
              <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-b border-neutral-200 dark:border-neutral-600">
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Booking #</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">User</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">PRN/ID</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Phone</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Gender</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">User Type</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Sport</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Slot</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Booked At</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Check-in</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Check-out</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Spot #</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Status</th>
                      <th className="p-3 text-left font-semibold text-neutral-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, index) => {
                      const now = new Date()
                      const [eh, em] = (b.slots?.end_time || '00:00').split(':').map(Number)
                      const slotEnd = new Date()
                      slotEnd.setHours(eh, em, 0, 0)
                      const slotOver = now > slotEnd

                      const disableDelete = slotOver
                      const disableCheckIn = ['checked-in', 'checked-out', 'booked'].includes(b.status) && slotOver
                      const disableCheckOut = ['booked', 'checked-out'].includes(b.status) && slotOver

                      return (
                        <tr
                          key={b.id}
                          className={`
                            hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200
                            ${index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}
                          `}
                        >
                          <td className="p-3 whitespace-nowrap">
                            <button
                              onClick={() => setShowBookingId(b.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline hover:no-underline transition-all duration-200 font-medium font-mono text-sm"
                            >
                              {b.id.slice(0, 6)}...
                            </button>
                          </td>
                          <td className="p-3 whitespace-nowrap font-medium text-neutral-900 dark:text-white">
                            {b.profiles?.first_name} {b.profiles?.last_name}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                              {b.profiles?.prn || '-'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
                              {b.profiles?.phone_number || '-'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap capitalize">{b.profiles?.gender || '-'}</td>
                          <td className="p-3 whitespace-nowrap capitalize">{b.profiles?.user_type || '-'}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-medium bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm">
                              {b.sports?.name}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="text-sm">
                              <span className="font-medium">{formatTime12hr(b.slots?.start_time)}</span>
                              <span className="text-neutral-400 mx-1">–</span>
                              <span className="font-medium">{formatTime12hr(b.slots?.end_time)}</span>
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                            {b.created_at ? new Date(b.created_at.replace(' ', 'T')).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            }) : ''}
                          </td>
                          <td className="p-3 whitespace-nowrap text-sm">{formatISTTimestamp(b.checked_in_at)}</td>
                          <td className="p-3 whitespace-nowrap text-sm">{formatISTTimestamp(b.checked_out_at)}</td>
                          <td className="p-3 whitespace-nowrap">
                            <Badge variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/50 font-mono">
                              #{b.seat_number}
                            </Badge>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                b.status === 'booked' ?
                                  'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 dark:from-yellow-900/50 dark:to-yellow-800/50 dark:text-yellow-200 dark:border-yellow-700' :
                                  b.status === 'checked-in' ?
                                    'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200 dark:border-green-700' :
                                    b.status === 'checked-out' ?
                                      'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300 dark:from-neutral-800/50 dark:to-neutral-700/50 dark:text-neutral-200 dark:border-neutral-600' :
                                      'bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300 dark:from-neutral-800/50 dark:to-neutral-700/50 dark:text-neutral-200 dark:border-neutral-600'
                              }
                            >
                              {b.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => { setActionType('check-in'); setConfirmId(b.id) }}
                                disabled={loading || disableCheckIn}
                                className={`${disableCheckIn ? 'opacity-50 cursor-not-allowed' : ''} bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900`}
                              >
                                Check-in
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setActionType('check-out'); setConfirmId(b.id) }}
                                disabled={loading || disableCheckOut}
                                className={`${disableCheckOut ? 'opacity-50 cursor-not-allowed' : ''} border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800`}
                              >
                                Check-out
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteId(b.id)}
                                disabled={disableDelete}
                                className={disableDelete ? 'opacity-50 cursor-not-allowed' : ''}
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
                        <td colSpan={14} className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
                              <Search className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No bookings found</h3>
                            <p className="text-muted-foreground">No bookings match your current filters.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={14} className='p8 text-center'>
                        {/* Pagination */}
                        <div className="flex flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-t border-neutral-200 dark:border-neutral-600">
                          <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredBookings.length}</span> bookings
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setPage((p) => Math.max(p - 1, 1))}
                              disabled={page === 1}
                              variant="outline"
                              size="sm"
                              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              Previous
                            </Button>
                            <span className="text-sm font-medium text-neutral-900 dark:text-white px-3">Page {page}</span>
                            <Button
                              onClick={() => setPage((p) => p + 1)}
                              disabled={bookings.length < perPage}
                              variant="outline"
                              size="sm"
                              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ...existing dialogs... */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !deleting && setDeleteId(o ? deleteId : null)}>
        <AlertDialogContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 dark:text-white">Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the booking from the system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Yes, delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmId !== null} onOpenChange={(o) => !loading && setConfirmId(o ? confirmId : null)}>
        <AlertDialogContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 dark:text-white">
              {actionType === 'check-in' ? 'Check-in User?' : 'Check-out User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'check-in' ? 'Mark this booking as checked-in?' : 'Mark this booking as checked-out?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={loading}
              className="bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Yes, confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogAction
              onClick={() => setShowBookingId(null)}
              className="bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900"
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}