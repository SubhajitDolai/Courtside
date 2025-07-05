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
import { Power, PowerOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

interface SportsToggleButtonsProps {
  hasActiveSports: boolean
  hasInactiveSports: boolean
  onRefresh: () => void
}

export default function SportsToggleButtons({ 
  hasActiveSports, 
  hasInactiveSports, 
  onRefresh 
}: SportsToggleButtonsProps) {
  const [toggling, setToggling] = useState(false)
  const supabase = createClient()

  const toggleAllSports = async (activate: boolean) => {
    setToggling(true)
    try {
      const { error } = await supabase
        .from('sports')
        .update({ is_active: activate })
        .eq('is_active', !activate) // Only update sports that need to be changed

      if (error) throw error

      toast.success(
        activate 
          ? 'All sports have been activated' 
          : 'All sports have been deactivated'
      )
      
      // Refresh sports data
      onRefresh()
    } catch (error) {
      console.error('Error toggling sports:', error)
      toast.error('Failed to update sports status')
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="flex gap-2">
      {hasInactiveSports && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={toggling}
              size="sm"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-2">Activate All</span>
              <span className="sm:hidden ml-2">Activate</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate All Sports</AlertDialogTitle>
              <AlertDialogDescription>
                This will activate all currently inactive sports and make them available for booking. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => toggleAllSports(true)}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
              >
                Activate All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {hasActiveSports && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={toggling}
              size="sm"
              variant="destructive"
              className="text-white"
            >
              {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PowerOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-2">Deactivate All</span>
              <span className="sm:hidden ml-2">Deactivate</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate All Sports</AlertDialogTitle>
              <AlertDialogDescription>
                This will deactivate all currently active sports and make them unavailable for booking. This action will prevent users from making new bookings. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => toggleAllSports(false)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
              >
                Deactivate All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
