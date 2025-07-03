import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'
import NotificationsClient from './NotificationsClient'

export const metadata: Metadata = {
  title: 'Notifications - Courtside',
  description: 'Stay updated with the latest announcements and important information from Courtside.',
  keywords: ['notifications', 'announcements', 'updates', 'courtside'],
}

type Notification = {
  id: string
  title: string
  message: string
  type: string
  created_at: string
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  let initialNotifications: Notification[] = []
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
    } else {
      initialNotifications = data || []
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }

  return <NotificationsClient initialNotifications={initialNotifications} />
}
