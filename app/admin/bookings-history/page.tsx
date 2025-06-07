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
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <History className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Bookings
            <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent"> History</span>
          </h1>
          
        </div>
        
        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <History className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              All Time Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Suspense fallback={
              <div className="flex justify-center items-center py-8">
                <Loader className="animate-spin text-cyan-600" />
                <span className="ml-3 text-muted-foreground">Loading filters...</span>
              </div>
            }>
              <BookingsHistoryFilters onFiltersChange={setFilters} />
            </Suspense>
            
            <Suspense fallback={
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <Loader className="animate-spin text-cyan-600 mx-auto mb-4" />
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