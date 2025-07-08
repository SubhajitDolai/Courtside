'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Loader, Bell, Trash2 } from 'lucide-react'
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
import Link from 'next/link'

interface FormData {
  title: string
  message: string
  type: string
  isActive: boolean
}

export default function EditNotificationPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    message: '',
    type: 'general',
    isActive: true
  })

  const fetchNotification = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', params?.id)
        .single()

      if (error) throw error

      setFormData({
        title: data.title,
        message: data.message,
        type: data.type,
        isActive: data.is_active
      })
    } catch (error) {
      console.error('Error fetching notification:', error)
      toast.error('Failed to load notification')
      router.push('/admin/notifications')
    } finally {
      setLoading(false)
    }
  }, [params?.id, router, supabase])

  useEffect(() => {
    if (params?.id) {
      fetchNotification()
    }
  }, [params?.id, fetchNotification])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          title: formData.title.trim(),
          message: formData.message.trim(),
          type: formData.type,
          is_active: formData.isActive,
        })
        .eq('id', params?.id)

      if (error) throw error

      toast.success('Notification updated successfully!')
      router.push('/admin/notifications')
    } catch (error) {
      console.error('Error updating notification:', error)
      toast.error('Failed to update notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', params?.id)

      if (error) throw error

      toast.success('Notification deleted successfully!')
      router.push('/admin/notifications')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Header Section - matches real UI with icon + title/description */}
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded" />
            <div className="flex-1">
              <Skeleton className="h-6 sm:h-7 w-40 mb-2" />
              <Skeleton className="h-4 sm:h-5 w-48" />
            </div>
          </div>

          <Card>
            <CardHeader>
              {/* Card header - matches real UI with title + delete button */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-16 rounded" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Message field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full" />
              </div>

              {/* Type field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Active status switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Skeleton className="h-10 w-full flex-1" />
                <Skeleton className="h-10 w-full flex-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Edit Notification</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Update notification details
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Notification Details</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this notification? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Yes, Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter notification title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter notification message"
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('message', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Whether this notification should be visible to users
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/admin/notifications" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Notification'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
