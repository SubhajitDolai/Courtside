'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

import {
  Camera,
  QrCode,
  XCircle,
  Loader2,
  Clock,
  Zap,
  AlertCircle,
  RotateCcw,
  FlashlightOff,
  Flashlight,
  SwitchCamera
} from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useRouter } from 'next/navigation'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

// Types matching the booking structure
interface Profile {
  first_name: string;
  last_name: string;
  prn: string;
  gender: string;
  user_type: string;
}

interface Sport {
  name: string;
}

interface Slot {
  start_time: string;
  end_time: string;
}

interface Booking {
  id: string;
  booking_date: string;
  status: string;
  created_at: string;
  seat_number: number;
  checked_in_at: string | null;
  checked_out_at: string | null;
  profiles: Profile;
  sports: Sport;
  slots: Slot;
}

export default function CameraScannerPage() {
  const router = useRouter()
  const supabase = createClient()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scannerStatus, setScannerStatus] = useState<'initializing' | 'scanning' | 'error'>('initializing')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [scanHistory, setScanHistory] = useState<{ id: string, action: string, timestamp: Date, user: string }[]>([])
  const [totalScans, setTotalScans] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState<'success' | 'error'>('success')
  const [showFullscreenPopup, setShowFullscreenPopup] = useState(false)
  const [fullscreenMessage, setFullscreenMessage] = useState('')
  const [fullscreenType, setFullscreenType] = useState<'success' | 'error'>('success')
  const { start } = useGlobalLoadingBar()

  // Timeout constants for consistency and better UX
  // Shorter delays = faster retry for critical errors
  // Longer delays = better user feedback and spam prevention
  const TIMEOUTS = {
    DOM_INIT: 100,           // DOM initialization delays
    SYSTEM_ERROR: 1000,      // Database/system errors (fast retry)
    USER_ERROR: 1500,        // User validation errors (medium delay)
    DATA_ERROR: 2000,        // QR/data validation errors (prevent spam)
    UI_ANIMATION: 3000       // UI animations and popups
  } as const

  // Helper function to show popup message
  const showPopupMessage = useCallback((message: string, type: 'success' | 'error') => {
    // Show small popup
    setPopupMessage(message)
    setPopupType(type)
    setShowPopup(true)

    // Show fullscreen popup
    setFullscreenMessage(message)
    setFullscreenType(type)
    setShowFullscreenPopup(true)

    // Auto hide after consistent UI animation time
    setTimeout(() => {
      setShowPopup(false)
      setShowFullscreenPopup(false)
    }, TIMEOUTS.UI_ANIMATION)
  }, [TIMEOUTS.UI_ANIMATION])

  // Helper function to get current IST timestamp
  const getCurrentISTTimestamp = () => {
    return new Date().toISOString()
  }

  // Fetch recent scanner activity from database
  const fetchScannerActivity = useCallback(async () => {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id, checked_in_at, checked_out_at, status,
          profiles ( first_name, last_name )
        `)
        .or('checked_in_at.not.is.null,checked_out_at.not.is.null')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching scanner activity:', error)
        return
      }

      if (bookings) {
        // Process bookings to create scan history entries
        const scanEntries: { id: string, action: string, timestamp: Date, user: string }[] = []
        
        bookings.forEach((booking: { 
          id: string; 
          checked_in_at: string | null; 
          checked_out_at: string | null; 
          profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[]
        }) => {
          const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles
          const userName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
          
          // Add check-in entry if exists
          if (booking.checked_in_at) {
            scanEntries.push({
              id: booking.id.slice(0, 8),
              action: 'check-in',
              timestamp: new Date(booking.checked_in_at),
              user: userName
            })
          }
          
          // Add check-out entry if exists
          if (booking.checked_out_at) {
            scanEntries.push({
              id: booking.id.slice(0, 8),
              action: 'check-out',
              timestamp: new Date(booking.checked_out_at),
              user: userName
            })
          }
        })

        // Sort by timestamp (most recent first) and take top 10
        scanEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setScanHistory(scanEntries.slice(0, 10))
        setTotalScans(scanEntries.length)
      }
    } catch (error) {
      console.error('Error processing scanner activity:', error)
    }
  }, [supabase])

  // Get available cameras
  const getAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setCameras(videoDevices)
      return videoDevices
    } catch (error) {
      console.error('Error getting cameras:', error)
      return []
    }
  }, [])

  // Initialize scanner with performance optimizations
  const initializeScanner = useCallback(async () => {
    setScannerStatus('initializing')

    // Clear any existing scanner instance and DOM content
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
        scannerRef.current = null
      } catch (error) {
        console.error('Error clearing previous scanner:', error)
      }
    }

    // Clear the DOM element completely to prevent duplicate renders
    const qrReaderElement = document.getElementById("qr-reader")
    if (qrReaderElement) {
      qrReaderElement.innerHTML = ''
    }

    // Small delay to ensure DOM is cleared
    await new Promise(resolve => setTimeout(resolve, TIMEOUTS.DOM_INIT))

    try {
      const availableCameras = await getAvailableCameras()

      // Prefer back camera for better QR code scanning
      const preferredCamera = availableCameras.find(camera =>
        camera.label.toLowerCase().includes('back') ||
        camera.label.toLowerCase().includes('rear')
      ) || availableCameras[currentCameraIndex] || availableCameras[0]

      const config = {
        fps: 10, // Reduced FPS for better performance
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          deviceId: preferredCamera?.deviceId,
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Only QR codes for better performance
      }

      scannerRef.current = new Html5QrcodeScanner("qr-reader", config, false)

      scannerRef.current.render(
        (decodedText) => handleScanSuccess(decodedText),
        (error) => {
          // Only log actual errors, not routine scan attempts
          // Common expected errors that should be ignored
          const ignoredErrors = [
            'NotFoundException',
            'No QR code found',
            'QR code parse error',
            'Unable to detect a square in provided image'
          ]

          const shouldIgnore = ignoredErrors.some(ignoredError =>
            error.toString().includes(ignoredError)
          )

          if (!shouldIgnore) {
            console.error('QR Scanner error:', error)
          }
        }
      )

      setScanning(true)
      setScannerStatus('scanning')
      setError(null)
    } catch (error) {
      console.error('Failed to initialize scanner:', error)
      setScannerStatus('error')
      setError('Failed to initialize camera. Please check permissions.')
      toast.error('Camera initialization failed')
    }
  }, [currentCameraIndex, getAvailableCameras, TIMEOUTS.DOM_INIT])

  // Helper function to check if slot is over
  const isSlotOver = useCallback((booking: Booking) => {
    const now = new Date()
    const [eh, em] = (booking.slots?.end_time || '00:00').split(':').map(Number)
    const slotEnd = new Date()
    slotEnd.setHours(eh, em, 0, 0)
    return now > slotEnd
  }, [])

  // Stop camera function
  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear()
        scannerRef.current = null
      }

      // Clear the DOM element
      const qrReaderElement = document.getElementById("qr-reader")
      if (qrReaderElement) {
        qrReaderElement.innerHTML = ''
      }

      setScanning(false)
      setScannerStatus('initializing')
      setError(null)
      toast.success('Camera stopped')
    } catch (error) {
      console.error('Error stopping camera:', error)
      toast.error('Failed to stop camera')
    }
  }, [])

  // Direct status update function with forward-only transitions
  const handleStatusUpdateDirect = useCallback(async (booking: Booking, action: 'check-in' | 'check-out') => {
    console.log('🚀 Starting status update for booking:', {
      id: booking.id,
      action,
      currentStatus: booking.status,
      user: `${booking.profiles.first_name} ${booking.profiles.last_name}`
    })

    const userName = `${booking.profiles.first_name} ${booking.profiles.last_name}`.trim()
    const slotOver = isSlotOver(booking)
    const now = getCurrentISTTimestamp()

    // Check edge cases and restrictions - only apply time validation for check-in
    if (slotOver && action === 'check-in') {
      console.log('❌ Slot is over, check-in not allowed')
      const errorMsg = `Check-in period has ended for this slot.`
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
      return
    }

    // Validate forward-only status transitions
    let newStatus: string = booking.status
    let updateData: {
      status: string;
      checked_in_at?: string | null;
      checked_out_at?: string | null;
    } = { status: booking.status }
    let successMessage: string = ''

    try {
      if (action === 'check-in') {
        if (booking.status === 'booked') {
          // Forward transition: booked → checked-in
          newStatus = 'checked-in'
          updateData = {
            status: newStatus,
            checked_in_at: now
          }
          successMessage = `${userName} checked in!`
          console.log('✅ Check-in: booked → checked-in')
        } else if (booking.status === 'checked-in') {
          console.log('⚠️ Already checked in')
          const errorMsg = `${userName} already here!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        } else if (booking.status === 'checked-out') {
          console.log('⚠️ Already checked out')
          const errorMsg = `${userName} already left!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        } else {
          console.log('❌ Invalid status for check-in:', booking.status)
          const errorMsg = `Can't check in. Need admin help.`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        }
      } else if (action === 'check-out') {
        if (booking.status === 'checked-in') {
          // Forward transition: checked-in → checked-out
          newStatus = 'checked-out'
          updateData = {
            status: newStatus,
            checked_out_at: now
          }
          successMessage = `${userName} checked out!`
          console.log('✅ Check-out: checked-in → checked-out')
        } else if (booking.status === 'booked') {
          console.log('⚠️ Not checked in yet')
          const errorMsg = `${userName} needs to check in first!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        } else if (booking.status === 'checked-out') {
          console.log('⚠️ Already checked out')
          const errorMsg = `${userName} already left!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        } else {
          console.log('❌ Invalid status for check-out:', booking.status)
          const errorMsg = `Can't check out. Need admin help.`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        }
      }

      console.log('📋 Final update data:', {
        bookingId: booking.id,
        currentStatus: booking.status,
        newStatus,
        updateData,
        action
      })

      console.log('💾 Executing database update...')
      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id)

      console.log('📊 Database update result:', {
        success: !error,
        error: error?.message || null,
        details: error || 'Update successful'
      })

      if (!error) {
        console.log('✅ Database update successful!')

        console.log('📜 Refreshing scan history from database...')
        // Refresh scan history from database instead of updating state directly
        await fetchScannerActivity()

        console.log('🎉 Showing success message:', successMessage)
        showPopupMessage(successMessage, 'success')

        console.log('🔄 Resetting UI state and restarting scanner...')
        setProcessing(false)

        // Restart scanner after short delay
        setTimeout(() => {
          console.log('🔄 Scanner will restart in 1.5 seconds...')
          initializeScanner()
        }, TIMEOUTS.USER_ERROR)
      } else {
        console.error('❌ Database update failed:', error)
        console.log('📝 Update error details:', {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        })
        const errorMsg = `Database error. Try again.`
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        // Restart scanner after system error
        setTimeout(() => initializeScanner(), TIMEOUTS.SYSTEM_ERROR)
      }
    } catch (error) {
      console.error('💥 Unexpected error during status update:', error)
      console.log('📝 Update error object:', error)
      const errorMsg = 'System error! Try again.'
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      // Restart scanner after system error
      setTimeout(() => initializeScanner(), TIMEOUTS.SYSTEM_ERROR)
    }
  }, [supabase, initializeScanner, isSlotOver, showPopupMessage, fetchScannerActivity, TIMEOUTS.SYSTEM_ERROR, TIMEOUTS.USER_ERROR])

  // Handle successful QR scan
  const handleScanSuccess = useCallback(async (decodedText: string) => {
    console.log('🔍 QR Scan Success - Raw text:', decodedText)

    if (processing) {
      console.log('⚠️ Already processing, ignoring scan')
      return // Prevent multiple simultaneous scans
    }

    console.log('✅ Starting scan processing...')
    setProcessing(true)
    setScanning(false)

    try {
      console.log('🛑 Stopping scanner to prevent multiple scans...')
      // Stop scanner to prevent multiple scans
      if (scannerRef.current) {
        await scannerRef.current.clear()
      }

      // Extract booking ID (handle both plain ID and URL formats)
      let bookingId = decodedText.trim()
      console.log('📋 Extracted raw booking ID:', bookingId)

      // If it's a URL, try to extract the booking ID
      if (bookingId.includes('booking_id=')) {
        console.log('🔗 Detected URL format, extracting booking ID...')
        const urlParams = new URLSearchParams(bookingId.split('?')[1])
        bookingId = urlParams.get('booking_id') || bookingId
        console.log('📋 Extracted booking ID from URL:', bookingId)
      }

      // Validate booking ID format (UUID)
      console.log('🔍 Validating booking ID format:', bookingId)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(bookingId)) {
        console.log('❌ Invalid booking ID format')
        const errorMsg = 'Invalid QR code!'
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        // Add delay before restarting scanner to prevent rapid scanning
        setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
        return
      }
      console.log('✅ Valid booking ID format')

      console.log('🗄️ Fetching booking details from database...')
      // Fetch booking details
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          id, booking_date, status, created_at, seat_number, checked_in_at, checked_out_at,
          profiles ( first_name, last_name, prn, gender, user_type ),
          sports ( name ),
          slots ( start_time, end_time )
        `)
        .eq('id', bookingId)
        .single()

      console.log('📊 Database fetch result:', { booking, error })

      if (error || !booking) {
        console.log('❌ Booking not found or database error')
        const errorMsg = 'Booking not found!'
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        // Add delay before restarting scanner to prevent rapid scanning
        setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
        return
      }

      // Cast to proper type
      const typedBooking = booking as unknown as Booking
      console.log('📋 Booking details:', {
        id: typedBooking.id,
        status: typedBooking.status,
        user: `${typedBooking.profiles.first_name} ${typedBooking.profiles.last_name}`,
        sport: typedBooking.sports.name,
        checked_in_at: typedBooking.checked_in_at,
        checked_out_at: typedBooking.checked_out_at
      })

      // Determine action based on current status with forward-only logic
      console.log('🎯 Determining action type based on status:', typedBooking.status)
      let targetAction: 'check-in' | 'check-out'

      if (typedBooking.status === 'booked') {
        console.log('➡️ Status is booked → setting action to check-in')
        targetAction = 'check-in'
      } else if (typedBooking.status === 'checked-in') {
        console.log('➡️ Status is checked-in → setting action to check-out')
        targetAction = 'check-out'
      } else {
        console.log('❌ Invalid status for automated processing:', typedBooking.status)
        const errorMsg = `Already checked out. Contact admin to override.`
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        // Add delay before restarting scanner to prevent rapid scanning
        setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
        return
      }

      console.log('🤖 Proceeding with automated status update...')

      // Automatically proceed with status update
      await handleStatusUpdateDirect(typedBooking, targetAction)

    } catch (error) {
      console.error('Error processing scan:', error)
      const errorMsg = 'Error processing QR code'
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      // Add delay before restarting scanner to prevent rapid scanning
      setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
    }
  }, [processing, supabase, initializeScanner, handleStatusUpdateDirect, showPopupMessage, TIMEOUTS.DATA_ERROR])

  // Switch camera
  const switchCamera = useCallback(() => {
    if (cameras.length > 1) {
      const nextIndex = (currentCameraIndex + 1) % cameras.length
      setCurrentCameraIndex(nextIndex)
      // Scanner will reinitialize with the new camera
      initializeScanner()
      toast.success(`Switched to camera ${nextIndex + 1}`)
    }
  }, [cameras.length, currentCameraIndex, initializeScanner])

  // Toggle flashlight (if supported)
  const toggleFlash = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean }

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn } as MediaTrackConstraintSet]
        })
        setIsFlashOn(!isFlashOn)
        toast.success(isFlashOn ? 'Flash disabled' : 'Flash enabled')
      } else {
        toast.error('Flashlight not supported on this device')
      }

      // Clean up stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Flashlight error:', error)
      toast.error('Failed to control flashlight')
    }
  }, [isFlashOn])

  // Initialize on mount and cleanup on unmount
  useEffect(() => {
    // Fetch initial scan history
    fetchScannerActivity()
    
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeScanner()
    }, TIMEOUTS.DOM_INIT)

    return () => {
      clearTimeout(timeoutId)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
      // Clear DOM element on cleanup
      const qrReaderElement = document.getElementById("qr-reader")
      if (qrReaderElement) {
        qrReaderElement.innerHTML = ''
      }
    }
  }, [fetchScannerActivity, initializeScanner, TIMEOUTS.DOM_INIT])

  const handleGoBack = () => {
    start()
    router.push('/admin/qr-scanner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div
              className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg sm:shadow-xl md:shadow-2xl"
              onClick={handleGoBack}
            >
              <Camera className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Camera
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent"> Scanner</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground">
            Scan QR codes to check users in or out
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Scanner Section */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                {/* Compact Header */}
                <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 bg-neutral-50/50 dark:bg-neutral-900/50">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">QR Scanner</h3>
                    <div className="ml-auto flex items-center gap-2">
                      {processing && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                      <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        {processing ? 'Processing...' : scanning ? 'Ready' : 'Initializing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {error ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Scanner Error</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
                      <Button onClick={initializeScanner} size="sm" className="h-8 px-3 text-xs">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Compact Scanner Container */}
                      <div className="relative">
                        <div
                          id="qr-reader"
                          className="w-full aspect-square max-w-sm mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                        />

                        {/* Camera Logo Overlay - shown when scanner is not active */}
                        {scannerStatus !== 'scanning' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                            <div className="text-center space-y-3">
                              <Camera
                                className="h-16 w-16 mx-auto text-neutral-400 dark:text-neutral-500"
                                strokeWidth={1.5}
                              />
                              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                                {scannerStatus === 'initializing' ? 'Starting Camera...' :
                                  scannerStatus === 'error' ? 'Camera Error' :
                                    'Camera Ready'}
                              </p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Compact Controls */}
                      <div className="flex justify-center gap-2">
                        {cameras.length > 1 && (
                          <Button
                            onClick={switchCamera}
                            variant="outline"
                            size="sm"
                            disabled={processing}
                            className="h-8 px-3 text-xs"
                          >
                            <SwitchCamera className="h-3 w-3 mr-1" />
                            Switch
                          </Button>
                        )}

                        <Button
                          onClick={toggleFlash}
                          variant="outline"
                          size="sm"
                          disabled={processing}
                          className={`h-8 px-3 text-xs ${isFlashOn ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : ''}`}
                        >
                          {isFlashOn ? <FlashlightOff className="h-3 w-3 mr-1" /> : <Flashlight className="h-3 w-3 mr-1" />}
                          Flash
                        </Button>

                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          size="sm"
                          disabled={processing}
                          className="h-8 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Stop
                        </Button>

                        <Button
                          onClick={initializeScanner}
                          variant="outline"
                          size="sm"
                          disabled={processing}
                          className="h-8 px-3 text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restart
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Side Panel */}
            <div className="lg:col-span-2 space-y-4">

              {/* Stats */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Stats</h3>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Scanner Activity</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{totalScans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Status</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      scanning 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                      {scanning ? 'Active' : 'Stopped'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Scans */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Recent</h3>
                  </div>
                </div>
                <div className="p-4">
                  {scanHistory.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {scanHistory.slice(0, 5).map((scan, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">{scan.user}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                              {scan.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            scan.action === 'check-in' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                            {scan.action === 'check-in' ? 'In' : 'Out'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">No scans today</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="border-b border-blue-200 dark:border-blue-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Guide</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-xs text-blue-800 dark:text-blue-200">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Hold QR code steady in frame</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Ensure good lighting</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Auto processes check-in/out</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>No confirmation needed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Clean Popup with Glowing Border */}
        {showPopup && (
          <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-500"
            onClick={() => setShowPopup(false)}
          >
            <div className={`bg-white dark:bg-neutral-900 border rounded-xl shadow-lg backdrop-blur-sm overflow-hidden ${
              popupType === 'success' 
                ? 'border-green-200 dark:border-green-800 shadow-green-500/20'
                : 'border-red-200 dark:border-red-800 shadow-red-500/20'
              }`}
              style={{
              boxShadow: `0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px ${
                popupType === 'success' 
                    ? 'rgba(34, 197, 94, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
              }, 0 0 20px ${
                popupType === 'success' 
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)'
                  }`
              }}>
              <div className="px-4 py-3 flex items-center gap-3">
                {/* Status indicator */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full animate-ping ${
                      popupType === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    <div className={`w-3 h-3 rounded-full absolute inset-0 ${
                      popupType === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {popupMessage}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {popupType === 'success' ? 'Operation completed' : 'Action failed'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />

                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        popupType === 'success' 
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        }`}
                      style={{
                        animation: `shrink ${TIMEOUTS.UI_ANIMATION}ms linear forwards`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">3s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Popup with Similar Design */}
        {showFullscreenPopup && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-500"
            onClick={() => setShowFullscreenPopup(false)}
          >
            <div
              className="mx-4 max-w-sm w-full animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-white dark:bg-neutral-900 border rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden ${
                fullscreenType === 'success' 
                  ? 'border-green-200 dark:border-green-800 shadow-green-500/30'
                  : 'border-red-200 dark:border-red-800 shadow-red-500/30'
                }`}
                style={{
                boxShadow: `0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px ${
                  fullscreenType === 'success' 
                      ? 'rgba(34, 197, 94, 0.4)'
                      : 'rgba(239, 68, 68, 0.4)'
                }, 0 0 30px ${
                  fullscreenType === 'success' 
                      ? 'rgba(34, 197, 94, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)'
                    }`
                }}>
                <div className="px-6 py-6 text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    fullscreenType === 'success' 
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                    {fullscreenType === 'success' ? (
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-6">
                    {fullscreenMessage}
                  </p>

                  {/* Progress bar */}
                  <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mx-auto">
                    <div
                      className={`h-full rounded-full ${
                        fullscreenType === 'success' 
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        }`}
                      style={{
                        animation: `shrink ${TIMEOUTS.UI_ANIMATION}ms linear forwards`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple CSS animations */}
        <style jsx>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  )
}