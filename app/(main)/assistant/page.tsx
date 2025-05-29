import { AiAssistant } from './components/AiAssistant'
import { createClient } from '@/utils/supabase/server'

async function getAssistantData() {
  try {
    const supabase = await createClient()
    
    // Get all sports with detailed info
    const { data: sports } = await supabase
      .from('sports')
      .select('id, name, seat_limit, is_active')
      .eq('is_active', true)
    
    // Get all slots with sport details
    const { data: slots } = await supabase
      .from('slots')
      .select(`
        id, start_time, end_time, gender, allowed_user_type, is_active, sport_id,
        sports!inner(id, name, seat_limit)
      `)
      .eq('is_active', true)
      .order('start_time', { ascending: true })
    
    // Get today's bookings count
    const today = new Date().toISOString().split('T')[0]
    const { data: todayBookings } = await supabase
      .from('bookings')
      .select('id, status, slot_id')
      .eq('booking_date', today)
    
    // Create a more structured data for AI
    const sportsWithSlots = sports?.map(sport => ({
      ...sport,
      slots: slots?.filter(slot => slot.sport_id === sport.id).map(slot => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        gender: slot.gender,
        allowed_user_type: slot.allowed_user_type,
        sport_id: slot.sport_id,
        bookingUrl: `/sports/${sport.id}/slots/${slot.id}/seats`
      })) || []
    })) || []
    
    return {
      sports: sports || [],
      slots: slots || [],
      sportsWithSlots,
      todayBookings: todayBookings?.length || 0,
      availableSports: sports?.length || 0
    }
  } catch (error) {
    console.error('Error loading assistant data:', error)
    return {
      sports: [],
      slots: [],
      sportsWithSlots: [],
      todayBookings: 0,
      availableSports: 0
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