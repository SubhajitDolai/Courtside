'use client'

import dynamic from 'next/dynamic'

const MyBookingsClient = dynamic(() => import('./client-bookings'), {
  ssr: false,
  loading: () => (
    <div className="text-center py-20 text-muted-foreground">
      Loading your bookings...
    </div>
  ),
})

export default function MyBookingsShell() {
  return <MyBookingsClient />
}