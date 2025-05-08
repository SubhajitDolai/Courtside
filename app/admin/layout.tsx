import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ModeToggle } from '@/components/modeToggle';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');  // block non-admins
  }

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <ModeToggle />
      </div>
      <main>{children}</main>
    </>
  );
}
