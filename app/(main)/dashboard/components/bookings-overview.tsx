'use client'

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo, useState } from 'react';
import { BarChart3, List, CheckCircle, Clock, UserCheck, Users } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BookingsOverview({ bookings }: { bookings: any[] }) {
  const { resolvedTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  // Process booking status data with enhanced analytics
  const { data, stats } = useMemo(() => {
    const booked = bookings.filter(b => b.status === 'booked').length;
    const checkedIn = bookings.filter(b => b.status === 'checked-in').length;
    const checkedOut = bookings.filter(b => b.status === 'checked-out').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    const total = bookings.length;
    const activeBookings = booked + checkedIn;
    const completedBookings = checkedOut;
    
    const chartData = [
      { 
        name: 'Booked', 
        value: booked, 
        color: '#f59e0b',
        percentage: total > 0 ? (booked / total) * 100 : 0,
        icon: Clock
      },
      { 
        name: 'Checked In', 
        value: checkedIn, 
        color: '#10b981',
        percentage: total > 0 ? (checkedIn / total) * 100 : 0,
        icon: UserCheck
      },
      { 
        name: 'Checked Out', 
        value: checkedOut, 
        color: '#6b7280',
        percentage: total > 0 ? (checkedOut / total) * 100 : 0,
        icon: CheckCircle
      },
    ];

    // Add cancelled if there are any
    if (cancelled > 0) {
      chartData.push({
        name: 'Cancelled',
        value: cancelled,
        color: '#ef4444',
        percentage: total > 0 ? (cancelled / total) * 100 : 0,
        icon: Users
      });
    }

    return {
      data: chartData,
      stats: {
        total,
        activeBookings,
        completedBookings,
        cancelled,
        completionRate: total > 0 ? (completedBookings / total) * 100 : 0
      }
    };
  }, [bookings]);

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const item = data.payload;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-foreground text-sm">{label}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Count:</span>
              <span className="font-semibold text-foreground">{data.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Share:</span>
              <span className="font-semibold text-foreground">{item.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced empty state
  if (data.every(item => item.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-green-50 dark:from-amber-950/20 dark:to-green-950/20 flex items-center justify-center border border-border/50">
          <BarChart3 className="w-8 h-8 text-amber-500/70" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium text-sm text-foreground/80">No booking data available</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">Booking status overview will appear as reservations are made</p>
        </div>
      </div>
    );
  }



  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with stats and view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Stats summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-foreground">{stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">Active:</span>
            <span className="font-semibold text-foreground">{stats.activeBookings}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-muted-foreground">Rate:</span>
            <span className="font-semibold text-foreground">{stats.completionRate.toFixed(1)}%</span>
          </div>
        </div>
        
        {/* View toggle */}
        <div className="flex space-x-1 rounded-lg border border-border bg-muted/30 p-1 transition-colors duration-200">
          <button 
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              viewMode === 'chart' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setViewMode('chart')}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Chart
          </button>
          <button 
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
              viewMode === 'list' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        {viewMode === 'chart' ? (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"}
                  opacity={0.5}
                />
                <XAxis 
                  type="number" 
                  tick={{ 
                    fill: resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b",
                    fontSize: 12
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ 
                    fill: resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b",
                    fontSize: 12
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  name="Bookings" 
                  radius={[0, 6, 6, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:brightness-110 transition-all duration-200"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-full">
            {data.map((item) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={item.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <IconComponent 
                          className="w-5 h-5" 
                          style={{ color: item.color }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 bg-muted/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${item.percentage}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">bookings</p>
                  </div>
                </div>
              );
            })}
            
            {/* Summary card */}
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-emerald-50/50 dark:from-blue-950/20 dark:to-emerald-950/20 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm text-foreground">Summary</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="font-semibold text-sm text-foreground">{stats.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fix the default export for lazy loading
export default BookingsOverview;