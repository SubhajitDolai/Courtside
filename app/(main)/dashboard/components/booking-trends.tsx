'use client'

import { useTheme } from "next-themes";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';

const VIEW_OPTIONS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BookingTrends({ bookings }: { bookings: any[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
  const [viewType, setViewType] = useState(VIEW_OPTIONS.WEEKLY);
  
  // Memoized data processing to optimize performance
  const { weeklyData, monthlyData, average } = useMemo(() => {
    try {
      // Group bookings by day of week
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const bookingsByDay: {[key: string]: number} = {};
      let totalBookings = 0;
      
      // Initialize with all days
      weekdays.forEach(day => {
        bookingsByDay[day] = 0;
      });
      
      // Month data
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const bookingsByMonth: {[key: string]: number} = {};
      
      // Initialize with current and past 5 months
      const today = new Date();
      for (let i = 0; i < 6; i++) {
        const monthIndex = (today.getMonth() - i + 12) % 12;
        const yearDiff = Math.floor(i / 12);
        const year = today.getFullYear() - yearDiff;
        const monthKey = `${monthNames[monthIndex]} ${year}`;
        bookingsByMonth[monthKey] = 0;
      }
      
      // Process bookings in a single loop
      for (const booking of bookings) {
        const dateStr = booking.booking_date || booking.created_at;
        
        if (dateStr) {
          try {
            const date = new Date(dateStr);
            if (date instanceof Date && !isNaN(date.getTime())) {
              // Update weekly data
              const day = weekdays[date.getDay()];
              bookingsByDay[day]++;
              totalBookings++;
              
              // Update monthly data
              const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
              if (bookingsByMonth[monthKey] !== undefined) {
                bookingsByMonth[monthKey]++;
              }
            }
          } catch (error) {
            console.error("Error processing booking trends data:", error);
            return { weeklyData: [], monthlyData: [], average: 0 };
          }
        }
      }
      
      // Calculate average bookings per day
      const avgBookings = weekdays.length > 0 ? totalBookings / weekdays.length : 0;
      
      // Convert to array for chart and ensure we show the days in correct order
      const weeklyData = Object.entries(bookingsByDay)
        .map(([name, value]) => ({ name, value }))
        // Reorder to start with Monday
        .sort((a, b) => {
          const aIndex = weekdays.indexOf(a.name);
          const bIndex = weekdays.indexOf(b.name);
          // Handle Sunday as the last day instead of first
          const adjustedAIndex = aIndex === 0 ? 7 : aIndex;
          const adjustedBIndex = bIndex === 0 ? 7 : bIndex;
          return adjustedAIndex - adjustedBIndex;
        });
      
      // Convert monthly data to array and sort chronologically
      const monthlyData = Object.entries(bookingsByMonth)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          // Sort chronologically
          const [aMonth, aYear] = a.name.split(' ');
          const [bMonth, bYear] = b.name.split(' ');
          const aMonthIndex = monthNames.indexOf(aMonth);
          const bMonthIndex = monthNames.indexOf(bMonth);
          
          if (aYear !== bYear) {
            return parseInt(aYear) - parseInt(bYear);
          }
          return aMonthIndex - bMonthIndex;
        });
        
      return { 
        weeklyData, 
        monthlyData,
        average: avgBookings
      };
    } catch (error) {
      console.error("Error processing booking trends data:", error);
      return { weeklyData: [], monthlyData: [], average: 0 };
    }
  }, [bookings]);
  
  // Determine which dataset to use based on selected view
  const displayData = viewType === VIEW_OPTIONS.WEEKLY ? weeklyData : monthlyData;
  
  // Enhance accessibility with descriptive labels
  const formatXAxisTick = (value: string) => {
    return viewType === VIEW_OPTIONS.WEEKLY 
      ? value.substring(0, 3) // Use 3-letter abbreviation for days
      : value;
  };
  
  if (displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 animate-in fade-in-0 duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-amber-500/10 flex items-center justify-center backdrop-blur-sm border border-muted/30 shadow-sm">
            <TrendingUp className="w-8 h-8 text-blue-500/70" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="font-medium text-sm text-foreground/80">No booking trends data available</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs leading-relaxed">Data will appear as bookings are made. Start by creating your first booking!</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col space-y-3 sm:space-y-4">
      {/* Header with view toggle and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Stats summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground hidden sm:inline">Total:</span>
            <span className="font-semibold text-foreground">
              {displayData.reduce((sum, item) => sum + item.value, 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-muted-foreground hidden sm:inline">Avg:</span>
            <span className="font-semibold text-foreground">
              {Math.round(average)}
            </span>
          </div>
        </div>
        
        {/* View toggle buttons */}
        <div className="flex space-x-1 rounded-lg border border-border bg-muted/20 p-1 text-xs sm:text-sm backdrop-blur-sm">
          <button 
            className={`rounded-md px-3 py-1.5 transition-all duration-200 font-medium relative overflow-hidden ${viewType === VIEW_OPTIONS.WEEKLY 
              ? 'bg-background text-foreground shadow-sm border border-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-[1.02]'}`}
            onClick={() => setViewType(VIEW_OPTIONS.WEEKLY)}
          >
            Weekly
            {viewType === VIEW_OPTIONS.WEEKLY && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full"></div>
            )}
          </button>
          <button 
            className={`rounded-md px-3 py-1.5 transition-all duration-200 font-medium relative overflow-hidden ${viewType === VIEW_OPTIONS.MONTHLY 
              ? 'bg-background text-foreground shadow-sm border border-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-[1.02]'}`}
            onClick={() => setViewType(VIEW_OPTIONS.MONTHLY)}
          >
            Monthly
            {viewType === VIEW_OPTIONS.MONTHLY && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>
      
      {/* Chart container with responsive sizing */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={displayData} 
            margin={{ 
              top: 10, 
              right: 10, 
              left: 0, 
              bottom: 10 
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} 
              opacity={0.6}
            />
            <XAxis 
              dataKey="name" 
              tick={{ 
                fill: textColor, 
                fontSize: 12 
              }} 
              tickFormatter={formatXAxisTick}
              axisLine={false}
              tickLine={false}
              className="text-xs sm:text-sm"
            />
            <YAxis 
              tick={{ 
                fill: textColor, 
                fontSize: 12 
              }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip 
              formatter={(value) => [`${value} bookings`, 'Count']}
              contentStyle={{ 
                backgroundColor: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
                borderColor: resolvedTheme === "dark" ? "#1e293b" : "#e2e8f0",
                color: textColor,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                borderRadius: "8px",
                border: "1px solid",
                fontSize: "12px"
              }}
              cursor={{ stroke: resolvedTheme === "dark" ? "#374151" : "#e2e8f0", strokeWidth: 1 }}
            />
            <ReferenceLine 
              y={average} 
              stroke="#f59e0b" 
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ 
                value: `Avg: ${Math.round(average)}`, 
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 11,
                fontWeight: 500
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Bookings"
              dot={{ 
                stroke: '#3b82f6', 
                strokeWidth: 2, 
                r: 4, 
                fill: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
                className: "drop-shadow-sm"
              }}
              activeDot={{ 
                r: 6, 
                stroke: '#3b82f6', 
                strokeWidth: 2, 
                fill: '#3b82f6',
                className: "drop-shadow-md"
              }}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Fix the default export for lazy loading
export default BookingTrends;