'use client'

import { useState } from 'react'
import { Shield, ArrowLeft, Home, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export function UnauthorizedAccess() {
  const router = useRouter()
  const [isGoingBack, setIsGoingBack] = useState(false)
  const [isGoingToDashboard, setIsGoingToDashboard] = useState(false)
  const { start } = useGlobalLoadingBar()

  const handleGoBack = () => {
    setIsGoingBack(true)
    start()
    router.back()
  }

  const handleGoToDashboard = () => {
    setIsGoingToDashboard(true)
    start()
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-red-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-red-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
            Access Restricted
          </h1>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            This page is restricted to super administrators only. You don&apos;t have the required permissions to access this area.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGoBack}
              variant="outline"
              disabled={isGoingBack || isGoingToDashboard}
              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex-1"
            >
              {isGoingBack ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Going Back...
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </>
              )}
            </Button>
            
            <Button
              onClick={handleGoToDashboard}
              disabled={isGoingBack || isGoingToDashboard}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
            >
              {isGoingToDashboard ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Home className="h-4 w-4" />
                  Dashboard
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
