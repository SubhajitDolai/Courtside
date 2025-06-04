/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCount } from './user-count'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ResponsiveContainer } from 'recharts'
import { useTheme } from 'next-themes'

// Lazy load components for better initial load performance
const BookingsOverview = lazy(() => import('./bookings-overview'))
const SportsDistribution = lazy(() => import('./sports-distribution'))
const SlotUtilization = lazy(() => import('./slot-utilization'))
const BookingTrends = lazy(() => import('./booking-trends'))

interface DashboardClientProps {
  bookings: any[]
  bookingHistory: any[]
  profiles: any[]
  sports: any[]
  slots: any[]
}

const ChartFallback = () => (
  <div className="flex items-center justify-center h-full animate-pulse bg-muted/30 rounded-md">
    <span className="text-muted-foreground">Loading chart data...</span>
  </div>
)

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Chart Error</AlertTitle>
      <AlertDescription>
        There was an error loading this chart component.
        <button 
          onClick={resetErrorBoundary}
          className="ml-2 underline hover:no-underline text-sm"
        >
          Try again
        </button>
      </AlertDescription>
    </Alert>
  )
}

export default function DashboardClient({
  bookings,
  bookingHistory,
  profiles,
  sports,
  slots
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Combine current and history bookings for complete picture with memoization
  const allBookings = useMemo(() => [...bookings, ...bookingHistory], [bookings, bookingHistory])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UserCount profiles={profiles} />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Sports</CardTitle>
                <CardDescription>Active sports offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sports.filter(s => s.is_active).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of {sports.length} total sports</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Slots</CardTitle>
                <CardDescription>Available time slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{slots.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all sports</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Bookings</CardTitle>
                <CardDescription>Total reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allBookings.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Weekly booking activities</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<ChartFallback />}>
                    <BookingTrends bookings={allBookings} />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sports Distribution</CardTitle>
                <CardDescription>Bookings by sport</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<ChartFallback />}>
                    <SportsDistribution bookings={allBookings} sports={sports} />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Overview</CardTitle>
              <CardDescription>Analyze booking patterns</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<ChartFallback />}>
                  <BookingsOverview bookings={allBookings} />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slot Utilization</CardTitle>
              <CardDescription>How time slots are being utilized</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<ChartFallback />}>
                  <SlotUtilization bookings={bookings} bookingHistory={bookingHistory} slots={slots} />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>Gender distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] py-6">
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-md">
                      {/* Gender Distribution Pie Chart */}
                    <GenderDistribution profiles={profiles} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
                <CardDescription>Student vs Faculty</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] py-6">
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-md">
                      {/* User Type Distribution */}
                    <UserTypeDistribution profiles={profiles} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New registrations over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <UserGrowthChart profiles={profiles} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Simple component for Gender Distribution chart
function GenderDistribution({ profiles }: { profiles: any[] }) {
  // Count gender types
  const maleCount = profiles.filter(p => p.gender === 'male').length;
  const femaleCount = profiles.filter(p => p.gender === 'female').length;
  const otherCount = profiles.filter(p => p.gender !== 'male' && p.gender !== 'female').length;

  const data = [
    { name: 'Male', value: maleCount, color: '#2563eb' },
    { name: 'Female', value: femaleCount, color: '#db2777' },
    { name: 'Other', value: otherCount, color: '#9333ea' }
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <div className="flex-1">{entry.name}</div>
          <div>{entry.value}</div>
          <div className="text-sm text-muted-foreground">
            ({((entry.value / profiles.length) * 100).toFixed(1)}%)
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple component for User Type Distribution
function UserTypeDistribution({ profiles }: { profiles: any[] }) {
  // Count user types
  const studentCount = profiles.filter(p => p.user_type === 'student').length;
  const facultyCount = profiles.filter(p => p.user_type === 'faculty').length;
  const staffCount = profiles.filter(p => p.user_type === 'staff').length;
  const otherCount = profiles.filter(p =>
    p.user_type !== 'student' && p.user_type !== 'faculty' && p.user_type !== 'staff'
  ).length;

  const data = [
    { name: 'Student', value: studentCount, color: '#0ea5e9' },
    { name: 'Faculty', value: facultyCount, color: '#f59e0b' },
    { name: 'Staff', value: staffCount, color: '#10b981' },
    { name: 'Other', value: otherCount, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <div className="flex-1">{entry.name}</div>
          <div>{entry.value}</div>
          <div className="text-sm text-muted-foreground">
            ({((entry.value / profiles.length) * 100).toFixed(1)}%)
          </div>
        </div>
      ))}
    </div>
  );
}

// User Growth Chart
function UserGrowthChart({ profiles }: { profiles: any[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
  const [timeRange, setTimeRange] = useState('6months');
  
  // Process profile data to show growth over time
  const chartData = useMemo(() => {
    try {
      if (!profiles.length) return [];
      
      // Sort profiles by created_at date
      const sortedProfiles = [...profiles].sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      const today = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Determine start date based on selected range
      let startDate = new Date();
      if (timeRange === '6months') {
        startDate.setMonth(today.getMonth() - 6);
      } else if (timeRange === '12months') {
        startDate.setFullYear(today.getFullYear() - 1);
      } else if (timeRange === 'all') {
        // Use the first profile's date or go back 2 years, whichever is earlier
        const firstProfileDate = new Date(sortedProfiles[0]?.created_at || today);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(today.getFullYear() - 2);
        startDate = firstProfileDate < twoYearsAgo ? firstProfileDate : twoYearsAgo;
      }
      
      // Create a map of months
      const monthlyData: { [key: string]: { month: string, count: number, total: number } } = {};
      
      // Initialize months in our range
      let currentMonth = new Date(startDate);
      while (currentMonth <= today) {
        const monthKey = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
        monthlyData[monthKey] = { month: monthKey, count: 0, total: 0 };
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      // Count registrations by month
      let runningTotal = 0;
      for (const profile of sortedProfiles) {
        const creationDate = new Date(profile.created_at);
        
        // Skip profiles created before our start date
        if (creationDate < startDate) {
          runningTotal++;
          continue;
        }
        
        const monthKey = `${monthNames[creationDate.getMonth()]} ${creationDate.getFullYear()}`;
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].count++;
        }
      }
      
      // Calculate running totals
      const result = Object.values(monthlyData).map(item => {
        runningTotal += item.count;
        return {
          name: item.month,
          newUsers: item.count,
          totalUsers: runningTotal
        };
      });
      
      return result;
      
    } catch (error) {
      console.error('Error processing user growth data:', error);
      return [];
    }
  }, [profiles, timeRange]);
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No user registration data available
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-2">
        <div className="flex space-x-1 rounded-md border border-input p-1 text-xs">
          <button 
            className={`rounded px-2 py-1 ${timeRange === '6months' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
            onClick={() => setTimeRange('6months')}
          >
            6 Months
          </button>
          <button 
            className={`rounded px-2 py-1 ${timeRange === '12months' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
            onClick={() => setTimeRange('12months')}
          >
            1 Year
          </button>
          <button 
            className={`rounded px-2 py-1 ${timeRange === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: textColor }} 
              tickFormatter={(value) => value.split(' ')[0]}
            />
            <YAxis yAxisId="left" tick={{ fill: textColor }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: textColor }} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'newUsers' ? 'New Users' : 'Total Users']}
              contentStyle={{ 
                backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
                borderColor: resolvedTheme === "dark" ? "#374151" : "#e2e8f0",
                color: textColor
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="newUsers" 
              name="New Users" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="totalUsers" 
              name="Total Users" 
              stroke="#10b981"
              strokeWidth={2}
              dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: resolvedTheme === "dark" ? "#0f172a" : "#ffffff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}