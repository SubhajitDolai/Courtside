'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // // ✅ Restrict to mitwpu.edu.in emails
    // if (!email.endsWith('@mitwpu.edu.in')) {
    //   toast.error('Only mitwpu.edu.in emails are allowed');
    //   setLoading(false);
    //   return;
    // }

    // ✅ Check if email exists in 'profiles' table
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      toast.error('This email is not registered');
      setLoading(false);
      return;
    }

    // ✅ Trigger password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

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
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
