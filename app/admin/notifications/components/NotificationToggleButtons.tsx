'use client'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Power, PowerOff, Loader } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

interface NotificationToggleButtonsProps {
  hasActiveNotifications: boolean
  hasInactiveNotifications: boolean
  onRefresh: () => void
}

export default function NotificationToggleButtons({ 
  hasActiveNotifications, 
  hasInactiveNotifications, 
  onRefresh 
}: NotificationToggleButtonsProps) {
  const [isActivating, setIsActivating] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const supabase = createClient()

  const handleActivateAll = async () => {
    setIsActivating(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: true })
        .eq('is_active', false)

      if (error) throw error

      toast.success('All notifications activated successfully')
      onRefresh()
    } catch (error) {
      console.error('Error activating notifications:', error)
      toast.error('Failed to activate notifications')
    } finally {
      setIsActivating(false)
    }
  }

  const handleDeactivateAll = async () => {
    setIsDeactivating(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: false })
        .eq('is_active', true)

      if (error) throw error

      toast.success('All notifications deactivated successfully')
      onRefresh()
    } catch (error) {
      console.error('Error deactivating notifications:', error)
      toast.error('Failed to deactivate notifications')
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {hasInactiveNotifications && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isActivating} className="w-full sm:w-auto h-9">
              {isActivating ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Power className="w-4 h-4 mr-2" />
              )}
              Activate All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate All Notifications</AlertDialogTitle>
              <AlertDialogDescription>
                This will make all inactive notifications visible to users. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivateAll}>
                Yes, Activate All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {hasActiveNotifications && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isDeactivating} className="w-full sm:w-auto h-9">
              {isDeactivating ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <PowerOff className="w-4 h-4 mr-2" />
              )}
              Deactivate All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate All Notifications</AlertDialogTitle>
              <AlertDialogDescription>
                This will hide all active notifications from users. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivateAll}>
                Yes, Deactivate All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
