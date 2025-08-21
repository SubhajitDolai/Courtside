import { createClient } from '@/utils/supabase/server'
import { checkProfile } from '@/lib/check-profile'
import DashboardClient from './components/dashboard-client'
import { Suspense } from 'react'
import DashboardSkeleton from './components/dashboard-skeleton'
import { notFound } from 'next/navigation'
import { BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  // Check profile - will redirect if needed
  await checkProfile()

  // If we get here, we have both user and profile
  try {
    const supabase = await createClient()

    // Fetch data in parallel for better performance
    const [
      bookingsResponse,
      bookingHistoryResponse,
      profilesResponse,
      sportsResponse,
      slotsResponse
    ] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, sports:sport_id(name), slots:slot_id(start_time, end_time), profiles:user_id(gender, user_type)')
        .order('created_at', { ascending: false }),

      supabase
        .from('bookings_history')
        .select('*, sports:sport_id(name), slots:slot_id(start_time, end_time), profiles:user_id(gender, user_type)')
        .order('created_at', { ascending: false }),

      supabase
        .from('profiles')
        .select('id, gender, user_type, created_at'),

      supabase
        .from('sports')
        .select('id, name, is_active'),

      supabase
        .from('slots')
        .select('id, sport_id, start_time, end_time, gender, allowed_user_type, is_active')
    ])

    // Handle potential errors
    if (bookingsResponse.error) throw new Error(`Error fetching bookings: ${bookingsResponse.error.message}`)
    if (bookingHistoryResponse.error) throw new Error(`Error fetching booking history: ${bookingHistoryResponse.error.message}`)
    if (profilesResponse.error) throw new Error(`Error fetching profiles: ${profilesResponse.error.message}`)
    if (sportsResponse.error) throw new Error(`Error fetching sports: ${sportsResponse.error.message}`)
    if (slotsResponse.error) throw new Error(`Error fetching slots: ${slotsResponse.error.message}`)

    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Analytics
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Dashboard</span>
            </h1>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardClient
              bookings={bookingsResponse.data || []}
              bookingHistory={bookingHistoryResponse.data || []}
              profiles={profilesResponse.data || []}
              sports={sportsResponse.data || []}
              slots={slotsResponse.data || []}
            />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return notFound()
  }
}