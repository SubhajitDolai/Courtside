'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRef } from 'react';

interface NotificationContextType {
  hasNotifications: boolean;
  notificationCount: number;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTimeRef = useRef(0);

  const supabase = useMemo(() => createClient(), []);

  // Memoized fetch function with caching
  const fetchNotifications = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    // Skip if fetched recently (within 30 seconds) unless forced
    if (!force && timeSinceLastFetch < 30000) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('is_active', true);

      if (error) throw error;

      const count = data?.length || 0;
      setNotificationCount(count);
      setHasNotifications(count > 0);
      lastFetchTimeRef.current = now;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Debounced refresh function
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  // Initial fetch and setup real-time subscription
  useEffect(() => {
    fetchNotifications(true);

    // Set up real-time subscription for notification changes
    const channel = supabase
      .channel('notifications_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          // Debounce real-time updates
          setTimeout(() => fetchNotifications(true), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications]);

  const value = useMemo(
    () => ({
      hasNotifications,
      notificationCount,
      refreshNotifications,
      isLoading,
      error,
    }),
    [hasNotifications, notificationCount, refreshNotifications, isLoading, error]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
