import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Production-ready hook for real-time Supabase subscriptions with comprehensive error handling,
 * automatic reconnection, debouncing, and memory leak prevention.
 * 
 * @template T - The type of data being subscribed to
 * @param tableName - The name of the Supabase table to subscribe to
 * @param initialData - Initial data to display before real-time data loads
 * @param fetchFunction - Function to fetch fresh data from the database
 * @param filterColumn - Optional column name to filter subscriptions
 * @param filterValue - Optional value to filter subscriptions by
 * @returns Object containing data, loading state, connection status, and utility functions
 * 
 * @example
 * ```tsx
 * const { data, loading, isConnected, error, refreshData, forceReconnect } = useRealtimeSubscription<User>(
 *   'users',
 *   [],
 *   fetchUsers,
 *   'department_id',
 *   '123'
 * )
 * ```
 */
export function useRealtimeSubscription<T>(
  tableName: string,
  initialData: T[],
  fetchFunction: () => Promise<T[]>,
  filterColumn?: string,
  filterValue?: string
) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // 🌍 Stable Supabase client - never recreated
  const supabase = useMemo(() => createClient(), [])

  // 🌍 Refs for state management and cleanup
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isMountedRef = useRef(true)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<number>(0)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSetupInProgressRef = useRef(false)
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // 🌍 Input validation
  useEffect(() => {
    if (!tableName || typeof tableName !== 'string') {
      console.error('useRealtimeSubscription: tableName must be a non-empty string')
      setError('Invalid table name')
      return
    }

    if (!fetchFunction || typeof fetchFunction !== 'function') {
      console.error('useRealtimeSubscription: fetchFunction must be a function')
      setError('Invalid fetch function')
      return
    }

    if (filterColumn && (!filterValue || typeof filterValue !== 'string')) {
      console.warn('useRealtimeSubscription: filterColumn provided but filterValue is empty or invalid')
    }

    // Clear any previous validation errors
    if (error === 'Invalid table name' || error === 'Invalid fetch function') {
      setError(null)
    }
  }, [tableName, fetchFunction, filterColumn, filterValue, error])

  // 🌍 Intelligent debounced refresh (prevents spam)
  const debouncedRefresh = useCallback((force = false) => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchRef.current

    const executeRefresh = async () => {
      if (!isMountedRef.current) return

      setLoading(true)
      setError(null)
      lastFetchRef.current = Date.now()

      try {
        const freshData = await fetchFunction()
        if (isMountedRef.current) {
          setData(freshData)
          // Log successful data fetch in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔄 Realtime data refreshed for table: ${tableName}`, {
              recordCount: freshData.length,
              timestamp: new Date().toISOString()
            })
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Realtime subscription fetch error:', errorMessage)
        if (isMountedRef.current) {
          setError(errorMessage)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    // If forced or enough time has passed, execute immediately
    if (force || timeSinceLastFetch > 1000) {
      executeRefresh()
    } else {
      // Debounce for 200ms if called too frequently
      debounceTimeoutRef.current = setTimeout(executeRefresh, 200)
    }
  }, [fetchFunction, tableName])

  // 🌍 Stable refresh function
  const refreshData = useCallback((force = false) => {
    debouncedRefresh(force)
  }, [debouncedRefresh])

  // 🌍 Comprehensive cleanup function
  const cleanup = useCallback(async () => {
    // Clear all timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current)
      healthCheckIntervalRef.current = null
    }

    // Remove channel with error handling
    if (channelRef.current) {
      try {
        await supabase.removeChannel(channelRef.current)
      } catch (err) {
        console.warn('Error removing channel:', err)
      }
      channelRef.current = null
    }

    setIsConnected(false)
    isSetupInProgressRef.current = false
  }, [supabase])

  // 🌍 World-class subscription setup with exponential backoff
  const setupSubscription = useCallback(async () => {
    if (!isMountedRef.current || isSetupInProgressRef.current) return

    isSetupInProgressRef.current = true

    try {
      // Clean up any existing subscription (but don't clean up this setup)
      if (channelRef.current) {
        try {
          await supabase.removeChannel(channelRef.current)
        } catch (err) {
          console.warn('Error removing previous channel:', err)
        }
        channelRef.current = null
      }

      // Create filter if provided
      const filter = filterColumn && filterValue 
        ? `${filterColumn}=eq.${filterValue}`
        : undefined

      // Create unique channel name with entropy
      const entropy = Math.random().toString(36).substring(2, 15)
      const timestamp = Date.now()
      const channelName = `${tableName}_${timestamp}_${entropy}`

      // Create channel with optimal config
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: entropy },
          private: false
        }
      })

      const handleRealtimeEvent = () => {
        refreshData()
      }

      channel
        .on('postgres_changes', 
          { 
            event: 'INSERT',
            schema: 'public',
            table: tableName,
            ...(filter ? { filter } : {})
          },
          handleRealtimeEvent
        )
        .on('postgres_changes', 
          { 
            event: 'UPDATE',
            schema: 'public',
            table: tableName,
            ...(filter ? { filter } : {})
          },
          handleRealtimeEvent
        )
        .on('postgres_changes', 
          { 
            event: 'DELETE',
            schema: 'public',
            table: tableName
          },
          handleRealtimeEvent
        )

      await channel.subscribe((status, err) => {
        if (!isMountedRef.current) return

        if (err) {
          console.error('Subscription error:', err)
          setIsConnected(false)
          setError(err.message)
          isSetupInProgressRef.current = false

          // Exponential backoff retry (max 5 attempts) - get fresh retry count
          setRetryCount(currentCount => {
            if (currentCount < 5) {
              const delay = Math.min(1000 * Math.pow(2, currentCount), 10000)
              retryTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  setupSubscription()
                }
              }, delay)
              return currentCount + 1
            }
            return currentCount
          })
          return
        }

        switch (status) {
          case 'SUBSCRIBED':
            setIsConnected(true)
            setError(null)
            setRetryCount(0)
            channelRef.current = channel
            isSetupInProgressRef.current = false
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Realtime subscription connected for table: ${tableName}`)
            }
            break

          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
            console.warn(`Channel ${status}:`, channelName)
            setIsConnected(false)
            setError(`Connection ${status.toLowerCase().replace('_', ' ')}`)
            isSetupInProgressRef.current = false

            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setupSubscription()
              }
            }, 1000)
            break

          case 'CLOSED':
            setIsConnected(false)
            isSetupInProgressRef.current = false
            if (process.env.NODE_ENV === 'development') {
              console.log(`🔐 Realtime subscription closed for table: ${tableName}`)
            }
            break

          default:
            console.warn('Unknown subscription status:', status)
            isSetupInProgressRef.current = false
        }
      })

    } catch (err) {
      console.error('Setup subscription error:', err)
      setIsConnected(false)
      setError(err instanceof Error ? err.message : 'Setup failed')
      isSetupInProgressRef.current = false

      // Retry with exponential backoff - get fresh retry count
      setRetryCount(currentCount => {
        if (currentCount < 5) {
          const delay = Math.min(1000 * Math.pow(2, currentCount), 10000)
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              setupSubscription()
            }
          }, delay)
          return currentCount + 1
        }
        return currentCount
      })
    }
  }, [tableName, filterColumn, filterValue, supabase, refreshData])

  // 🌍 Main effect - handles setup and cleanup
  useEffect(() => {
    isMountedRef.current = true
    
    // Initial setup
    const initialize = async () => {
      // Only fetch initial data if we don't have initial data provided
      if (initialData.length === 0) {
        refreshData(true) // Force initial fetch
      }

      // Setup subscription
      await setupSubscription()
      isInitializedRef.current = true
    }

    initialize()

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
      isInitializedRef.current = false
      cleanup()
    }
  }, []) // Empty dependency array is correct here

  // 🌍 Handle parameter changes
  useEffect(() => {
    // Only react to changes after initial setup
    if (isMountedRef.current && isInitializedRef.current) {
      setRetryCount(0) // Reset retry count
      setupSubscription()
    }
  }, [tableName, filterColumn, filterValue, setupSubscription])

  // 🌍 Connection health monitor (checks every 30 seconds)
  useEffect(() => {
    healthCheckIntervalRef.current = setInterval(() => {
      if (!isConnected && isMountedRef.current) {
        // Use functional update to get fresh retry count
        setRetryCount(currentCount => {
          if (currentCount < 5) {
            setupSubscription()
            return 0 // Reset retry count for health check
          }
          return currentCount
        })
      }
    }, 30000)

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
        healthCheckIntervalRef.current = null
      }
    }
  }, [isConnected, setupSubscription])

  // 🌍 Force reconnect function for manual recovery
  const forceReconnect = useCallback(() => {
    setRetryCount(0)
    setError(null)
    isSetupInProgressRef.current = false
    setupSubscription()
  }, [setupSubscription])

  // 🌍 Manual refresh function
  const manualRefresh = useCallback(() => {
    refreshData(true)
  }, [refreshData])

  // 🌍 Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    data, 
    loading, 
    refreshData: manualRefresh,
    isConnected,
    error,
    forceReconnect,
    retryCount,
    // 🌍 Additional utility functions for production use
    isRetrying: retryCount > 0,
    hasError: error !== null,
    isHealthy: isConnected && error === null,
    // 🌍 Debug information (only in development)
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        channelName: channelRef.current?.topic,
        lastFetch: lastFetchRef.current,
        isSetupInProgress: isSetupInProgressRef.current,
      }
    })
  }), [
    data, 
    loading, 
    manualRefresh,
    isConnected,
    error,
    forceReconnect,
    retryCount
  ])
}