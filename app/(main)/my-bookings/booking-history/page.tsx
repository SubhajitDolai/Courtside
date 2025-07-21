import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MyBookingHistoryClient from './client-page'
import { History } from 'lucide-react'

export default async function MyBookingHistoryPage() {
  const supabase = await createClient()

  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) redirect('/login')

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // Fetch initial booking history
  const { data: initialBookings, error } = await supabase
    .from('bookings_history')
    .select(`
      id, 
      booking_date, 
      status, 
      seat_number,
      created_at,
      checked_in_at,
      checked_out_at,
      sports ( name ),
      slots ( start_time, end_time )
    `)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching booking history:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
        {/* Header Section - Matching Main Page Style */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <History className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Booking
            <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> History</span>
          </h1>
          
        </div>

        <MyBookingHistoryClient 
          initialBookings={initialBookings || []} 
          userId={userData.user.id} 
        />
      </div>
    </div>
  )
}