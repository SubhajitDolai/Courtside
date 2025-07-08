'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw, Home, LogIn, UserPlus, ArrowLeft, Loader } from "lucide-react"
import { motion } from "framer-motion"
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export default function ErrorPage() {
  const router = useRouter()
  const { start } = useGlobalLoadingBar()
  const [loadingStates, setLoadingStates] = useState({
    login: false,
    signup: false,
    home: false,
    back: false
  })

  const handleNavigation = (path: string, type: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }))
    start()
    router.push(path)
  }

  const handleRefresh = () => {
    start()
    window.location.reload()
  }

  const handleBack = () => {
    setLoadingStates(prev => ({ ...prev, back: true }))
    start()
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-xl shadow-2xl">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-muted/10 pointer-events-none" />
          
          <CardHeader className="text-center pb-4 relative z-10">
            {/* Error Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-destructive/10 to-destructive/20 rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
              <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={1.5} />
            </motion.div>

            <CardTitle className="text-2xl font-bold text-foreground mb-2">
              Oops! Something went wrong
            </CardTitle>
            
            <Badge variant="outline" className="mx-auto text-xs">
              Authentication Error
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            {/* Error Alert */}
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-muted-foreground">
                We encountered an issue while processing your request. This might be due to an expired session or a temporary service interruption.
              </AlertDescription>
            </Alert>

            <Separator className="my-4" />

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleNavigation("/login", "login")} 
                  size="default"
                  disabled={loadingStates.login}
                  className="h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loadingStates.login ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleNavigation("/signup", "signup")}
                  variant="outline"
                  size="default"
                  disabled={loadingStates.signup}
                  className="h-11 border-primary/20 hover:bg-primary/5 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {loadingStates.signup ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleRefresh}
                  variant="secondary"
                  size="default"
                  className="h-11 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  onClick={() => handleNavigation("/", "home")}
                  variant="secondary"
                  size="default"
                  disabled={loadingStates.home}
                  className="h-11 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {loadingStates.home ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Home className="h-4 w-4" />
                      Home
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                If the problem persists, please contact{" "}
                <span className="text-primary font-medium">support</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Previous Page */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBack}
            disabled={loadingStates.back}
            className="h-9 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
          >
            {loadingStates.back ? (
              <>
                <Loader className="h-3 w-3 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowLeft className="h-3 w-3" />
                Go back
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}