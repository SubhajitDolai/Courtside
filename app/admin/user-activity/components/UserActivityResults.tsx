'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  User, 
  Mail, 
  Hash, 
  Calendar, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin,
  Activity,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
// import UserActivityCharts from './UserActivityCharts'

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

interface UserActivityResultsProps {
  user: Profile
  activities: BookingActivity[]
}

export default function UserActivityResults({ user, activities }: UserActivityResultsProps) {
  const stats = useMemo(() => {
    const totalBookings = activities.length
    const completedBookings = activities.filter(a => a.status === 'checked-out').length
    const checkedInBookings = activities.filter(a => a.status === 'checked-in').length
    const attendanceRate = totalBookings > 0 ? ((completedBookings + checkedInBookings) / totalBookings) * 100 : 0
    
    // Sports distribution
    const sportsCount: { [key: string]: number } = {}
    activities.forEach(activity => {
      sportsCount[activity.sport_name] = (sportsCount[activity.sport_name] || 0) + 1
    })
    
    const mostPlayedSport = Object.entries(sportsCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
    
    // Last activity
    const lastActivity = activities[0] // Already sorted by date desc
    
    return {
      totalBookings,
      completedBookings,
      attendanceRate: Math.round(attendanceRate),
      mostPlayedSport,
      lastActivity: lastActivity ? new Date(lastActivity.booking_date) : null,
      sportsCount
    }
  }, [activities])

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

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="border border-neutral-200 dark:border-neutral-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className="h-16 w-16 mx-auto sm:mx-0">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-lg font-bold">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {getDisplayName(user)}
                </h2>
                {user.role === 'admin' && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 self-center sm:self-auto">
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {user.email && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{user.email}</span>
                  </div>
                )}
                {user.prn && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">PRN: {user.prn}</span>
                  </div>
                )}
                {user.course && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{user.course}</span>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground capitalize">{user.gender}</span>
                  </div>
                )}
                {user.user_type && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground capitalize">{user.user_type}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card className="border border-neutral-200 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Booking History ({activities.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
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
                      {activities.map((activity) => (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-800 dark:to-cyan-700 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Analytics Coming Soon
            </h3>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              User activity charts and analytics will be displayed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
