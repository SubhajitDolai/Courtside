'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider';

// Create a client component that uses useSearchParams
function SetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { start } = useGlobalLoadingBar();
  
  // Get the token from the URL
  const token = searchParams.get('token');

  useEffect(() => {
    async function verifyInvitation() {
      if (!token) {
        setError('Invalid invitation link');
        setVerifying(false);
        return;
      }

      try {
        // First check if the user is already authenticated (rare, but possible)
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // User is already authenticated, likely from clicking the invitation
          setEmail(sessionData.session.user.email || null);
          setVerifying(false);
          return;
        }
        
        // Not authenticated - explicitly verify the token
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite',
        });
        
        if (verifyError || !data.session) {
          console.error('Token verification error:', verifyError);
          setError('This invitation link is invalid or has expired');
          setVerifying(false);
          return;
        }
        
        // Successfully verified
        setEmail(data.session.user.email || null);
        setVerifying(false);
      } catch (err) {
        console.error('Error verifying invitation:', err);
        setError('Failed to verify invitation');
        setVerifying(false);
      }
    }

    verifyInvitation();
  }, [token, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({ 
        password 
      });
      
      if (error) throw error;
      
      toast.success('Password set successfully!');
      start(); // Start the loading bar for redirect
      router.push('/'); // Send them to the landing page
    } catch (err: unknown) {
      console.error('Error setting password:', err);
      
      // Type guard for objects with a message property
      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('Failed to set password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Verifying Invitation</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we verify your invitation...
            </p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin h-8 w-8 border-4 border-t-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Set Your Password</h1>
          {email && (
            <p className="text-sm text-muted-foreground mt-2">
              Setting password for {email}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label htmlFor="password" className="text-sm font-medium block">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                disabled={loading}
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="text-sm font-medium block">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Setting Password...
                </div>
              ) : (
                'Set Password & Continue'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading...</h1>
            <div className="flex justify-center mt-4">
              <div className="animate-spin h-8 w-8 border-4 border-t-primary rounded-full" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}