'use client'

import { useTheme } from "next-themes";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo, useState } from 'react';

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
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No booking trends data available
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-end mb-2">
        <div className="flex space-x-1 rounded-md border border-input p-1 text-xs">
          <button 
            className={`rounded px-2 py-1 ${viewType === VIEW_OPTIONS.WEEKLY 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted/50'}`}
            onClick={() => setViewType(VIEW_OPTIONS.WEEKLY)}
          >
            Weekly
          </button>
          <button 
            className={`rounded px-2 py-1 ${viewType === VIEW_OPTIONS.MONTHLY 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted/50'}`}
            onClick={() => setViewType(VIEW_OPTIONS.MONTHLY)}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: textColor }} 
            tickFormatter={formatXAxisTick}
          />
          <YAxis tick={{ fill: textColor }} />
          <Tooltip 
            formatter={(value) => [`${value} bookings`, 'Count']}
            contentStyle={{ 
              backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: resolvedTheme === "dark" ? "#374151" : "#e2e8f0",
              color: textColor,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
            }}
          />
          <Legend />
          <ReferenceLine 
            y={average} 
            stroke="#f59e0b" 
            strokeDasharray="3 3"
            label={{ 
              value: 'Average', 
              position: 'insideTopRight',
              fill: '#f59e0b',
              fontSize: 12
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Bookings"
            dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: resolvedTheme === "dark" ? "#0f172a" : "#ffffff" }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: resolvedTheme === "dark" ? "#0f172a" : "#ffffff" }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

// Fix the default export for lazy loading
export default BookingTrends;