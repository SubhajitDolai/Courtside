'use client'

import { Suspense, useState } from 'react'
import BookingsHistoryFilters, { FilterState } from './components/BookingsHistoryFilters'
import BookingsHistoryTable from './components/BookingsHistoryTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { History, Loader } from 'lucide-react'

export default function BookingsHistoryPage() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: undefined,
    search: '',
    status: 'all',
    sport: 'all'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-green-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-green-950/20">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                  Bookings History
                </h1>
                <p className="text-muted-foreground mt-1">
                  Complete historical record of all bookings
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <History className="h-5 w-5 text-green-600 dark:text-green-500" />
              All Time Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <Loader className="animate-spin text-green-600" />
                <span className="ml-3 text-muted-foreground">Loading filters...</span>
              </div>
            }>
              <BookingsHistoryFilters onFiltersChange={setFilters} />
            </Suspense>
            
            <Suspense fallback={
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader className="animate-spin text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading bookings...</p>
                </div>
              </div>
            }>
              <BookingsHistoryTable filters={filters} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}