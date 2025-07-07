'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { Loader } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { start, finish } = useGlobalLoadingBar()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    start(); // Start the global loading bar

    // Check if user exists in Supabase Auth users table via API route
    const res = await fetch('/api/check-user-exists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (res.status !== 200) {
      toast.error(result.error || 'Could not check user. Try again later.');
      setLoading(false);
      finish();
      return;
    }
    if (!result.exists) {
      toast.error('This email is not registered');
      setLoading(false);
      finish();
      return;
    }

    const supabase = createClient();
    // ✅ Trigger password reset directly from Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    finish(); // Finish the loading bar

    if (error) {
      console.error(error)
      toast.error('Something went wrong. Try again.')
    } else {
      toast.success('Check your inbox 📩 to reset password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@mitwpu.edu.in"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
