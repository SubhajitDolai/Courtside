'use client'

import { useMemo } from 'react'
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { BarChart3, Calendar, Trophy, TrendingUp } from 'lucide-react'

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

interface UserActivityChartsProps {
  activities: BookingActivity[]
}

export default function UserActivityCharts({ activities }: UserActivityChartsProps) {
  const { resolvedTheme } = useTheme()
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b"

  const chartData = useMemo(() => {
    // Sports distribution data
    const sportsCount: { [key: string]: number } = {}
    activities.forEach(activity => {
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

    activities.forEach(activity => {
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

    activities.forEach(activity => {
      const date = new Date(activity.booking_date)
      const dayIndex = date.getDay()
      const dayName = weekdays[dayIndex === 0 ? 6 : dayIndex - 1] // Adjust Sunday to be last
      weeklyCount[dayName]++
    })

    const weeklyData = weekdays.map(day => ({ name: day.slice(0, 3), fullName: day, value: weeklyCount[day] }))

    return { sportsData, monthlyData, weeklyData }
  }, [activities])

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

  if (activities.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-neutral-200 dark:border-neutral-700">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-neutral-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-sm text-foreground/80">No data available</p>
                  <p className="text-xs text-muted-foreground/70">Charts will appear as user makes bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sports Distribution Chart */}
      <Card className="border border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Sports Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Monthly Activity Chart */}
      <Card className="border border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Monthly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Weekly Pattern Chart */}
      <Card className="border border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Weekly Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
