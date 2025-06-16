'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, User, Hash, CheckCircle2, XCircle, Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface BookingDetailsModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking: any
  isOpen: boolean
  onClose: () => void
}

export default function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const [copied, setCopied] = useState(false)

  // Helper function to get user name with multiple fallback paths
  const getUserName = () => {
    return `${booking.profiles?.first_name || ''} ${booking.profiles?.last_name || ''}`.trim() || 'N/A'
  }

  // Helper function to get user email with multiple fallback paths
  const getUserEmail = () => {
    return booking.profiles?.email || 'N/A'
  }

  // Helper function to get user phone with multiple fallback paths
  const getUserPhone = () => {
    return booking.profiles?.phone_number || null
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy • h:mm a')
    } catch (error) {
      console.error("Error:", error);
      return timestamp
    }
  }

  const formatTime12hr = (time24: string) => {
    if (!time24) return ''
    const [hour, minute] = time24.split(':')
    const date = new Date()
    date.setHours(Number(hour), Number(minute))
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'booked': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700', 
        icon: Clock 
      },
      'checked-in': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700', 
        icon: CheckCircle2 
      },
      'checked-out': { 
        color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700', 
        icon: XCircle 
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.booked
    const IconComponent = config.icon
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1 border`}>
        <IconComponent className="h-3 w-3" />
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="pr-5">
          <div className="flex items-center justify-between">
            <DialogTitle>Booking Details</DialogTitle>
            {getStatusBadge(booking.status)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">User</label>
              <p className="text-foreground">{getUserName()}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Sport</label>
              <p className="text-foreground">{booking.sports?.name}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Date</label>
              <p className="text-foreground">{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Time</label>
              <p className="text-foreground">
                {formatTime12hr(booking.slots?.start_time)} - {formatTime12hr(booking.slots?.end_time)}
              </p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Spot #</label>
              <p className="text-foreground">#{booking.seat_number}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">PRN/ID</label>
              <p className="text-foreground font-mono text-xs">{booking.profiles?.prn || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          {/* User Details */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </h4>
            <div className="text-sm space-y-1 ml-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono text-xs">{getUserEmail()}</span>
              </div>
              {getUserPhone() && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-mono text-xs">{getUserPhone()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span className="capitalize">{booking.profiles?.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{booking.profiles?.user_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="capitalize">{booking.profiles?.course || 'N/A'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline
            </h4>
            <div className="text-sm space-y-1 ml-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booked:</span>
                <span>{formatTimestamp(booking.created_at)}</span>
              </div>
              {booking.checked_in_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checked In:</span>
                  <span>{formatTimestamp(booking.checked_in_at)}</span>
                </div>
              )}
              {booking.checked_out_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checked Out:</span>
                  <span>{formatTimestamp(booking.checked_out_at)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Booking ID */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Booking ID
            </h4>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs bg-muted p-2 rounded border flex-1 break-all">
                {booking.id}
              </p>
              <Button 
                onClick={handleCopyId}
                variant="outline" 
                size="sm"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}