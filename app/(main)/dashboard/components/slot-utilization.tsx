/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useMemo, useCallback, useState } from 'react';

// Proper type definitions
interface Slot {
  id: string;
  start_time: string;
  end_time?: string;
  gender?: string;
  allowed_user_type?: string;
}

interface BookingSlot {
  start_time?: string;
  end_time?: string;
}

interface Booking {
  slots?: BookingSlot;
  slot_id?: string;
}

interface ChartDataPoint {
  name: string;
  booked: number;
  available: number;
  utilization: number;
}

export function SlotUtilization({ bookings, bookingHistory, slots }: { bookings: Booking[], bookingHistory: Booking[], slots: Slot[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
  const gridColor = resolvedTheme === "dark" ? "#374151" : "#e2e8f0";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Combine bookings with history for complete utilization picture - with safe handling for potentially large datasets
  const allBookings = useMemo(() => {
    try {
      // For large datasets, consider pagination or virtualization
      if (bookings.length + bookingHistory.length > 10000) {
        console.warn("Large dataset detected, consider server-side aggregation");
      }
      return [...bookings, ...bookingHistory];
    } catch (error) {
      console.error("Error combining bookings:", error);
      return bookings; // Fall back to just current bookings if there's an error
    }
  }, [bookings, bookingHistory]);
  
  // Memoized hour formatter with error handling
  const formatHour = useCallback((timeStr: string | undefined): string => {
    if (!timeStr) return "Unknown";
    
    try {
      const hour = parseInt(timeStr.split(':')[0], 10);
      if (isNaN(hour)) return "Unknown";
      
      return `${hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)}${hour >= 12 ? ' PM' : ' AM'}`;
    } catch (error) {
      console.error("Time formatting error:", error);
      return "Unknown";
    }
  }, []);
  
  // Highly optimized data processing with useMemo and error handling
  const data = useMemo(() => {
    try {
      // First pass - count slots by time period
      const slotMap = new Map<string, {total: number, booked: number}>();
      
      // Build time slots map without iterating multiple times
      for (const slot of slots) {
        if (!slot.start_time) continue;
        const timeKey = formatHour(slot.start_time);
        
        const existing = slotMap.get(timeKey);
        if (existing) {
          existing.total += 1;
        } else {
          slotMap.set(timeKey, { total: 1, booked: 0 });
        }
      }
      
      // Count bookings in a single pass with chunking for large datasets
      const CHUNK_SIZE = 5000;
      
      // Process in chunks if dataset is large
      if (allBookings.length > CHUNK_SIZE) {
        for (let i = 0; i < allBookings.length; i += CHUNK_SIZE) {
          const chunk = allBookings.slice(i, i + CHUNK_SIZE);
          processBookingChunk(chunk, slotMap);
        }
      } else {
        processBookingChunk(allBookings, slotMap);
      }
      
      function processBookingChunk(bookings: Booking[], slotMap: Map<string, {total: number, booked: number}>) {
        for (const booking of bookings) {
          const startTime = booking.slots?.start_time;
          if (!startTime) continue;
          
          const timeKey = formatHour(startTime);
          const timeSlot = slotMap.get(timeKey);
          if (timeSlot) {
            timeSlot.booked += 1;
          }
        }
      }
      
      // Convert map to array and calculate utilization
      return Array.from(slotMap.entries())
        .filter(([name]) => name !== "Unknown")
        .map(([name, { total, booked }]) => ({
          name,
          booked,
          available: Math.max(0, total - booked),
          utilization: total > 0 ? Math.min(100, (booked / total) * 100) : 0
        }))
        .sort((a, b) => {
          // Optimized sorting by caching values
          const aIsPM = a.name.includes('PM');
          const bIsPM = b.name.includes('PM');
          
          if (!aIsPM && bIsPM) return -1;
          if (aIsPM && !bIsPM) return 1;
          
          const aHour = parseInt(a.name.split(' ')[0], 10);
          const bHour = parseInt(b.name.split(' ')[0], 10);
          
          if (isNaN(aHour) && isNaN(bHour)) return 0;
          if (isNaN(aHour)) return 1;
          if (isNaN(bHour)) return -1;
          
          return aHour - bHour;
        });
    } catch (error) {
      console.error("Error processing slot utilization data:", error);
      return [];
    }
  }, [allBookings, slots, formatHour]);
  
  // Memoize tooltip formatter
  const tooltipFormatter = useCallback((value: number, name: string | number) => {
    if (name === 'utilization') return [`${Number(value).toFixed(1)}%`, 'Utilization'];
    return [
      value,
      typeof name === 'string'
        ? name.charAt(0).toUpperCase() + name.slice(1)
        : String(name)
    ];
  }, []);

  // Memoize tooltip style
  const tooltipContentStyle = useMemo(() => ({
    backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
    borderColor: resolvedTheme === "dark" ? "#374151" : "#e2e8f0",
    color: textColor
  }), [resolvedTheme, textColor]);
  
  // Add explicit type for the event parameter
  const handleMouseOver = useCallback((event: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No slot utilization data available
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        onMouseMove={handleMouseOver}
        onMouseLeave={handleMouseLeave}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: textColor }} />
        <YAxis yAxisId="left" orientation="left" stroke={textColor} />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
        <Tooltip 
          formatter={tooltipFormatter}
          contentStyle={tooltipContentStyle}
          cursor={{ opacity: 0.3 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
        />
        <Bar yAxisId="left" dataKey="booked" name="Booked" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`booked-${index}`} fillOpacity={activeIndex === index ? 1 : 0.8} />
          ))}
        </Bar>
        <Bar yAxisId="left" dataKey="available" name="Available" stackId="a" fill="#d1d5db" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`available-${index}`} fillOpacity={activeIndex === index ? 1 : 0.8} />
          ))}
        </Bar>
        <Bar yAxisId="right" dataKey="utilization" name="Utilization %" fill="#10b981">
          {data.map((entry, index) => (
            <Cell 
              key={`utilization-${index}`} 
              fill={entry.utilization > 85 ? '#ef4444' : (entry.utilization > 60 ? '#f59e0b' : '#10b981')}
              fillOpacity={activeIndex === index ? 1 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Fix the default export for lazy loading
export default SlotUtilization;