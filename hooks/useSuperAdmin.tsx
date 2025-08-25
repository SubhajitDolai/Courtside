'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export const useSuperAdmin = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useCurrentUser();
  const supabase = createClient();

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      // Wait for user to load first
      if (userLoading) {
        return;
      }

      if (!user?.id) {
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user exists in super_admins table and is active
        const { data, error } = await supabase
          .from('super_admins')
          .select('id, is_active, email, profile_id')
          .eq('profile_id', user.id)
          .eq('is_active', true);

        if (error) {
          setIsSuperAdmin(false);
        } else if (data && data.length > 0) {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } catch (error) {
        // Log error for debugging but don't expose details to user
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
  }, [user?.id, userLoading, supabase]);

  return { isSuperAdmin, loading };
};
