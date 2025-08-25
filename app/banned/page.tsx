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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
        {/* Main Content Container */}
        <div className="bg-card rounded-2xl shadow-lg border p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {/* Status Icon */}
          <div className="flex justify-center">
            <div className="bg-muted p-4 sm:p-6 rounded-full">
              <Ban className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-destructive" />
            </div>
          </div>
          
          {/* Main Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Account Access Restricted
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-destructive mx-auto rounded-full"></div>
          </div>
          
          {/* Primary Message */}
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
              Your account access has been temporarily suspended due to potential violations of the institution&apos;s policies.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base font-medium">
              This restriction may have been implemented for the following reasons:
            </p>
          </div>
          
          {/* Violation Categories */}
          <div className="bg-muted/50 rounded-xl p-4 sm:p-6 border">
            <ul className="text-muted-foreground text-xs sm:text-sm lg:text-base space-y-3 list-none">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <span>Non-compliance with institutional conduct guidelines or academic policies.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <span>Reservation of facility resources without attendance or proper cancellation.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                <span>Unresolved financial obligations related to campus services or facilities.</span>
              </li>
            </ul>
          </div>
          
          {/* Resolution Information */}
          <Card>
            <CardHeader className="bg-muted/30 rounded-t-lg">
              <CardTitle className="text-lg sm:text-xl text-center">
                Account Reinstatement Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed text-center">
                To resolve this matter, you may need to fulfill outstanding obligations or consult with administration. 
                Please use the contact option below to submit an appeal or request clarification regarding your account status.
              </p>
              <Button 
                asChild 
                className="w-full font-medium py-3 sm:py-4 text-sm sm:text-base"
              >
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
          <div className="pt-4">
            <Button 
              variant="outline" 
              asChild 
              className="w-full font-medium py-3 sm:py-4 text-sm sm:text-base"
            >
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}