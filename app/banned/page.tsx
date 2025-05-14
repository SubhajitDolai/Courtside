import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ban } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function AccessRestrictedPage() {
  const supabase = await createClient()
  // Auto logout
  await supabase.auth.signOut()
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-6 space-y-6">
      {/* Status Icon */}
      <div className="bg-red-100 p-4 rounded-full">
        <Ban className="w-8 h-8 text-red-600" />
      </div>
      
      {/* Main Title */}
      <h1 className="text-3xl font-bold text-red-700">Account Access Restricted</h1>
      
      {/* Primary Message */}
      <p className="text-muted-foreground max-w-md text-center">
        Your account access has been temporarily suspended due to potential violations of the institution&apos;s policies.
        This restriction may have been implemented for the following reasons:
      </p>
      
      {/* Violation Categories */}
      <ul className="text-muted-foreground text-sm list-disc pl-6 max-w-md text-left space-y-1">
        <li>Non-compliance with institutional conduct guidelines or academic policies.</li>
        <li>Reservation of facility resources without attendance or proper cancellation.</li>
        <li>Unresolved financial obligations related to campus services or facilities.</li>
      </ul>
      
      {/* Resolution Information */}
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Account Reinstatement Process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            To resolve this matter, you may need to fulfill outstanding obligations or consult with administration. 
            Please use the contact option below to submit an appeal or request clarification regarding your account status.
          </p>
          <Button asChild className="w-full">
            <Link 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=subhajit.dolai@mitwpu.edu.in&su=Account%20Access%20Appeal%20Request"
              target="_blank"
            >
              Contact Administration
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      {/* Navigation Option */}
      <Button variant="outline" asChild>
        <Link href="/login">Return to Login</Link>
      </Button>
    </div>
  )
}