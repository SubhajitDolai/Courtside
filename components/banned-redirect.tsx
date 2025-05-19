'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function BannedRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkBanWithRefresh = async () => {
      const supabase = createClient();

      // 🔄 Try refreshing session (will fail if user is banned)
      const { error } = await supabase.auth.refreshSession();

      if (error?.message?.toLowerCase().includes('banned')) {
        router.replace('/banned');
      }
    };

    checkBanWithRefresh();
  }, [router]);

  return null;
}