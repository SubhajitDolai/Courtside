'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const ProfileShell = dynamic(() => import('./profile-shell'), {
  ssr: false,
  loading: () => (
    <div className="py-30 px-4 max-w-2xl mx-auto space-y-6">
      {/* Card */}
      <div className="rounded-lg border shadow-lg p-6 space-y-6 bg-background">

        {/* Header */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-1/2 mx-auto" /> {/* Title */}
          <Skeleton className="h-5 w-2/3 mx-auto" /> {/* Description */}
        </div>

        {/* Avatar & name block */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="h-28 w-28 rounded-full" /> {/* Avatar */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Skeleton className="h-6 w-3/4" /> {/* Name */}
            <Skeleton className="h-4 w-1/2" /> {/* User Type */}
            <Skeleton className="h-6 w-40" /> {/* Badge */}
          </div>
        </div>

        {/* Separator */}
        <Skeleton className="h-px w-full" />

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="space-y-2" key={i}>
              <Skeleton className="h-4 w-1/2" /> {/* Label */}
              <Skeleton className="h-6 w-full" /> {/* Value */}
            </div>
          ))}
        </div>

        {/* Footer button */}
        <div className="flex justify-center pt-2 pb-6">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  ),
})

export default function ProfileClientWrapper({ userId }: { userId: string }) {
  return <ProfileShell userId={userId} />
}