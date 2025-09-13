'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { 
  ActivitySquare, 
  Loader, 
  Search, 
  Mail, 
  Hash, 
  X, 
  UserX,
  Calendar, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin,
  Activity,
  BarChart3,
  TrendingUp,
  Download
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  prn: string | null
  email: string | null
  course: string | null
  gender: string | null
  user_type: string | null
  role: string
  created_at: string
}

interface BookingActivity {
  id: string
  booking_date: string
  seat_number: number | null
  status: string
  checked_in_at: string | null
  checked_out_at: string | null
  created_at: string
  sport_name: string
  sport_image: string | null
  start_time: string
  end_time: string
}

export default function UserActivityPage() {
  const [searchType, setSearchType] = useState<'name' | 'prn' | 'email'>('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [userActivities, setUserActivities] = useState<BookingActivity[]>([])
  const [loading, setLoading] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10) // Items per page
  const [allActivities, setAllActivities] = useState<BookingActivity[]>([]) // For stats calculation
  
  const supabase = createClient()
  const { resolvedTheme } = useTheme()
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b"

  // Fetch all activities for stats (without pagination)
  const fetchAllUserActivities = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings_history')
        .select(`
          id,
          booking_date,
          seat_number,
          status,
          checked_in_at,
          checked_out_at,
          created_at,
          sports!inner(name, image_url),
          slots!inner(start_time, end_time)
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activities: BookingActivity[] = (data || []).map((item: any) => ({
        id: item.id,
        booking_date: item.booking_date,
        seat_number: item.seat_number,
        status: item.status,
        checked_in_at: item.checked_in_at,
        checked_out_at: item.checked_out_at,
        created_at: item.created_at,
        sport_name: item.sports?.name || 'Unknown',
        sport_image: item.sports?.image_url || null,
        start_time: item.slots?.start_time || '',
        end_time: item.slots?.end_time || ''
      }))

      setAllActivities(activities)
      return activities
    } catch (error) {
      console.error('Error fetching all user activities:', error)
      return []
    }
  }

  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    try {
      setSearching(true)
      setSearchPerformed(true)
      
      let query = supabase
        .from('profiles')
        .select('*')
        .limit(10)

      switch (searchType) {
        case 'name':
          query = query.or(`first_name.ilike.%${searchQuery.trim()}%,last_name.ilike.%${searchQuery.trim()}%`)
          break
        case 'prn':
          query = query.ilike('prn', `%${searchQuery.trim()}%`)
          break
        case 'email':
          query = query.ilike('email', `%${searchQuery.trim()}%`)
          break
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setSearchResults(data || [])
      
      if (!data || data.length === 0) {
        toast.info('No users found matching your search')
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Error searching for users')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [searchQuery, searchType, supabase])

  const fetchUserActivity = async (userId: string, page: number = 1) => {
    setLoading(true)
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // First get the total count
      const { count } = await supabase
        .from('bookings_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Then get the paginated data
      const { data, error } = await supabase
        .from('bookings_history')
        .select(`
          id,
          booking_date,
          seat_number,
          status,
          checked_in_at,
          checked_out_at,
          created_at,
          sports!inner(name, image_url),
          slots!inner(start_time, end_time)
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activities: BookingActivity[] = (data || []).map((item: any) => ({
        id: item.id,
        booking_date: item.booking_date,
        seat_number: item.seat_number,
        status: item.status,
        checked_in_at: item.checked_in_at,
        checked_out_at: item.checked_out_at,
        created_at: item.created_at,
        sport_name: item.sports?.name || 'Unknown',
        sport_image: item.sports?.image_url || null,
        start_time: item.slots?.start_time || '',
        end_time: item.slots?.end_time || ''
      }))

      setTotalCount(count || 0)
      return activities
    } catch (error) {
      console.error('Error fetching user activity:', error)
      toast.error('Error loading user activity')
      setTotalCount(0)
      return []
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = async (user: Profile) => {
    setCurrentPage(1) // Reset to first page when selecting new user
    setSelectedUser(user)
    setSearchResults([])
    setSearchPerformed(false)
    
    // Fetch both paginated activities and all activities for stats
    const [activities] = await Promise.all([
      fetchUserActivity(user.id, 1),
      fetchAllUserActivities(user.id)
    ])
    
    setUserActivities(activities)
  }

  const handlePageChange = async (page: number) => {
    if (!selectedUser) return
    
    setCurrentPage(page)
    const activities = await fetchUserActivity(selectedUser.id, page)
    setUserActivities(activities)
  }

  const handleSearch = () => {
    searchUsers()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const exportToCSV = () => {
    if (!selectedUser || allActivities.length === 0) {
      toast.error('No data to export')
      return
    }

    try {
      // Prepare CSV headers
      const headers = [
        'Sport Name',
        'Booking Date',
        'Start Time',
        'End Time',
        'Seat Number',
        'Status',
        'Check-in Time',
        'Check-out Time',
        'Created At'
      ]

      // Prepare CSV data
      const csvData = allActivities.map(activity => [
        activity.sport_name,
        format(new Date(activity.booking_date), 'yyyy-MM-dd'),
        activity.start_time,
        activity.end_time,
        activity.seat_number || 'N/A',
        activity.status,
        activity.checked_in_at ? format(new Date(activity.checked_in_at), 'yyyy-MM-dd HH:mm:ss') : 'Not checked in',
        activity.checked_out_at ? format(new Date(activity.checked_out_at), 'yyyy-MM-dd HH:mm:ss') : 'Not checked out',
        format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss')
      ])

      // Convert to CSV format
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => 
          // Escape commas and quotes in data
          typeof field === 'string' && (field.includes(',') || field.includes('"')) 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      const userName = getDisplayName(selectedUser).replace(/[^a-zA-Z0-9]/g, '_')
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
      const filename = `user_activity_${userName}_${timestamp}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('User activity exported successfully!')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export user activity')
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchPerformed(false)
    setSelectedUser(null)
    setUserActivities([])
    setAllActivities([])
    setCurrentPage(1)
    setTotalCount(0)
  }

  const getInitials = (profile: Profile) => {
    if (profile.first_name?.[0] && profile.last_name?.[0]) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return profile.email?.[0]?.toUpperCase() || 'U'
  }

  const getDisplayName = (profile: Profile) => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    return fullName || profile.email?.split('@')[0] || 'Unknown User'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Booked
        </Badge>
      case 'checked-in':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Checked In
        </Badge>
      case 'checked-out':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          {status}
        </Badge>
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':')
      const time = new Date()
      time.setHours(parseInt(hours), parseInt(minutes))
      return format(time, 'h:mm a')
    } catch {
      return timeString
    }
  }

  const stats = useMemo(() => {
    if (!selectedUser || allActivities.length === 0) {
      return { totalBookings: 0, completedBookings: 0, attendanceRate: 0, mostPlayedSport: 'None', lastActivity: null }
    }

    const totalBookings = allActivities.length
    const completedBookings = allActivities.filter(a => a.status === 'checked-out').length
    const checkedInBookings = allActivities.filter(a => a.status === 'checked-in').length
    const attendanceRate = totalBookings > 0 ? ((completedBookings + checkedInBookings) / totalBookings) * 100 : 0
    
    const sportsCount: { [key: string]: number } = {}
    allActivities.forEach(activity => {
      sportsCount[activity.sport_name] = (sportsCount[activity.sport_name] || 0) + 1
    })
    
    const mostPlayedSport = Object.entries(sportsCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    
    const lastActivity = allActivities[0] ? new Date(allActivities[0].booking_date) : null
    
    return {
      totalBookings,
      completedBookings,
      attendanceRate: Math.round(attendanceRate),
      mostPlayedSport,
      lastActivity
    }
  }, [selectedUser, allActivities])

  const chartData = useMemo(() => {
    // Sports distribution data
    const sportsCount: { [key: string]: number } = {}
    allActivities.forEach(activity => {
      sportsCount[activity.sport_name] = (sportsCount[activity.sport_name] || 0) + 1
    })
    
    const sportsData = Object.entries(sportsCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Monthly activity data (last 6 months)
    const monthlyCount: { [key: string]: number } = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    // Initialize last 6 months
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      monthlyCount[monthKey] = 0
    }

    allActivities.forEach(activity => {
      const date = new Date(activity.booking_date)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      if (monthlyCount[monthKey] !== undefined) {
        monthlyCount[monthKey]++
      }
    })

    const monthlyData = Object.entries(monthlyCount).map(([name, value]) => ({ name, value }))

    // Weekly pattern data
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const weeklyCount: { [key: string]: number } = {}
    
    weekdays.forEach(day => {
      weeklyCount[day] = 0
    })

    allActivities.forEach(activity => {
      const date = new Date(activity.booking_date)
      const dayIndex = date.getDay()
      const dayName = weekdays[dayIndex === 0 ? 6 : dayIndex - 1] // Adjust Sunday to be last
      weeklyCount[dayName]++
    })

    const weeklyData = weekdays.map(day => ({ name: day.slice(0, 3), fullName: day, value: weeklyCount[day] }))

    return { sportsData, monthlyData, weeklyData }
  }, [allActivities])

  // Enhanced color palette
  const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald  
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ]

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color || '#3b82f6' }}
            />
            <span className="font-medium text-foreground text-sm">{label || data.name}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bookings:</span>
              <span className="font-semibold text-foreground">{data.value}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-cyan-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-cyan-950/20">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 pt-28 sm:pt-32">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <ActivitySquare className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 px-2">
            User
            <span className="bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-cyan-400 dark:to-blue-300 bg-clip-text text-transparent"> Activity</span>
          </h1>
          
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
          {/* Search Section */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm h-fit">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                  <ActivitySquare className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-500 shrink-0" />
                  <span className="truncate">Search User</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">{/* Search content will go here */}
                <div className="space-y-4">
                  {/* Search Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="search-type" className="text-sm font-medium">
                      Search by
                    </Label>
                    <Select value={searchType} onValueChange={(value: 'name' | 'prn' | 'email') => setSearchType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select search type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="prn">PRN</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Input */}
                  <div className="space-y-2">
                    <Label htmlFor="search-query" className="text-sm font-medium">
                      {searchType === 'name' ? 'Enter name' : searchType === 'prn' ? 'Enter PRN' : 'Enter email'}
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="search-query"
                          placeholder={
                            searchType === 'name' 
                              ? 'e.g. John Doe' 
                              : searchType === 'prn' 
                                ? 'e.g. 12345' 
                                : 'e.g. john@example.com'
                          }
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-cyan-500 dark:focus:border-cyan-400"
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={searching || !searchQuery.trim()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4"
                      >
                        {searching ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                      {(searchQuery || searchResults.length > 0) && (
                        <Button
                          onClick={clearSearch}
                          variant="outline"
                          size="icon"
                          className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Results */}
                  {searching && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <Loader className="animate-spin text-cyan-600 dark:text-cyan-400 h-5 w-5" />
                        <p className="text-muted-foreground font-medium">Searching users...</p>
                      </div>
                    </div>
                  )}

                  {!searching && searchPerformed && searchResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-xl flex items-center justify-center">
                        <UserX className="h-6 w-6 text-neutral-400" />
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
                        No users found
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        No users found matching your search criteria. Try a different search term.
                      </p>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                          Search Results ({searchResults.length})
                        </h3>
                        <Button
                          onClick={clearSearch}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.map((user) => (
                          <Card
                            key={user.id}
                            className="p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200 border border-neutral-200 dark:border-neutral-700"
                            onClick={() => handleUserClick(user)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-semibold">
                                  {getInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                                    {getDisplayName(user)}
                                  </h4>
                                  {user.role === 'admin' && (
                                    <Badge variant="outline" className="text-xs">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                  {user.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      <span className="truncate">{user.email}</span>
                                    </div>
                                  )}
                                  {user.prn && (
                                    <div className="flex items-center gap-1">
                                      <Hash className="w-3 h-3" />
                                      <span>PRN: {user.prn}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Charts - Show when user is selected */}
            {selectedUser && userActivities.length > 0 && (
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-500 shrink-0" />
                    <span className="truncate">User Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-6">
                    {/* Sports Distribution Chart */}
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        Sports Distribution
                      </h3>
                      {chartData.sportsData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData.sportsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={600}
                              >
                                {chartData.sportsData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke={resolvedTheme === "dark" ? "#1f2937" : "#ffffff"}
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm">No sports data</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Monthly Activity Chart */}
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        Monthly Activity (Last 6 Months)
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} 
                              opacity={0.6}
                            />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: textColor, fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fill: textColor, fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                              width={25}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                              dataKey="value" 
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                              animationDuration={800}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Weekly Pattern Chart */}
                    <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        Weekly Activity Pattern
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid 
                              strokeDasharray="3 3" 
                              stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} 
                              opacity={0.6}
                            />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: textColor, fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fill: textColor, fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                              width={25}
                            />
                            <Tooltip 
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                                        <span className="font-medium text-foreground text-sm">{data.fullName}</span>
                                      </div>
                                      <div className="text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Bookings:</span>
                                          <span className="font-semibold text-foreground">{data.value}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="#8b5cf6"
                              radius={[4, 4, 0, 0]}
                              animationDuration={800}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                  <ActivitySquare className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-500 shrink-0" />
                  <span className="truncate">Activity Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <Loader className="animate-spin text-cyan-600 dark:text-cyan-400 h-5 w-5" />
                      <p className="text-muted-foreground font-medium">Loading user activity...</p>
                    </div>
                  </div>
                ) : selectedUser ? (
                  <div className="space-y-6">
                    {/* User Profile Card */}
                    <Card className="border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-lg font-bold">
                              {getInitials(selectedUser)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                  {getDisplayName(selectedUser)}
                                </h2>
                                {selectedUser.role === 'admin' && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 self-center sm:self-auto">
                                    Admin
                                  </Badge>
                                )}
                              </div>
                              {/* {stats.totalBookings > 0 && (
                                <Button
                                  onClick={exportToCSV}
                                  size="sm"
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white self-center sm:self-auto"
                                >
                                  <Download className="w-4 h-4" />
                                  Download CSV
                                </Button>
                              )} */}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                              {selectedUser.email && (
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground truncate">{selectedUser.email}</span>
                                </div>
                              )}
                              {selectedUser.prn && (
                                <div className="flex items-center gap-2 justify-center sm:justify-start">
                                  <Hash className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">PRN: {selectedUser.prn}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Joined {format(new Date(selectedUser.created_at), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border border-neutral-200 dark:border-neutral-700">
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalBookings}</p>
                          <p className="text-sm text-muted-foreground">Total Bookings</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-neutral-200 dark:border-neutral-700">
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.attendanceRate}%</p>
                          <p className="text-sm text-muted-foreground">Attendance Rate</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-neutral-200 dark:border-neutral-700">
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-lg font-bold text-neutral-900 dark:text-white truncate" title={stats.mostPlayedSport}>
                            {stats.mostPlayedSport}
                          </p>
                          <p className="text-sm text-muted-foreground">Most Played</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-neutral-200 dark:border-neutral-700">
                        <CardContent className="p-4 text-center">
                          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <p className="text-sm font-bold text-neutral-900 dark:text-white">
                            {stats.lastActivity ? format(stats.lastActivity, 'MMM dd') : 'No activity'}
                          </p>
                          <p className="text-sm text-muted-foreground">Last Activity</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Activity History */}
                    <Card className="border border-neutral-200 dark:border-neutral-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                          Booking History ({totalCount})
                        </CardTitle>
                        {totalCount > 0 && (
                            <Button
                              onClick={exportToCSV}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                            >
                              <Download className="w-4 h-4" />
                              Export CSV
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {totalCount === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
                              <Activity className="h-8 w-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                              No Activity Found
                            </h3>
                            <p className="text-muted-foreground max-w-sm leading-relaxed">
                              This user hasn&apos;t made any bookings yet. Activity will appear here once they start booking sports.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sport</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Check-in</TableHead>
                                    <TableHead>Check-out</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {userActivities.map((activity) => (
                                    <TableRow key={activity.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                            <Trophy className="w-4 h-4 text-white" />
                                          </div>
                                          <span className="font-medium">{activity.sport_name}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-muted-foreground" />
                                          {format(new Date(activity.booking_date), 'MMM dd, yyyy')}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4 text-muted-foreground" />
                                          {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="w-4 h-4 text-muted-foreground" />
                                          {activity.seat_number || 'N/A'}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {getStatusBadge(activity.status)}
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                          {activity.checked_in_at 
                                            ? format(new Date(activity.checked_in_at), 'MMM dd, h:mm a')
                                            : 'Not checked in'
                                          }
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                          {activity.checked_out_at 
                                            ? format(new Date(activity.checked_out_at), 'MMM dd, h:mm a')
                                            : 'Not checked out'
                                          }
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                            
                            {/* Page info and Pagination */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                              {/* Page information */}
                              <div className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                              </div>
                              
                              {/* Pagination */}
                              {Math.ceil(totalCount / pageSize) > 1 && (
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                      />
                                    </PaginationItem>
                                    
                                    {(() => {
                                      const totalPages = Math.ceil(totalCount / pageSize)
                                      const pages = []
                                      
                                      // Always show first page
                                      if (totalPages > 0) {
                                        pages.push(
                                          <PaginationItem key={1}>
                                            <PaginationLink
                                              onClick={() => handlePageChange(1)}
                                              isActive={currentPage === 1}
                                              className="cursor-pointer"
                                            >
                                              1
                                            </PaginationLink>
                                          </PaginationItem>
                                        )
                                      }
                                      
                                      // Show ellipsis if needed
                                      if (currentPage > 3) {
                                        pages.push(
                                          <PaginationItem key="ellipsis1">
                                            <PaginationEllipsis />
                                          </PaginationItem>
                                        )
                                      }
                                      
                                      // Show pages around current page
                                      const start = Math.max(2, currentPage - 1)
                                      const end = Math.min(totalPages - 1, currentPage + 1)
                                      
                                      for (let i = start; i <= end; i++) {
                                        if (i !== 1 && i !== totalPages) {
                                          pages.push(
                                            <PaginationItem key={i}>
                                              <PaginationLink
                                                onClick={() => handlePageChange(i)}
                                                isActive={currentPage === i}
                                                className="cursor-pointer"
                                              >
                                                {i}
                                              </PaginationLink>
                                            </PaginationItem>
                                          )
                                        }
                                      }
                                      
                                      // Show ellipsis if needed
                                      if (currentPage < totalPages - 2) {
                                        pages.push(
                                          <PaginationItem key="ellipsis2">
                                            <PaginationEllipsis />
                                          </PaginationItem>
                                        )
                                      }
                                      
                                      // Always show last page if more than 1 page
                                      if (totalPages > 1) {
                                        pages.push(
                                          <PaginationItem key={totalPages}>
                                            <PaginationLink
                                              onClick={() => handlePageChange(totalPages)}
                                              isActive={currentPage === totalPages}
                                              className="cursor-pointer"
                                            >
                                              {totalPages}
                                            </PaginationLink>
                                          </PaginationItem>
                                        )
                                      }
                                      
                                      return pages
                                    })()}
                                    
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => currentPage < Math.ceil(totalCount / pageSize) && handlePageChange(currentPage + 1)}
                                        className={currentPage >= Math.ceil(totalCount / pageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-800 dark:to-cyan-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <ActivitySquare className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      No User Selected
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm sm:text-base leading-relaxed">
                      Search for a user using their name, PRN, or email to view their activity history and analytics.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
