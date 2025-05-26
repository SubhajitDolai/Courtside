/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { useMemo, useState, useCallback, useEffect } from 'react';

export function SportsDistribution({ bookings, sports }: { bookings: any[], sports: any[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport size for responsive adjustments
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkIfMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Count bookings by sport using memoization
  const data = useMemo(() => {
    try {
      const sportCounts: {[key: string]: number} = {};
      const sportNames: {[key: string]: string} = {};
      
      // Create lookup map for sport names to avoid O(n²) complexity
      sports.forEach(sport => {
        if (sport.id) sportNames[sport.id] = sport.name || 'Unknown';
      });
      
      bookings.forEach(booking => {
        const sportId = booking.sport_id;
        const sportName = sportId ? (sportNames[sportId] || booking.sports?.name || 'Unknown') : 'Unknown';
        sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      });
      
      return Object.entries(sportCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort by most popular
    } catch (error) {
      console.error("Error processing sports distribution data:", error);
      return [];
    }
  }, [bookings, sports]);
  
  // Colors for the pie chart segments, ensuring accessibility
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);
  
  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);
  
  const renderActiveShape = useCallback((props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value
    } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  }, []);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          activeIndex={activeIndex !== null ? activeIndex : undefined}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          labelLine={!isMobile} // Hide label lines on mobile
          innerRadius={40}
          outerRadius={isMobile ? 70 : 80} // Slightly smaller on mobile
          paddingAngle={2}
          dataKey="value"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          label={({ name, percent }) => {
            // Only show labels for segments with significant percentage and not on mobile
            return !isMobile && percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : '';
          }}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              stroke={resolvedTheme === "dark" ? "#1f2937" : "#ffffff"}
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} bookings`, 'Count']}
          contentStyle={{ 
            backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
            borderColor: resolvedTheme === "dark" ? "#374151" : "#e2e8f0",
            color: textColor,
            boxShadow: resolvedTheme === "dark" 
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}
          itemStyle={{ color: resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b" }}
        />
        <Legend 
          layout="vertical" 
          verticalAlign={isMobile ? "bottom" : "middle"} 
          align={isMobile ? "center" : "right"}
          formatter={(value, entry: any) => (
            <span style={{ 
              color: textColor, 
              fontWeight: activeIndex === entry.payload.index ? 'bold' : 'normal',
              fontSize: isMobile ? '0.75rem' : 'inherit'
            }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Fix the default export for lazy loading
export default SportsDistribution;