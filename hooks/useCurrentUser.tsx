'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  course: string | null;
  prn: string | null;
  phone_number: string | null;
  gender: string | null;
  email: string | null;
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First get the session to check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Now fetch the profile data using the same approach as your profile-shell
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // Set the user data
        setUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Set up auth listener to update when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return { user, loading };
};