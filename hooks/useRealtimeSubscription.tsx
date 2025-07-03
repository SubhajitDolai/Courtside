import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

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

  // 🌍 Intelligent debounced refresh (prevents spam)
  const debouncedRefresh = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return (force = false) => {
      clearTimeout(timeoutId)

      const now = Date.now()
      const timeSinceLastFetch = now - lastFetchRef.current

      // If forced or enough time has passed, execute immediately
      if (force || timeSinceLastFetch > 1000) {
        timeoutId = setTimeout(async () => {
          if (!isMountedRef.current) return

          setLoading(true)
          setError(null)
          lastFetchRef.current = Date.now()

          try {
            const freshData = await fetchFunction()
            if (isMountedRef.current) {
              setData(freshData)
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            if (isMountedRef.current) {
              setError(errorMessage)
            }
          } finally {
            if (isMountedRef.current) {
              setLoading(false)
            }
          }
        }, 0)
      } else {
        // Debounce for 200ms if called too frequently
        timeoutId = setTimeout(async () => {
          if (!isMountedRef.current) return

          setLoading(true)
          setError(null)
          lastFetchRef.current = Date.now()

          try {
            const freshData = await fetchFunction()
            if (isMountedRef.current) {
              setData(freshData)
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            if (isMountedRef.current) {
              setError(errorMessage)
            }
          } finally {
            if (isMountedRef.current) {
              setLoading(false)
            }
          }
        }, 200)
      }
    }
  }, [fetchFunction])

  // 🌍 Stable refresh function
  const refreshData = useCallback((force = false) => {
    debouncedRefresh(force)
  }, [debouncedRefresh])

  // 🌍 Bulletproof cleanup function
  const cleanup = useCallback(async () => {
    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Remove channel with error handling
    if (channelRef.current) {
      try {
        await supabase.removeChannel(channelRef.current)
      } catch (err) {
        // Handle error silently
      }
      channelRef.current = null
    }

    setIsConnected(false)
  }, [supabase])

  // 🌍 World-class subscription setup with exponential backoff
  const setupSubscription = useCallback(async () => {
    if (!isMountedRef.current) return

    try {
      // Clean up any existing subscription
      await cleanup()

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
          setIsConnected(false)
          setError(err.message)

          // Exponential backoff retry (max 5 attempts)
          if (retryCount < 5) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setRetryCount(prev => prev + 1)
                setupSubscription()
              }
            }, delay)
          }
          return
        }

        switch (status) {
          case 'SUBSCRIBED':
            setIsConnected(true)
            setError(null)
            setRetryCount(0)
            channelRef.current = channel
            break

          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
            setIsConnected(false)
            setError(`Connection ${status.toLowerCase()}`)

            retryTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setupSubscription()
              }
            }, 1000)
            break

          case 'CLOSED':
            setIsConnected(false)
            break

          default:
            // Handle unknown status silently
        }
      })

    } catch (err) {
      setIsConnected(false)
      setError(err instanceof Error ? err.message : 'Setup failed')

      // Retry with exponential backoff
      if (retryCount < 5) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setRetryCount(prev => prev + 1)
            setupSubscription()
          }
        }, delay)
      }
    }
  }, [tableName, filterColumn, filterValue, supabase, cleanup, refreshData, retryCount])

  // 🌍 Main effect - handles setup and cleanup
  useEffect(() => {
    isMountedRef.current = true

    // Initial data fetch
    refreshData(true) // Force initial fetch

    // Setup subscription
    setupSubscription()

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [setupSubscription, refreshData, cleanup])

  // 🌍 Handle parameter changes
  useEffect(() => {
    if (isMountedRef.current) {
      setRetryCount(0) // Reset retry count
      setupSubscription()
    }
  }, [tableName, filterColumn, filterValue])

  // 🌍 Connection health monitor (checks every 30 seconds)
  useEffect(() => {
    const healthCheck = setInterval(() => {
      if (!isConnected && isMountedRef.current && retryCount < 5) {
        setRetryCount(0)
        setupSubscription()
      }
    }, 30000)

    return () => clearInterval(healthCheck)
  }, [isConnected, setupSubscription, retryCount])

  // 🌍 Force reconnect function for manual recovery
  const forceReconnect = useCallback(() => {
    setRetryCount(0)
    setError(null)
    setupSubscription()
  }, [setupSubscription])

  // 🌍 Manual refresh function
  const manualRefresh = useCallback(() => {
    refreshData(true)
  }, [refreshData])

  return { 
    data, 
    loading, 
    refreshData: manualRefresh,
    isConnected,
    error,
    forceReconnect,
    retryCount
  }
}