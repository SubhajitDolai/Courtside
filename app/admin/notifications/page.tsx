'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Plus, Clock, Edit } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import NotificationToggleButtons from './components/NotificationToggleButtons'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  is_active: boolean
  created_at: string
  created_by: string | null
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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

  const activeNotifications = notifications.filter(n => n.is_active)
  const inactiveNotifications = notifications.filter(n => !n.is_active)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-neutral-50/60 to-cyan-50/40 dark:from-slate-950/90 dark:via-neutral-950/80 dark:to-cyan-950/30">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 pt-32">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
            </div>
            <Skeleton className="h-9 sm:h-12 md:h-14 lg:h-16 w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] mx-auto mb-4 sm:mb-6" />
          </div>
          
          {/* Main Content Card */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Skeleton className="h-9 w-full sm:w-32" />
                  <Skeleton className="h-9 w-full sm:w-28" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {[...Array(1)].map((_, i) => (
                  <Card key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="flex flex-wrap gap-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-12" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-4" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Skeleton className="h-8 w-8 sm:w-12" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-neutral-50/60 to-cyan-50/40 dark:from-slate-950/90 dark:via-neutral-950/80 dark:to-cyan-950/30">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Manage
            <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 dark:from-cyan-400 dark:to-cyan-300 bg-clip-text text-transparent"> Notifications</span>
          </h1>
        </div>
        
        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Bell className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                System Notifications
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Link href="/admin/notifications/add" className="w-full sm:w-auto">
                  <Button className="w-full h-9 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Notification
                  </Button>
                </Link>
                <div className="w-full sm:w-auto">
                  <NotificationToggleButtons
                    hasActiveNotifications={activeNotifications.length > 0}
                    hasInactiveNotifications={inactiveNotifications.length > 0}
                    onRefresh={fetchNotifications}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
              <Bell className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No notifications found</h3>
            <p className="text-muted-foreground">Start by creating your first notification using the button above.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-md transition-shadow bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50">
              <CardHeader>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <CardTitle className="text-lg break-words">{notification.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        <Badge variant={notification.is_active ? "default" : "secondary"}>
                          {notification.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/admin/notifications/edit/${notification.id}`}>
                      <Button variant="outline" size="sm" className="bg-white/50 dark:bg-neutral-800/50">
                        <Edit className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 break-words">
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          ))
        )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
