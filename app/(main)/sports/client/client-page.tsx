'use client'

import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ✅ Lazy-load sports with skeleton loading effect
const SportsShell = dynamic(() => import('./sports-shell'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="group border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-24" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Sport Image Skeleton */}
            <Skeleton className="w-full h-50 rounded-lg" />

            {/* Sport Info Skeleton */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Action Button Skeleton */}
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SportsClientPage({ sports }: { sports: any[] }) {
  return <SportsShell initialSports={sports} />
}