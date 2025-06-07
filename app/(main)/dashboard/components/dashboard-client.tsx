/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
'use client'

import { useState, useMemo, lazy, Suspense, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserCount } from './user-count'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, Users, User, UserCheck, GraduationCap, Briefcase, HardHat, BarChart3, Clipboard, Zap, Clock, PieChart, UserIcon, UserPlus, TrendingUp } from 'lucide-react'
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
  <div className="h-full w-full animate-pulse space-y-4 p-4">
    {/* Chart header skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
        <div className="h-3 w-12 bg-muted/70 rounded animate-pulse"></div>
        <div className="h-3 w-20 bg-muted/70 rounded animate-pulse"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
      </div>
    </div>
    
    {/* Chart content skeleton */}
    <div className="flex-1 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      {/* Simulated chart elements */}
      <div className="h-full flex items-end justify-around p-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted/50 rounded-t"
            style={{
              height: `${40 + Math.random() * 60}%`,
              width: '12%',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
      
      {/* Loading indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
          <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
          Loading chart...
        </div>
      </div>
    </div>
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
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Combine current and history bookings for complete picture with memoization
  const allBookings = useMemo(() => [...bookings, ...bookingHistory], [bookings, bookingHistory])

  // Handle initial load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`space-y-6 transition-opacity duration-500 ease-out ${
      isInitialLoad ? 'opacity-0' : 'opacity-100'
    }`}>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-lg mx-auto bg-muted/50 p-1 rounded-lg transition-all duration-300 hover:bg-muted/70">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <BarChart3 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="bookings" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Clipboard className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Users className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 fade-in-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                component: <UserCount profiles={profiles} />,
                delay: '0ms'
              },
              {
                component: (
                  <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        Sports
                      </CardTitle>
                      <CardDescription>Active sports offerings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{sports.filter(s => s.is_active).length}</div>
                      <p className="text-xs text-muted-foreground mt-1">Out of {sports.length} total sports</p>
                    </CardContent>
                  </Card>
                ),
                delay: '100ms'
              },
              {
                component: (
                  <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Slots
                      </CardTitle>
                      <CardDescription>Available time slots</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{slots.filter(s => s.is_active).length}</div>
                      <p className="text-xs text-muted-foreground mt-1">Out of {slots.length} total slots</p>
                    </CardContent>
                  </Card>
                ),
                delay: '200ms'
              },
              {
                component: (
                  <Card className="transition-all duration-200 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Clipboard className="h-5 w-5 text-green-500" />
                        Bookings
                      </CardTitle>
                      <CardDescription>Total reservations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{allBookings.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
                    </CardContent>
                  </Card>
                ),
                delay: '300ms'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="fade-in-0"
                style={{ 
                  animationDelay: item.delay,
                  animationFillMode: 'both'
                }}
              >
                {item.component}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1 transition-all duration-200 hover:shadow-md fade-in-0" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Booking Trends
                </CardTitle>
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

            <Card className="col-span-1 transition-all duration-200 hover:shadow-md fade-in-0" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-pink-500" />
                  Sports Distribution
                </CardTitle>
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

        <TabsContent value="bookings" className="space-y-6 fade-in-soft">
          <Card className="transition-all duration-200 hover:shadow-md fade-in-0" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Bookings Overview
              </CardTitle>
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

          <Card className="transition-all duration-200 hover:shadow-md fade-in-0" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                Slot Utilization
              </CardTitle>
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

        <TabsContent value="users" className="space-y-6 fade-in-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-pink-500" />
                  User Demographics
                </CardTitle>
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

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  User Types
                </CardTitle>
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

          {/* Enhanced Full-width User Growth Chart with improved responsive layout */}
          <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-gradient-to-br from-card via-card to-muted/20 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-transparent to-muted/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-inner">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                    User Growth Analytics
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground/80">
                    Comprehensive registration trends and growth patterns over time
                  </CardDescription>
                </div>
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                    <span className="font-medium">New Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                    <span className="font-medium">Total Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                    <span className="font-medium">Growth Rate</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[700px] sm:h-[500] p-6 bg-gradient-to-br from-transparent via-muted/5 to-transparent">
              <UserGrowthChart profiles={profiles} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Enhanced Gender Distribution component
function GenderDistribution({ profiles }: { profiles: any[] }) {
  const maleCount = profiles.filter(p => p.gender === 'male').length;
  const femaleCount = profiles.filter(p => p.gender === 'female').length;
  const otherCount = profiles.filter(p => p.gender !== 'male' && p.gender !== 'female').length;

  const data = [
    { 
      name: 'Male', 
      value: maleCount, 
      color: '#3b82f6', 
      icon: User
    },
    { 
      name: 'Female', 
      value: femaleCount, 
      color: '#ec4899', 
      icon: UserCheck
    },
    { 
      name: 'Other', 
      value: otherCount, 
      color: '#8b5cf6', 
      icon: Users
    }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No gender data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry, index) => {
        const percentage = ((entry.value / profiles.length) * 100).toFixed(1);
        const IconComponent = entry.icon;
        return (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" style={{ color: entry.color }} />
                <span className="font-medium">{entry.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.value}</div>
                <div className="text-xs text-muted-foreground">{percentage}%</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                style={{ 
                  backgroundColor: entry.color,
                  width: `${percentage}%` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Enhanced User Type Distribution component
function UserTypeDistribution({ profiles }: { profiles: any[] }) {
  const studentCount = profiles.filter(p => p.user_type === 'student').length;
  const facultyCount = profiles.filter(p => p.user_type === 'faculty').length;
  const staffCount = profiles.filter(p => p.user_type === 'staff').length;
  const otherCount = profiles.filter(p =>
    p.user_type !== 'student' && p.user_type !== 'faculty' && p.user_type !== 'staff'
  ).length;

  const data = [
    { name: 'Student', value: studentCount, color: '#0ea5e9', icon: GraduationCap },
    { name: 'Faculty', value: facultyCount, color: '#f59e0b', icon: Briefcase },
    { name: 'Staff', value: staffCount, color: '#10b981', icon: HardHat },
    { name: 'Other', value: otherCount, color: '#6b7280', icon: User }
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No user type data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((entry, index) => {
        const percentage = ((entry.value / profiles.length) * 100).toFixed(1);
        const IconComponent = entry.icon;
        return (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" style={{ color: entry.color }} />
                <span className="font-medium">{entry.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{entry.value}</div>
                <div className="text-xs text-muted-foreground">{percentage}%</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                style={{ 
                  backgroundColor: entry.color,
                  width: `${percentage}%` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Enhanced User Growth Chart with improved analytics and visualizations
function UserGrowthChart({ profiles }: { profiles: any[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
  const [timeRange, setTimeRange] = useState('6months');
  const [showCumulative, setShowCumulative] = useState(true);
  
  // Enhanced data processing with better analytics
  const { chartData, stats } = useMemo(() => {
    try {
      if (!profiles.length) return { chartData: [], stats: null };
      
      // Sort profiles by created_at date
      const sortedProfiles = [...profiles].sort((a, b) => {
        const dateA = new Date(a.created_at || a.created || new Date());
        const dateB = new Date(b.created_at || b.created || new Date());
        return dateA.getTime() - dateB.getTime();
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
        const firstProfileDate = new Date(sortedProfiles[0]?.created_at || sortedProfiles[0]?.created || today);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(today.getFullYear() - 2);
        startDate = firstProfileDate < twoYearsAgo ? firstProfileDate : twoYearsAgo;
      }
      
      // Create monthly data structure
      const monthlyData: { [key: string]: { month: string, count: number, total: number, date: Date } } = {};
      
      // Initialize months in our range
      let currentMonth = new Date(startDate);
      while (currentMonth <= today) {
        const monthKey = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
        monthlyData[monthKey] = { 
          month: monthKey, 
          count: 0, 
          total: 0, 
          date: new Date(currentMonth) 
        };
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      // Count registrations by month
      let runningTotal = 0;
      for (const profile of sortedProfiles) {
        const creationDate = new Date(profile.created_at || profile.created || new Date());
        
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
      
      // Calculate running totals and growth rates
      const result = Object.values(monthlyData)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((item, index, array) => {
          runningTotal += item.count;
          const prevMonth = index > 0 ? array[index - 1] : null;
          const growthRate = prevMonth && prevMonth.count > 0 
            ? ((item.count - prevMonth.count) / prevMonth.count) * 100 
            : 0;
          
          return {
            name: item.month,
            shortName: item.month.split(' ')[0],
            newUsers: item.count,
            totalUsers: runningTotal,
            growthRate: Math.round(growthRate * 10) / 10,
            month: item.date.getMonth(),
            year: item.date.getFullYear()
          };
        });
      
      // Calculate statistics
      const totalNew = result.reduce((sum, item) => sum + item.newUsers, 0);
      const avgPerMonth = totalNew / Math.max(result.length, 1);
      const lastMonth = result[result.length - 1];
      const prevMonth = result[result.length - 2];
      const currentGrowth = lastMonth && prevMonth ? 
        ((lastMonth.newUsers - prevMonth.newUsers) / Math.max(prevMonth.newUsers, 1)) * 100 : 0;
      
      const maxNewUsers = Math.max(...result.map(item => item.newUsers));
      const peakMonth = result.find(item => item.newUsers === maxNewUsers);
      
      const calculatedStats = {
        totalNewUsers: totalNew,
        averagePerMonth: Math.round(avgPerMonth * 10) / 10,
        currentMonthGrowth: Math.round(currentGrowth * 10) / 10,
        peakMonth: peakMonth?.name || 'N/A',
        peakCount: maxNewUsers
      };
      
      return { chartData: result, stats: calculatedStats };
      
    } catch (error) {
      console.error('Error processing user growth data:', error);
      return { chartData: [], stats: null };
    }
  }, [profiles, timeRange]);
  
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
        <div className="relative">
          <div className="rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 shadow-lg">
            <Users className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <TrendingUp className="h-3 w-3 text-white" />
          </div>
        </div>
        <div className="max-w-md space-y-3">
          <h3 className="font-bold text-xl text-muted-foreground">No Registration Data Available</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            User growth analytics and trends will appear here when user registration data becomes available. 
            This comprehensive view will show new user signups, cumulative growth, and monthly growth patterns.
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-6">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>New Users</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Total Users</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Growth Rate</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Enhanced Header with Stats - Better spacing for 500px height */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between space-y-4 xl:space-y-0 gap-6">
        {/* Stats Grid - Enhanced for larger space */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 text-sm flex-1">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
            <div className="font-bold text-lg text-blue-900 dark:text-blue-100">{stats?.totalNewUsers || 0}</div>
            <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">Total New Users</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-800/50 shadow-sm">
            <div className="font-bold text-lg text-green-900 dark:text-green-100">{stats?.averagePerMonth || 0}</div>
            <div className="text-green-600 dark:text-green-400 text-xs font-medium">Avg per Month</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm">
            <div className="font-bold text-lg text-purple-900 dark:text-purple-100">
              {stats?.currentMonthGrowth && stats.currentMonthGrowth !== 0 
                ? `${stats.currentMonthGrowth > 0 ? '+' : ''}${stats.currentMonthGrowth}%` 
                : '0%'}
            </div>
            <div className="text-purple-600 dark:text-purple-400 text-xs font-medium">Growth Rate</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50 shadow-sm">
            <div className="font-bold text-lg text-orange-900 dark:text-orange-100">{stats?.peakCount || 0}</div>
            <div className="text-orange-600 dark:text-orange-400 text-xs font-medium">Peak Month</div>
          </div>
        </div>
        
        {/* Controls - Enhanced styling */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center space-x-1 rounded-lg border border-input bg-muted/30 p-1 text-xs shadow-sm">
            <button 
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ${
                showCumulative 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setShowCumulative(true)}
            >
              Cumulative
            </button>
            <button 
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ${
                !showCumulative 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setShowCumulative(false)}
            >
              Monthly
            </button>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-1 rounded-lg border border-input bg-muted/30 p-1 text-xs shadow-sm">
            <button 
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ${
                timeRange === '6months' 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTimeRange('6months')}
            >
              6M
            </button>
            <button 
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ${
                timeRange === '12months' 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTimeRange('12months')}
            >
              1Y
            </button>
            <button 
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ${
                timeRange === 'all' 
                  ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTimeRange('all')}
            >
              All
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Chart with better proportions for 500px height */}
      <div className="flex-1 min-h-0 bg-gradient-to-br from-muted/10 via-transparent to-muted/10 rounded-lg p-2 border border-muted/20">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            margin={{ top: 30, right: 40, left: 30, bottom: 30 }}
          >
            <defs>
              <linearGradient id="newUsersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="totalUsersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} 
              opacity={0.5}
            />
            
            <XAxis 
              dataKey="shortName"
              tick={{ 
                fill: textColor, 
                fontSize: 13,
                fontWeight: 500
              }}
              axisLine={{ stroke: resolvedTheme === "dark" ? "#4b5563" : "#d1d5db", strokeWidth: 1.5 }}
              tickLine={{ stroke: resolvedTheme === "dark" ? "#4b5563" : "#d1d5db", strokeWidth: 1.5 }}
              height={60}
            />
            
            <YAxis 
              yAxisId="left"
              tick={{ 
                fill: textColor, 
                fontSize: 13,
                fontWeight: 500
              }}
              axisLine={{ stroke: resolvedTheme === "dark" ? "#4b5563" : "#d1d5db", strokeWidth: 1.5 }}
              tickLine={{ stroke: resolvedTheme === "dark" ? "#4b5563" : "#d1d5db", strokeWidth: 1.5 }}
              width={60}
            />
            
            {showCumulative && (
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ 
                  fill: textColor, 
                  fontSize: 13,
                  fontWeight: 500
                }}
                axisLine={{ stroke: resolvedTheme === "dark" ? "#4b5563" : "#d1d5db", strokeWidth: 1.5 }}
                tickLine={{ stroke: resolvedTheme === "dark" ? "#4b5563" : "#d1d5db", strokeWidth: 1.5 }}
                width={60}
              />
            )}
            
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'newUsers') return [value, 'New Users'];
                if (name === 'totalUsers') return [value, 'Total Users'];
                if (name === 'growthRate') return [`${value}%`, 'Growth Rate'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.name;
                }
                return label;
              }}
              contentStyle={{ 
                backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
                borderColor: resolvedTheme === "dark" ? "#374151" : "#e2e8f0",
                color: textColor,
                borderRadius: "12px",
                boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.05)",
                border: "1px solid",
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 16px"
              }}
              cursor={{ 
                fill: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                strokeWidth: 2,
                stroke: resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
              }}
            />
            
            <Legend 
              wrapperStyle={{ 
                color: textColor,
                fontSize: "14px",
                fontWeight: 500,
                paddingTop: "20px"
              }}
            />
            
            {/* New Users Bar - Enhanced for larger space */}
            <Bar 
              yAxisId="left"
              dataKey="newUsers" 
              name="New Users" 
              fill="url(#newUsersGradient)"
              radius={[6, 6, 0, 0]} 
              barSize={showCumulative ? 25 : 35}
            />
            
            {/* Total Users Line (only when cumulative view is enabled) - Enhanced styling */}
            {showCumulative && (
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalUsers" 
                name="Total Users" 
                stroke="#10b981"
                strokeWidth={4}
                dot={{ 
                  stroke: '#10b981', 
                  strokeWidth: 3, 
                  r: 6, 
                  fill: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
                  filter: "drop-shadow(0 3px 6px rgba(16, 185, 129, 0.4))"
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#10b981', 
                  strokeWidth: 3,
                  fill: '#10b981',
                  filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))"
                }}
              />
            )}
            
            {/* Growth Rate Line (only when monthly view is enabled) - Enhanced styling */}
            {!showCumulative && (
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="growthRate" 
                name="Growth Rate %" 
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ 
                  stroke: '#f59e0b', 
                  strokeWidth: 3, 
                  r: 5, 
                  fill: resolvedTheme === "dark" ? "#0f172a" : "#ffffff"
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: '#f59e0b', 
                  strokeWidth: 2,
                  fill: '#f59e0b'
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}