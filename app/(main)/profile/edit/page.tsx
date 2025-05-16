import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ProfileForm } from '../profile-form';

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (!profile) redirect('/onboarding');
  if (profile.role === 'ban') redirect('/banned');

  return (
    <main className="py-30 px-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Profile</h1>
      <ProfileForm profile={profile} />
    </main>
  );
}