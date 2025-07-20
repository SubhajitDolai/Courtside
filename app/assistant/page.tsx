import Link from 'next/link'
import { AiAssistant } from './components/AiAssistant'
import { createClient } from '@/utils/supabase/server'
import { ArrowLeft } from 'lucide-react'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

async function getAssistantData() {
  try {
    const supabase = await createClient()

    // Get only essential sports data
    const { data: sports } = await supabase
      .from('sports')
      .select('id, name, seat_limit, is_active')
      .eq('is_active', true)

    // Get only active slots with essential info
    const { data: slots } = await supabase
      .from('slots')
      .select('id, start_time, end_time, gender, allowed_user_type, sport_id')
      .eq('is_active', true)
      .order('start_time', { ascending: true })

    // Get active notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, title, message, type, is_active, created_at, created_by')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10) // Limit to 10 most recent notifications

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Get only today's booking counts per slot (not full booking details)
    const { data: todayBookingCounts } = await supabase
      .from('bookings')
      .select('slot_id, sport_id, status')
      .in('status', ['booked', 'checked-in'])

    // Get current user info (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()
    let currentUserProfile = null

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      currentUserProfile = profile
    }

    // Create smart data structure for AI
    const sportsWithSlots = sports?.map(sport => {
      const sportSlots = slots?.filter(slot => slot.sport_id === sport.id) || []

      return {
        id: sport.id,
        name: sport.name,
        seatLimit: sport.seat_limit,
        slots: sportSlots.map(slot => {
          const slotBookings = todayBookingCounts?.filter(b => b.slot_id === slot.id) || []
          const availableSeats = sport.seat_limit - slotBookings.length

          return {
            id: slot.id,
            startTime: slot.start_time,
            endTime: slot.end_time,
            gender: slot.gender,
            allowedUserType: slot.allowed_user_type,
            availableSeats,
            totalSeats: sport.seat_limit,
            isAvailable: availableSeats > 0,
            bookingUrl: `/sports/${sport.id}/slots/${slot.id}/seats`
          }
        }),
        totalBookingsToday: todayBookingCounts?.filter(b => b.sport_id === sport.id).length || 0
      }
    }) || []

    // Quick stats
    const facilityStats = {
      totalSports: sports?.length || 0,
      totalSlots: slots?.length || 0,
      todayBookings: todayBookingCounts?.length || 0,
      currentDate: today
    }

    return {
      sportsWithSlots,
      facilityStats,
      currentUser: currentUserProfile,
      notifications: notifications || [], // Include notifications
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error loading assistant data:', error)
    return {
      sportsWithSlots: [],
      facilityStats: {
        totalSports: 0,
        totalSlots: 0,
        todayBookings: 0,
        currentDate: new Date().toISOString().split('T')[0]
      },
      currentUser: null,
      notifications: [], // Include empty notifications array
      lastUpdated: new Date().toISOString()
    }
  }
}

export default async function AssistantPage() {
  const assistantData = await getAssistantData()

  return (
    <div className="h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#191919]">
            {/* Enhanced Sticky Navigation */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-border/10 bg-background/80 backdrop-blur-xl shadow-sm">
        <Link 
          href="/" 
          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 flex items-center justify-center transition-all duration-200 group-hover:scale-105 border border-border/20">
            <ArrowLeft className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">Courtside</span>
            <span className="text-xs text-muted-foreground/70">Back to Home</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Live Assistant</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <AiAssistant initialData={assistantData} />
      </div>
    </div>
  )
}