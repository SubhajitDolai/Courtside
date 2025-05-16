'use client'

import dynamic from 'next/dynamic'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// ✅ Lazy-load sports with skeleton loading effect
const SportsShell = dynamic(() => import('./sports-shell'), {
  ssr: false,
  loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-3/4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Skeleton className="w-full h-48 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
  ),
})

export default function SportsClientPage({ sports }: { sports: any[] }) {
  return <SportsShell initialSports={sports} />
}