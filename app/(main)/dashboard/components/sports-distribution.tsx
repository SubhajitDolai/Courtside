'use client'

import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo, useState } from 'react';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SportsDistribution({ bookings, sports }: { bookings: any[], sports: any[] }) {
  const { resolvedTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  // Process sports distribution data
  const { data, totalBookings, topSport } = useMemo(() => {
    try {
      const sportCounts: { [key: string]: number } = {};
      
      // Create lookup map for sport names
      const sportNames: { [key: string]: string } = {};
      sports.forEach(sport => {
        if (sport.id) sportNames[sport.id] = sport.name || 'Unknown';
      });

      // Count bookings by sport
      bookings.forEach(booking => {
        const sportId = booking.sport_id;
        const sportName = sportId ? (sportNames[sportId] || 'Unknown') : 'Unknown';
        sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      });

      const processedData = Object.entries(sportCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const total = processedData.reduce((sum, item) => sum + item.value, 0);
      const mostPopular = processedData[0]?.name || 'N/A';

      return { 
        data: processedData, 
        totalBookings: total, 
        topSport: mostPopular 
      };
    } catch (error) {
      console.error("Error processing sports distribution data:", error);
      return { data: [], totalBookings: 0, topSport: 'N/A' };
    }
  }, [bookings, sports]);

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
    '#f97316', // Orange
    '#14b8a6'  // Teal
  ];

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalBookings > 0 ? (data.value / totalBookings) * 100 : 0;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-foreground text-sm">{data.name}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bookings:</span>
              <span className="font-semibold text-foreground">{data.value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Share:</span>
              <span className="font-semibold text-foreground">{percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle pie chart hover effects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Enhanced empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 flex items-center justify-center border border-border/50">
          <PieChartIcon className="w-8 h-8 text-blue-500/70" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium text-sm text-foreground/80">No sports data available</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">Sports distribution will appear as bookings are made</p>
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
            <span className="font-semibold text-foreground">{totalBookings}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-muted-foreground">Top:</span>
            <span className="font-semibold text-foreground truncate max-w-24 sm:max-w-none">{topSport}</span>
          </div>
        </div>
        
        {/* View toggle */}
        <div className="flex space-x-1 rounded-lg border border-border bg-muted/30 p-1">
          <button 
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              viewMode === 'chart' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setViewMode('chart')}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            Chart
          </button>
          <button 
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setViewMode('list')}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        {viewMode === 'chart' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationBegin={0}
                animationDuration={600}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke={resolvedTheme === "dark" ? "#1f2937" : "#ffffff"}
                    strokeWidth={activeIndex === index ? 3 : 1}
                    className="transition-all duration-200 hover:brightness-110 cursor-pointer"
                    style={{
                      filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' : 'none',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {/* <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
                formatter={(value) => (
                  <span className="text-foreground">{value}</span>
                )}
              /> */}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-full">
            {data.map((item, index) => {
              const percentage = totalBookings > 0 ? (item.value / totalBookings) * 100 : 0;
              return (
                <div 
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/60 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.name}</p>
                      <div className="w-20 bg-muted/50 rounded-full h-1.5 mt-1">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SportsDistribution;