/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

import {
  Zap,
  QrCode,
  Loader2,
  Clock,
  AlertCircle,
  RotateCcw,
  Settings,
  Trash2,
  PowerOff,
  Power
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
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

export default function IoTScannerPage() {
  const router = useRouter()
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [scanning, setScanning] = useState(true)
  const [scannerStatus, setScannerStatus] = useState<'initializing' | 'scanning' | 'error'>('initializing')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<{ id: string, action: string, timestamp: Date, user: string }[]>([])
  const [totalScans, setTotalScans] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupType, setPopupType] = useState<'success' | 'error'>('success')
  const [showFullscreenPopup, setShowFullscreenPopup] = useState(false)
  const [fullscreenMessage, setFullscreenMessage] = useState('')
  const [fullscreenType, setFullscreenType] = useState<'success' | 'error'>('success')
  const [inputValue, setInputValue] = useState('')
  const [manuallyStopped, setManuallyStopped] = useState(false) // Track if user manually stopped
  const { start } = useGlobalLoadingBar()

  // Long-session management state
  const [sessionStartTime] = useState(() => new Date()) // Use lazy initialization
  const [isOnline, setIsOnline] = useState(true) // Initialize to true to avoid hydration mismatch
  const [failedOperations, setFailedOperations] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState({
    uptime: 0,
    scansPerHour: 0,
    lastHeartbeat: new Date(0), // Initialize with epoch to avoid hydration mismatch
    memoryUsage: 0,
    deviceRestarts: 0
  })
  const lastHeartbeatRef = useRef<NodeJS.Timeout>()
  const performanceMetricsRef = useRef({
    sessionScans: 0,
    errorCount: 0,
    restartCount: 0,
    avgScanTime: 0
  })

  /**
   * Implements exponential backoff retry logic for database operations.
   * @param operation - Async function to retry
   * @param maxRetries - Maximum number of retry attempts
   * @param baseDelay - Base delay in milliseconds for exponential backoff
   */
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>, 
    maxRetries = 3,
    baseDelay = 1000
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) throw error
        
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }, [])

  /**
   * Generates audio feedback for successful QR code scans.
   * Creates a two-tone barcode scanner sound using Web Audio API.
   */
  const playBarcodeScanSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // First tone - 1200Hz triangle wave
      const osc1 = audioContext.createOscillator()
      const gain1 = audioContext.createGain()
      osc1.connect(gain1)
      gain1.connect(audioContext.destination)

      osc1.frequency.setValueAtTime(1200, audioContext.currentTime)
      osc1.type = 'triangle'
      gain1.gain.setValueAtTime(0.8, audioContext.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)

      osc1.start(audioContext.currentTime)
      osc1.stop(audioContext.currentTime + 0.15)

      // Second tone - 800Hz triangle wave for confirmation
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)

      osc2.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
      osc2.type = 'triangle'
      gain2.gain.setValueAtTime(0.8, audioContext.currentTime + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      osc2.start(audioContext.currentTime + 0.1)
      osc2.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Audio feedback unavailable:', error)
    }
  }, [])

  /**
   * Timeout configuration for consistent UX and error handling.
   * Optimized for user feedback timing and retry logic.
   */
  const TIMEOUTS = {
    DOM_INIT: 100,           // DOM element initialization
    SYSTEM_ERROR: 1000,      // Database/network errors (fast retry)
    USER_ERROR: 1500,        // User validation errors
    DATA_ERROR: 2000,        // QR data validation (prevent spam)
    UI_ANIMATION: 3000       // UI transitions and popups
  } as const

  /**
   * Displays feedback messages with consistent UI timing.
   * Shows both inline and fullscreen popups for accessibility.
   */
  const showPopupMessage = useCallback((message: string, type: 'success' | 'error') => {
    setPopupMessage(message)
    setPopupType(type)
    setShowPopup(true)

    setFullscreenMessage(message)
    setFullscreenType(type)
    setShowFullscreenPopup(true)

    setTimeout(() => {
      setShowPopup(false)
      setShowFullscreenPopup(false)
    }, TIMEOUTS.UI_ANIMATION)
  }, [TIMEOUTS.UI_ANIMATION])

  /**
   * Returns current timestamp in ISO format for database operations.
   */
  const getCurrentISTTimestamp = () => {
    return new Date().toISOString()
  }

  /**
   * Retrieves recent scanner activity for dashboard display.
   * Fetches bookings with check-in/check-out timestamps.
   */
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

  // Initialize scanner - focus input and set up scanner state
  const initializeScanner = useCallback(async () => {
    // Don't restart if user manually stopped the scanner
    if (manuallyStopped) {
      console.log('Scanner manually stopped - not initializing')
      return
    }

    setScannerStatus('initializing')
    setError(null)

    try {
      // Focus the input field for IoT scanner
      if (inputRef.current) {
        inputRef.current.focus()
        console.log('Scanner input focused and ready')
      }

      setScanning(true)
      setScannerStatus('scanning')
      setError(null)
      console.log('Scanner initialized successfully')

    } catch (error) {
      console.error('Failed to initialize scanner:', error)
      setScannerStatus('error')
      
      let errorMessage = 'Failed to initialize scanner.'
      if (error instanceof Error) {
        errorMessage = `Scanner error: ${error.message}`
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [manuallyStopped])

  // Helper function to check if slot is over
  const isSlotOver = useCallback((booking: Booking) => {
    const now = new Date()
    const [eh, em] = (booking.slots?.end_time || '00:00').split(':').map(Number)
    const slotEnd = new Date()
    slotEnd.setHours(eh, em, 0, 0)
    return now > slotEnd
  }, [])

  // Helper function to check if check-in is too early (more than 10 minutes before start time)
  const isCheckInTooEarly = useCallback((booking: Booking) => {
    const now = new Date()
    const [sh, sm] = (booking.slots?.start_time || '00:00').split(':').map(Number)
    const slotStart = new Date()
    slotStart.setHours(sh, sm, 0, 0)
    
    // Calculate 10 minutes before slot start time
    const checkInWindowStart = new Date(slotStart.getTime() - 10 * 60 * 1000) // 10 minutes in milliseconds
    
    return now < checkInWindowStart
  }, [])

  /**
   * Converts 24-hour time format to 12-hour format with AM/PM
   */
  const formatTo12Hour = useCallback((timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
  }, [])

  /**
   * Stops scanner and resets input field.
   */
  const stopScanner = useCallback(async () => {
    try {
      // Set manually stopped flag to prevent automatic restart
      setManuallyStopped(true)
      
      // Clear input field
      if (inputRef.current) {
        inputRef.current.value = ''
        inputRef.current.blur()
      }

      setInputValue('')
      setScanning(false)
      setScannerStatus('initializing')
      setError(null)
      
      // Show success message only if page is visible
      if (document.visibilityState === 'visible') {
        toast.success('Scanner stopped')
      }
      
      console.log('Scanner manually stopped')
    } catch (error) {
      console.error('Error stopping scanner:', error)
      if (document.visibilityState === 'visible') {
        toast.error('Failed to stop scanner')
      }
    }
  }, [])

  /**
   * Handles database operations with offline support and retry logic.
   * Queues operations when offline for later synchronization.
   */
  const performDatabaseOperation = useCallback(async (bookingId: string, updateData: any) => {
    if (!isOnline) {
      setFailedOperations(prev => [...prev, { bookingId, updateData, timestamp: new Date() }])
      toast.warning('Offline - operation queued for sync')
      return { success: false, queued: true }
    }

    try {
      const result = await retryWithBackoff(async () => {
        const { error } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId)
        
        if (error) throw error
        return { success: true }
      })
      
      return result
    } catch (error) {
      console.error('Database operation failed, queuing for retry:', error)
      setFailedOperations(prev => [...prev, { bookingId, updateData, timestamp: new Date() }])
      return { success: false, queued: true }
    }
  }, [isOnline, retryWithBackoff, supabase])

  /**
   * Processes queued operations when connection is restored.
   * Retries failed database operations with exponential backoff.
   */
  const processFailedOperations = useCallback(async () => {
    if (!isOnline || failedOperations.length === 0) return

    const processedOps: any[] = []

    for (const operation of failedOperations) {
      try {
        await retryWithBackoff(async () => {
          const { error } = await supabase
            .from('bookings')
            .update(operation.updateData)
            .eq('id', operation.bookingId)
          
          if (error) throw error
        })
        
        processedOps.push(operation)
      } catch (error) {
        console.error(`Failed to sync operation: ${operation.bookingId}`, error)
      }
    }

    setFailedOperations(prev => prev.filter(op => !processedOps.includes(op)))
    if (processedOps.length > 0) {
      toast.success(`Synced ${processedOps.length} pending operations`)
    }
  }, [isOnline, failedOperations, retryWithBackoff, supabase])

  /**
   * Performs memory cleanup and garbage collection for long sessions.
   * Clears scan history and resets performance counters.
   */
  const handleMemoryCleanup = useCallback(() => {
    
    // Clear scan history except recent entries
    setScanHistory(prev => prev.slice(0, 5))
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    // Reset performance metrics
    performanceMetricsRef.current = {
      sessionScans: 0,
      errorCount: 0,
      restartCount: 0,
      avgScanTime: 0
    }
    
    toast.success('Memory optimized')
  }, [])

  /**
   * Performs periodic scanner restart for long-session stability.
   * Prevents memory leaks and maintains focus.
   */
  const handlePeriodicRestart = useCallback(async () => {
    // Don't restart if user manually stopped the scanner
    if (manuallyStopped) {
      console.log('Periodic restart skipped - scanner manually stopped')
      return
    }

    try {
      await stopScanner()
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second break
      
      // Reset the manually stopped flag for periodic restart
      setManuallyStopped(false)
      await initializeScanner()
      
      setSystemHealth(prev => ({ ...prev, deviceRestarts: prev.deviceRestarts + 1 }))
      performanceMetricsRef.current.restartCount++
      
      toast.success('System refreshed for optimal performance')
    } catch (error) {
      console.error('Periodic restart failed:', error)
      toast.error('Restart failed - manual intervention may be needed')
    }
  }, [stopScanner, initializeScanner, manuallyStopped])

  /**
   * Processes booking status updates with validation and business logic.
   * Handles check-in/check-out operations with proper state transitions.
   */
  const handleStatusUpdateDirect = useCallback(async (booking: Booking, action: 'check-in' | 'check-out') => {
    const userName = `${booking.profiles.first_name} ${booking.profiles.last_name}`.trim()
    const slotOver = isSlotOver(booking)
    const checkInTooEarly = isCheckInTooEarly(booking)
    const now = getCurrentISTTimestamp()

    // Time validation for check-in operations
    if (slotOver && action === 'check-in') {
      const errorMsg = `Check-in period has ended for this slot.`
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      setTimeout(() => {
        if (!manuallyStopped) {
          initializeScanner()
        }
      }, TIMEOUTS.USER_ERROR)
      return
    }

    // Check if check-in is attempted too early (more than 10 minutes before start time)
    if (checkInTooEarly && action === 'check-in') {
      const [sh, sm] = (booking.slots?.start_time || '00:00').split(':').map(Number)
      const startTime = `${sh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')}`
      
      // Calculate when check-in becomes available
      const checkInTime = new Date()
      checkInTime.setHours(sh, sm - 10, 0, 0) // 10 minutes before start time
      const checkInAvailable = `${checkInTime.getHours().toString().padStart(2, '0')}:${checkInTime.getMinutes().toString().padStart(2, '0')}`
      
      // Convert times to 12-hour format for user display
      const startTime12h = formatTo12Hour(startTime)
      const checkInAvailable12h = formatTo12Hour(checkInAvailable)
      
      const errorMsg = `Check-in not yet available. Please return at ${checkInAvailable12h} (10 minutes before your ${startTime12h} slot).`
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      setTimeout(() => {
        if (!manuallyStopped) {
          initializeScanner()
        }
      }, TIMEOUTS.USER_ERROR)
      return
    }

    // Validate and determine status transitions
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
        } else if (booking.status === 'checked-in') {
          const errorMsg = `${userName} already here!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => {
            if (!manuallyStopped) {
              initializeScanner()
            }
          }, TIMEOUTS.USER_ERROR)
          return
        } else if (booking.status === 'checked-out') {
          const errorMsg = `${userName} already left!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        } else {
          const errorMsg = `Can't check in. Need admin help.`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => {
            if (!manuallyStopped) {
              initializeScanner()
            }
          }, TIMEOUTS.USER_ERROR)
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
        } else if (booking.status === 'booked') {
          const errorMsg = `${userName} needs to check in first!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => {
            if (!manuallyStopped) {
              initializeScanner()
            }
          }, TIMEOUTS.USER_ERROR)
          return
        } else if (booking.status === 'checked-out') {
          const errorMsg = `${userName} already left!`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        } else {
          const errorMsg = `Can't check out. Need admin help.`
          showPopupMessage(errorMsg, 'error')
          setProcessing(false)
          setTimeout(() => initializeScanner(), TIMEOUTS.USER_ERROR)
          return
        }
      }

      const dbResult = await performDatabaseOperation(booking.id, updateData)

      if (dbResult.success || dbResult.queued) {
        // Refresh scan history from database
        await fetchScannerActivity()

        showPopupMessage(successMessage, 'success')

        setProcessing(false)

        // Restart scanner after short delay
        setTimeout(() => {
          if (!manuallyStopped) {
            initializeScanner()
          }
        }, TIMEOUTS.USER_ERROR)
      } else {
        console.error('Database update failed')
        const errorMsg = `Database error. Try again.`
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        // Restart scanner after system error
        setTimeout(() => initializeScanner(), TIMEOUTS.SYSTEM_ERROR)
      }
    } catch (error) {
      console.error('Unexpected error during status update:', error)
      const errorMsg = 'System error! Try again.'
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      setTimeout(() => initializeScanner(), TIMEOUTS.SYSTEM_ERROR)
    }
  }, [initializeScanner, isSlotOver, isCheckInTooEarly, formatTo12Hour, showPopupMessage, fetchScannerActivity, performDatabaseOperation, TIMEOUTS.SYSTEM_ERROR, TIMEOUTS.USER_ERROR, manuallyStopped])

  /**
   * Processes successful QR code scans and initiates booking operations.
   * Handles validation, data extraction, and automated status transitions.
   */
  const handleScanSuccess = useCallback(async (decodedText: string) => {
    // Play barcode scanner sound
    playBarcodeScanSound()

    if (processing) {
      return // Prevent multiple simultaneous scans
    }

    setProcessing(true)
    setScanning(false)

    try {
      // Extract booking ID (handle both plain ID and URL formats)
      let bookingId = decodedText.trim()

      // If it's a URL, try to extract the booking ID
      if (bookingId.includes('booking_id=')) {
        const urlParams = new URLSearchParams(bookingId.split('?')[1])
        bookingId = urlParams.get('booking_id') || bookingId
      }

      // Validate booking ID format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(bookingId)) {
        const errorMsg = 'Invalid QR code!'
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
        return
      }

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

      if (error || !booking) {
        const errorMsg = 'Booking not found!'
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
        return
      }

      // Cast to proper type
      const typedBooking = booking as unknown as Booking

      // Determine action based on current status
      let targetAction: 'check-in' | 'check-out'

      if (typedBooking.status === 'booked') {
        targetAction = 'check-in'
      } else if (typedBooking.status === 'checked-in') {
        targetAction = 'check-out'
      } else {
        const errorMsg = `Already checked out. Contact admin to override.`
        showPopupMessage(errorMsg, 'error')
        setProcessing(false)
        setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
        return
      }

      // Proceed with automated status update
      await handleStatusUpdateDirect(typedBooking, targetAction)

    } catch (error) {
      console.error('Error processing scan:', error)
      const errorMsg = 'Error processing QR code'
      showPopupMessage(errorMsg, 'error')
      setProcessing(false)
      setTimeout(() => initializeScanner(), TIMEOUTS.DATA_ERROR)
    }
  }, [processing, supabase, initializeScanner, handleStatusUpdateDirect, showPopupMessage, TIMEOUTS.DATA_ERROR, playBarcodeScanSound])

  /**
   * Handles input changes from automated scanner
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // If value looks like a complete QR code (UUID), process it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (uuidRegex.test(value.trim())) {
      // Clear the input field and process the scan
      setInputValue('')
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      handleScanSuccess(value.trim())
    }
  }, [handleScanSuccess])

  /**
   * Handles key press events for manual submission
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = inputValue.trim()
      if (value) {
        setInputValue('')
        if (inputRef.current) {
          inputRef.current.value = ''
        }
        handleScanSuccess(value)
      }
    }
  }, [inputValue, handleScanSuccess])

  /**
   * Maintains focus on input field
   */
  const maintainFocus = useCallback(() => {
    if (inputRef.current && scanning && !processing && !manuallyStopped) {
      inputRef.current.focus()
    }
  }, [scanning, processing, manuallyStopped])

  // Network status monitoring
  useEffect(() => {
    // Set initial online status on client side only
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      processFailedOperations()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [processFailedOperations])

  // System health monitoring with heartbeat
  useEffect(() => {
    // Initialize lastHeartbeat on client side
    setSystemHealth(prev => ({
      ...prev,
      lastHeartbeat: new Date()
    }))
    
    const startHeartbeat = () => {
      const heartbeat = () => {
        const now = new Date()
        const uptimeHours = (now.getTime() - sessionStartTime.getTime()) / (1000 * 60 * 60)
        const scansPerHour = uptimeHours > 0 ? performanceMetricsRef.current.sessionScans / uptimeHours : 0
        
        setSystemHealth(prev => ({
          ...prev,
          uptime: Math.floor(uptimeHours * 100) / 100,
          scansPerHour: Math.floor(scansPerHour * 10) / 10,
          lastHeartbeat: now,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }))

        // Auto-restart after 4 hours of continuous operation
        if (uptimeHours > 4) {
          handlePeriodicRestart()
        }

        // Memory leak detection and cleanup
        if ((performance as any).memory?.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
          handleMemoryCleanup()
        }
      }

      heartbeat()
      lastHeartbeatRef.current = setInterval(heartbeat, 30000) // Every 30 seconds
    }

    startHeartbeat()
    
    return () => {
      if (lastHeartbeatRef.current) {
        clearInterval(lastHeartbeatRef.current)
      }
    }
  }, [sessionStartTime, handlePeriodicRestart, handleMemoryCleanup])

  // Update performance metrics on successful scans
  useEffect(() => {
    if (scanHistory.length > 0) {
      performanceMetricsRef.current.sessionScans = scanHistory.length
    }
  }, [scanHistory])

  // Maintain focus on input field
  useEffect(() => {
    const focusInterval = setInterval(maintainFocus, 1000) // Check focus every second
    
    return () => {
      clearInterval(focusInterval)
    }
  }, [maintainFocus])

  // Initialize on mount and cleanup on unmount with page leave detection
  useEffect(() => {
    // Fetch initial scan history
    fetchScannerActivity()

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeScanner()
    }, TIMEOUTS.DOM_INIT)

    // Page leave detection handlers
    const handleBeforeUnload = () => {
      stopScanner()
      // Don't show confirmation dialog, just cleanup
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopScanner()
      } else if (!manuallyStopped) {
        // Re-focus when page becomes visible, but only if not manually stopped
        setTimeout(maintainFocus, 100)
      }
    }

    const handlePageHide = () => {
      stopScanner()
    }

    const handlePopState = () => {
      stopScanner()
    }

    // Add event listeners for page leave detection
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', handlePopState)

    return () => {
      clearTimeout(timeoutId)
      
      // Remove event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [fetchScannerActivity, initializeScanner, TIMEOUTS.DOM_INIT, stopScanner, maintainFocus, manuallyStopped])

  // Next.js route change detection for SPA navigation
  const pathname = usePathname()
  useEffect(() => {
    // This effect runs when the pathname changes (Next.js route navigation)
    const currentInputRef = inputRef.current
    return () => {
      if (currentInputRef) {
        currentInputRef.blur()
        currentInputRef.value = ''
      }
    }
  }, [pathname])

  const handleGoBack = () => {
    stopScanner() // Ensure scanner is stopped before navigation
    start()
    router.push('/admin/qr-scanner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div
              className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white shadow-lg sm:shadow-xl md:shadow-2xl"
              onClick={handleGoBack}
            >
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Automated
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent"> Scanner</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground">
            Professional QR code scanning system for efficient check-in/check-out management
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
                    <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">QR Scanner</h3>
                    <div className="ml-auto flex items-center gap-2">
                      {processing && <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />}
                      <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        {processing ? 'Processing...' : scanning ? 'Active' : 'Initializing'}
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
                      <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">System Error</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
                      <Button onClick={handlePeriodicRestart} size="sm" className="h-8 px-3 text-xs">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restart System
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Scanner Input Container */}
                      <div className="relative">
                        <div className="w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border border-emerald-200/60 dark:border-emerald-700/60 shadow-sm flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20 transition-all duration-300">
                          
                          {/* Scanner Status Display - Show when scanner is actively scanning */}
                          {scanning && !manuallyStopped && scannerStatus === 'scanning' && (
                            <div className="text-center mb-6">
                              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-700">
                                <QrCode className={`h-10 w-10 text-emerald-600 dark:text-emerald-400 ${scanning && !processing ? 'animate-pulse' : ''}`} />
                              </div>
                              <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
                                {processing ? 'Processing...' : 'Scanner Ready'}
                              </h3>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
                                Position QR code in front of the scanner
                              </p>
                            </div>
                          )}

                          {/* Input Field - Show when scanner is actively scanning */}
                          {scanning && !manuallyStopped && scannerStatus === 'scanning' && (
                            <Input
                              ref={inputRef}
                              value={inputValue}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyPress}
                              placeholder="Enter Booking ID or scan QR code"
                              className="w-full text-center bg-white/80 dark:bg-neutral-800/80 border-2 border-emerald-300 dark:border-emerald-600 focus:border-emerald-400 dark:focus:border-emerald-500 rounded-xl backdrop-blur-sm animate-pulse caret-transparent"
                              disabled={processing}
                            />
                          )}

                          {/* Clean scanning animation - Show when scanner is actively scanning */}
                          {scanning && !manuallyStopped && scannerStatus === 'scanning' && (
                            <div className="mt-4 w-full">                              
                              {/* Minimal status indicator */}
                              <div className="flex justify-center items-center mt-3">
                                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  <span className="font-medium">Ready to scan</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Scanner Inactive Overlay - shown when scanner is not actively scanning */}
                        {(!scanning || manuallyStopped || scannerStatus !== 'scanning') && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                            <div className="text-center space-y-3">
                              <Zap
                                className="h-16 w-16 mx-auto text-emerald-400 dark:text-emerald-500"
                                  strokeWidth={1.5}
                                />
                              <p className="text-sm text-emerald-500 dark:text-emerald-400 font-medium">
                                  {manuallyStopped ? 'Scanner Inactive' :
                                  scannerStatus === 'initializing' ? 'Initialize Scanner' :
                                      scannerStatus === 'error' ? 'Scanner Offline' :
                                        'Scanner Standby'}
                                </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Responsive Controls */}
                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                        <Button
                          onClick={stopScanner}
                          variant="outline"
                          size="sm"
                          disabled={processing || !scanning}
                          className="h-7 px-2 text-xs sm:h-8 sm:px-3 min-w-0 flex-shrink-0 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                        >
                          <PowerOff className="h-3 w-3 sm:mr-1" />
                          <span className="hidden xs:inline sm:inline">Stop</span>
                        </Button>

                        <Button
                          onClick={() => {
                            setManuallyStopped(false)
                            initializeScanner()
                          }}
                          variant="outline"
                          size="sm"
                          disabled={processing || scanning}
                          className="h-7 px-2 text-xs sm:h-8 sm:px-3 min-w-0 flex-shrink-0"
                        >
                          <Power className="h-3 w-3 sm:mr-1" />
                          <span className="hidden xs:inline sm:inline">Start</span>
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
                      {scanning ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Health Monitor */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-emerald-500" />
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">System Health</h3>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Uptime</span>
                      <span className="text-xs font-mono text-neutral-900 dark:text-neutral-100">{systemHealth.uptime}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Scans/Hr</span>
                      <span className="text-xs font-mono text-neutral-900 dark:text-neutral-100">{systemHealth.scansPerHour}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Memory</span>
                      <span className="text-xs font-mono text-neutral-900 dark:text-neutral-100">
                        {Math.round(systemHealth.memoryUsage / (1024 * 1024))}MB
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Restarts</span>
                      <span className="text-xs font-mono text-neutral-900 dark:text-neutral-100">{systemHealth.deviceRestarts}</span>
                    </div>
                  </div>
                  
                  {failedOperations.length > 0 && (
                    <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-xs text-orange-700 dark:text-orange-300">
                          {failedOperations.length} ops queued
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button
                      onClick={handleMemoryCleanup}
                      className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="text-center">
                          <Trash2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Optimize</div>
                        </div>
                      </button>
                      <button
                        onClick={handlePeriodicRestart}
                        className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <div className="text-center">
                          <RotateCcw className="h-4 w-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Restart</div>
                        </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Scans */}
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Recent Activity</h3>
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
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <div className="border-b border-emerald-200 dark:border-emerald-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">Operation Guide</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Position QR code in scanner path</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Scanner reads automatically</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Auto processes check-in/out</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>No manual input needed</span>
                    </div>
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
  )
}