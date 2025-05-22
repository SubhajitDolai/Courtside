import { useEffect, useState, useRef } from 'react'
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
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  
  // Function to reload data
  const refreshData = async () => {
    setLoading(true)
    try {
      const freshData = await fetchFunction()
      setData(freshData)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial data load
    refreshData()
    
    // Set up realtime subscription
    const setupSubscription = async () => {
      // Create filter if provided
      const filter = filterColumn && filterValue 
        ? `${filterColumn}=eq.${filterValue}`
        : undefined
      
      // Create a channel
      const channel = supabase.channel(`${tableName}_changes`)
      
      // Apply filter for INSERT and UPDATE, but not for DELETE
      channel
        .on('postgres_changes', 
          { 
            event: 'INSERT',
            schema: 'public',
            table: tableName,
            ...(filter ? { filter } : {})
          },
          () => refreshData()
        )
        .on('postgres_changes', 
          { 
            event: 'UPDATE',
            schema: 'public',
            table: tableName,
            ...(filter ? { filter } : {})
          },
          () => refreshData()
        )
        .on('postgres_changes', 
          { 
            event: 'DELETE',
            schema: 'public',
            table: tableName
            // No filter for DELETE events!
          },
          () => refreshData()
        )
      
      // Subscribe to the channel
      channelRef.current = channel.subscribe()
    }
    
    setupSubscription()
    
    // Cleanup subscription when component unmounts
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [tableName, filterColumn, filterValue, supabase])
  
  return { data, loading, refreshData }
}