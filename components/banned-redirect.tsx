'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function BannedRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkBan = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'ban') {
        router.replace('/banned');
      }
    };

    checkBan();
  }, [router]);

  return null;
}