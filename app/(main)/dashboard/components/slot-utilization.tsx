'use client'

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3, List, Clock, Activity } from 'lucide-react';

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

export function SlotUtilization({ 
  bookings, 
  bookingHistory, 
  slots 
}: { 
  bookings: Booking[], 
  bookingHistory: Booking[], 
  slots: Slot[] 
}) {
  const { resolvedTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  
  const formatHour = (timeStr: string): string => {
    try {
      const hour = parseInt(timeStr.split(':')[0]);
      if (hour === 0) return '12 AM';
      if (hour < 12) return `${hour} AM`;
      if (hour === 12) return '12 PM';
      return `${hour - 12} PM`;
    } catch {
      return 'Unknown';
    }
  };

  const data = useMemo(() => {
    try {
      const allBookings = [...bookings, ...bookingHistory];
      const slotCounts = new Map<string, { total: number, booked: number }>();
      
      // Count total slots by time
      slots.forEach(slot => {
        if (!slot.start_time) return;
        const timeKey = formatHour(slot.start_time);
        const existing = slotCounts.get(timeKey) || { total: 0, booked: 0 };
        slotCounts.set(timeKey, { ...existing, total: existing.total + 1 });
      });
      
      // Count booked slots
      allBookings.forEach(booking => {
        const startTime = booking.slots?.start_time;
        if (!startTime) return;
        const timeKey = formatHour(startTime);
        const existing = slotCounts.get(timeKey);
        if (existing) {
          existing.booked += 1;
        }
      });
      
      return Array.from(slotCounts.entries())
        .map(([name, { total, booked }]) => ({
          name,
          booked,
          available: Math.max(0, total - booked),
          total,
          utilization: total > 0 ? Math.round((booked / total) * 100) : 0
        }))
        .sort((a, b) => {
          const aHour = parseInt(a.name);
          const bHour = parseInt(b.name);
          const aIsPM = a.name.includes('PM');
          const bIsPM = b.name.includes('PM');
          
          if (!aIsPM && bIsPM) return -1;
          if (aIsPM && !bIsPM) return 1;
          return aHour - bHour;
        });
    } catch (error) {
      console.error('Error processing slot utilization:', error);
      return [];
    }
  }, [bookings, bookingHistory, slots]);

  const stats = useMemo(() => {
    const totalSlots = data.reduce((sum, item) => sum + item.total, 0);
    const totalBooked = data.reduce((sum, item) => sum + item.booked, 0);
    const totalAvailable = data.reduce((sum, item) => sum + item.available, 0);
    const avgUtilization = data.length > 0 
      ? Math.round(data.reduce((sum, item) => sum + item.utilization, 0) / data.length)
      : 0;
    
    const peakHour = data.reduce((peak, current) => 
      current.utilization > (peak?.utilization || 0) ? current : peak, 
      data[0]
    );

    return {
      totalSlots,
      totalBooked,
      totalAvailable,
      avgUtilization,
      peakHour: peakHour?.name || 'N/A'
    };
  }, [data]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600 dark:text-red-400';
    if (utilization >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (utilization >= 40) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getUtilizationBg = (utilization: number) => {
    if (utilization >= 80) return 'bg-red-100 dark:bg-red-900/20';
    if (utilization >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (utilization >= 40) return 'bg-blue-100 dark:bg-blue-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-2">No Utilization Data</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Start creating slots and booking them to see utilization patterns throughout the day.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium">Hourly Usage</span>
        </div>
        
        <div className="flex items-center bg-muted/50 rounded-md p-0.5">
          <Button
            variant={viewMode === 'chart' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('chart')}
            className="h-7 px-2 text-xs"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Chart
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-7 px-2 text-xs"
          >
            <List className="h-3 w-3 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Compact Inline Stats */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        <div className="bg-blue-50 dark:bg-blue-950/50 rounded p-1.5 text-center">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{stats.totalSlots}</div>
          <div className="text-[10px] text-muted-foreground">Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/50 rounded p-1.5 text-center">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">{stats.totalBooked}</div>
          <div className="text-[10px] text-muted-foreground">Booked</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-950/50 rounded p-1.5 text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stats.totalAvailable}</div>
          <div className="text-[10px] text-muted-foreground">Free</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/50 rounded p-1.5 text-center">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{stats.avgUtilization}%</div>
          <div className="text-[10px] text-muted-foreground">Avg</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/50 rounded p-1.5 text-center">
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">{stats.peakHour}</div>
          <div className="text-[10px] text-muted-foreground">Peak</div>
        </div>
      </div>

      {/* Chart or List View - Takes remaining space */}
      <div className="flex-1 min-h-0">
        {viewMode === 'chart' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#374151' : '#e2e8f0'} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: resolvedTheme === 'dark' ? '#f1f5f9' : '#1e293b', fontSize: 10 }}
              />
              <YAxis 
                tick={{ fill: resolvedTheme === 'dark' ? '#f1f5f9' : '#1e293b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [
                  name === 'utilization' ? `${value}%` : value,
                  name === 'booked' ? 'Booked' : name === 'available' ? 'Available' : 'Utilization'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Bar dataKey="booked" name="Booked" stackId="a" fill="#3b82f6" radius={[0, 0, 2, 2]} />
              <Bar dataKey="available" name="Available" stackId="a" fill="#d1d5db" radius={[2, 2, 0, 0]} />
              <Bar dataKey="utilization" name="Utilization %" fill="#10b981" radius={[2, 2, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <div className="space-y-1.5">
              {data.map((item, index) => (
                <div key={index} className={`rounded border p-2.5 transition-all duration-200 hover:shadow-sm ${getUtilizationBg(item.utilization)} border-border/30`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{item.name}</span>
                      
                      <div className="flex items-center gap-2 text-xs ml-2">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>{item.booked}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                          <span>{item.available}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`text-xs font-semibold ${getUtilizationColor(item.utilization)}`}>
                          {item.utilization}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.booked}/{item.total}
                        </div>
                      </div>
                      
                      <div className="w-12 bg-muted rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            item.utilization >= 80 ? 'bg-red-500' :
                            item.utilization >= 60 ? 'bg-yellow-500' :
                            item.utilization >= 40 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(item.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SlotUtilization;