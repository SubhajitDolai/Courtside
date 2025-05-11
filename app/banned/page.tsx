import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ban } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function BannedPage() {
  const supabase = await createClient()

  // ✅ Auto logout
  await supabase.auth.signOut()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-6 space-y-6">

      {/* 🚫 Icon */}
      <div className="bg-red-100 p-4 rounded-full">
        <Ban className="w-8 h-8 text-red-600" />
      </div>

      {/* ❌ Title */}
      <h1 className="text-3xl font-bold text-red-700">Access Restricted</h1>

      {/* 📢 Message */}
      <p className="text-muted-foreground max-w-md text-center">
        Your account has been banned due to one or more violations of the college&apos;s policies.
        Bans may occur for the following reasons:
      </p>

      {/* 📋 Reasons */}
      <ul className="text-muted-foreground text-sm list-disc pl-6 max-w-md text-left space-y-1">
        <li>Involvement in disciplinary actions or misconduct.</li>
        <li>Booking sports slots without actually showing up.</li>
        <li>Outstanding penalties or dues related to misuse of facilities.</li>
      </ul>

      {/* 🪪 Help Card */}
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Want to get unbanned?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            You may be required to pay a fine or speak to the admin to lift the ban. Reach out below to appeal or clarify your situation.
          </p>
          <Button asChild className="w-full">
            <Link 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=subhajit.dolai@mitwpu.edu.in&su=Account%20Ban%20Appeal"
              target="_blank"
            >
              Contact Admin
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 🔙 Back to Login */}
      <Button variant="outline" asChild>
        <Link href="/login">Back to Login</Link>
      </Button>

    </div>
  )
}
