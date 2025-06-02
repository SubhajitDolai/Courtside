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
        <Card key={i} className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>
              <Skeleton className="h-6 w-3/4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="w-full h-48 rounded-lg" />
            <Skeleton className="h-11 w-full rounded-md" />
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