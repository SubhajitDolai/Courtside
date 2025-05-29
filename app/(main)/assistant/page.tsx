import { AiAssistant } from './components/AiAssistant'
import { createClient } from '@/utils/supabase/server'

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

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Get only today's booking counts per slot (not full booking details)
    const { data: todayBookingCounts } = await supabase
      .from('bookings')
      .select('slot_id, sport_id, status')
      .eq('booking_date', today)
      .in('status', ['booked', 'checked-in'])

    // Get current user info (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()
    let currentUserProfile = null

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, gender')
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
      lastUpdated: new Date().toISOString()
    }
  }
}

export default async function AssistantPage() {
  const assistantData = await getAssistantData()

  return (
    <div className="h-screen flex flex-col bg-[#fbfbfa] dark:bg-[#191919]">
      {/* Spacer for glassmorphic navbar */}
      <div className="h-23 md:h-23 flex-shrink-0" />

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <AiAssistant initialData={assistantData} />
      </div>
    </div>
  )
}