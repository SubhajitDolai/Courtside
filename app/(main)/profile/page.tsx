import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ProfileClientWrapper from './client/client-page';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/login');

  return <ProfileClientWrapper userId={userData.user.id} />
}
