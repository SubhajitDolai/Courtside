import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminNavbar from '@/components/adminNavbar';
import { Toaster } from 'sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // Correctly destructure the user from the getUser() response
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // Redirect if no user or error occurred
    redirect('/login');
  }

  // Fetch profile based on the user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)  // Use user.id
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');  // Block non-admins
  }

  return (
    <>
      <AdminNavbar />
      <main>{children}</main>
      <Toaster />
    </>
  );
}
