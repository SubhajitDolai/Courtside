'use client'

import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BookingsOverview({ bookings }: { bookings: any[] }) {
  const { resolvedTheme } = useTheme();
  const textColor = resolvedTheme === "dark" ? "#f1f5f9" : "#1e293b";
  
  // Count bookings by status
  const booked = bookings.filter(b => b.status === 'booked').length;
  const checkedIn = bookings.filter(b => b.status === 'checked-in').length;
  const checkedOut = bookings.filter(b => b.status === 'checked-out').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  
  const data = [
    { name: 'Booked', value: booked, color: '#f59e0b' },
    { name: 'Checked In', value: checkedIn, color: '#10b981' },
    { name: 'Checked Out', value: checkedOut, color: '#6b7280' },
    { name: 'Cancelled', value: cancelled, color: '#ef4444' },
  ];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === "dark" ? "#374151" : "#e2e8f0"} />
        <XAxis type="number" tick={{ fill: textColor }} />
        <YAxis dataKey="name" type="category" tick={{ fill: textColor }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#ffffff",
            borderColor: resolvedTheme === "dark" ? "#374151" : "#e2e8f0",
            color: textColor
          }}
        />
        <Legend />
        <Bar dataKey="value" name="Bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Fix the default export for lazy loading
export default BookingsOverview;