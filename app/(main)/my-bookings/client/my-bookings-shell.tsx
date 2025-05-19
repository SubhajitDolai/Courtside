'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BannedRedirect from '@/components/banned-redirect'

const MyBookingsClient = dynamic(() => import('./client-bookings'), {
  ssr: false,
  loading: () => (
    <div className="pt-30 p-4 md:pt-30 min-h-screen bg-gradient-to-b from-muted/40 to-background">
      <Card className="max-w-6xl mx-auto shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            <Skeleton className="h-8 w-40 mx-auto" />
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-muted/30 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ),
})

export default function MyBookingsShell() {
  return (
    <>
      <BannedRedirect />
      <MyBookingsClient />
    </>
  )
}