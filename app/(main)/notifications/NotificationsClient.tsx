'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Bell, Clock, AlertCircle, Wrench, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  created_at: string
}

interface NotificationsClientProps {
  initialNotifications: Notification[]
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Set initial notifications without loading state since we have SSR data
    setNotifications(initialNotifications)
  }, [initialNotifications])

  const refreshNotifications = async () => {
    setLoading(true)
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
        toast.error('Failed to refresh notifications')
      } else {
        setNotifications(data || [])
        toast.success('Notifications refreshed!')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to refresh notifications')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5" />
      case 'maintenance':
        return <Wrench className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-neutral-50/60 to-orange-50/40 dark:from-slate-950/90 dark:via-neutral-950/80 dark:to-orange-950/30">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
            </div>
            <Skeleton className="h-9 sm:h-12 md:h-12 lg:h-15 w-72 sm:w-80 md:w-96 lg:w-[28rem] mx-auto mb-6 sm:mb-8" />
            <Skeleton className="h-8 w-32 mx-auto" />
          </div>

          {/* Notifications List */}
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="group hover:shadow-lg hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 transition-all duration-300 hover:scale-[1.01] bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <Skeleton className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-neutral-50/60 to-orange-50/40 dark:from-slate-950/90 dark:via-neutral-950/80 dark:to-orange-950/30">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6 sm:mb-8">
            Your
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent"> Notifications</span>
          </h1>
          
          <Button 
            onClick={refreshNotifications}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        {/* Notifications List */}
        <div className="grid gap-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
                <Bell className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No notifications yet</h3>
              <p className="text-muted-foreground text-center">We&apos;ll notify you when there are important updates or announcements.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="group hover:shadow-lg hover:shadow-orange-100/50 dark:hover:shadow-orange-900/20 transition-all duration-300 hover:scale-[1.01] bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-700/60 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <div className="text-orange-600 dark:text-orange-400">
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <CardTitle className="text-lg font-semibold break-words text-neutral-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                          {notification.title}
                        </CardTitle>
                        <Badge className={`${getTypeColor(notification.type)} flex-shrink-0 font-medium px-3 py-1 rounded-full text-xs shadow-sm`}>
                          {notification.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                        <span className="break-words font-medium">
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                    <p className="text-neutral-700 dark:text-neutral-300 break-words whitespace-pre-wrap leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
