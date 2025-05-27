import { createClient } from '@/utils/supabase/server'
import { checkProfile } from '@/lib/check-profile'
import DashboardClient from './components/dashboard-client'
import { Suspense } from 'react'
import DashboardSkeleton from './components/dashboard-skeleton'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  // Check profile - will redirect if needed
  await checkProfile()
  
  // If we get here, we have both user and profile
  try {
    const supabase = await createClient()
    
    // Fetch data in parallel for better performance with appropriate limits
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
        .order('created_at', { ascending: false })
        .limit(1000),
      
      supabase
        .from('bookings_history')
        .select('*, sports:sport_id(name), slots:slot_id(start_time, end_time), profiles:user_id(gender, user_type)')
        .order('created_at', { ascending: false })
        .limit(1000),
      
      supabase
        .from('profiles')
        .select('id, gender, user_type, created_at')
        .limit(5000),
      
      supabase
        .from('sports')
        .select('id, name, is_active'),
      
      supabase
        .from('slots')
        .select('id, sport_id, start_time, end_time, gender, allowed_user_type')
    ])
    
    // Handle potential errors
    if (bookingsResponse.error) throw new Error(`Error fetching bookings: ${bookingsResponse.error.message}`)
    if (bookingHistoryResponse.error) throw new Error(`Error fetching booking history: ${bookingHistoryResponse.error.message}`)
    if (profilesResponse.error) throw new Error(`Error fetching profiles: ${profilesResponse.error.message}`)
    if (sportsResponse.error) throw new Error(`Error fetching sports: ${sportsResponse.error.message}`)
    if (slotsResponse.error) throw new Error(`Error fetching slots: ${slotsResponse.error.message}`)
      
    return (
      <div className="pt-30 p-4 md:pt-30 min-h-screen bg-muted/40">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
        
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
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return notFound()
  }
}