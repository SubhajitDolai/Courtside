'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signup } from '@/app/(auth)/login/actions'
import { Loader, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGlobalLoadingBar } from "@/components/providers/LoadingBarProvider"

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [alertDescription, setAlertDescription] = useState("")
  const [alertAction, setAlertAction] = useState<(() => void) | null>(null)
  const { start, finish } = useGlobalLoadingBar()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError("");
    setIsLoading(true)
    start()

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirm = formData.get('confirmPassword') as string
    setUserEmail(email) // Store email for display in dialog

    if (password !== confirm) {
      setIsLoading(false)
      finish()
      setPasswordError("Passwords do not match")
      return
    }

    // Check if user already exists
    try {
      const checkRes = await fetch('/api/check-user-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const checkData = await checkRes.json()
      if (checkData.exists) {
        setIsLoading(false)
        finish()
        setAlertTitle('Signup Error')
        setAlertDescription('User with this email already exists')
        setAlertAction(null)
        setAlertOpen(true)
        return
      }
    } catch (err) {
      console.log("Error:", err)
      setIsLoading(false)
      finish()
      setAlertTitle('Network Error')
      setAlertDescription('Could not check if user exists. Please try again.')
      setAlertAction(null)
      setAlertOpen(true)
      return
    }

    const res = await signup(formData)

    setIsLoading(false)
    finish()

    if (res.error) {
      setAlertTitle('Signup Error')
      setAlertDescription(res.error)
      setAlertAction(null)
      setAlertOpen(true)
    } else {
      setShowSuccessDialog(true) // ✅ Open success dialog
    }
  }

  return (
    <>
      {/* Error AlertDialog for signup errors */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button type="button">OK</button>
            </AlertDialogCancel>
            {alertAction && (
              <AlertDialogAction asChild>
                <button type="button" onClick={() => { setAlertOpen(false); alertAction(); }}>Continue</button>
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Signup</CardTitle>
            <CardDescription>
              Enter your college email to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="user@mitwpu.edu.in"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Create Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create Password"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-2/4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      required
                      className="pr-10"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2 top-2/4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    'Signup'
                  )}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Alert Dialog - World-Class Design */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto border bg-background backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Clean minimal background */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </motion.div>

          <div className="relative z-10 space-y-4">
            {/* Success Icon - Centered & Clean */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
              className="flex justify-center"
            >
              {/* Ripple effect background */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 0.3, 0] }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.3,
                  ease: "easeOut"
                }}
                className="absolute w-20 h-20 rounded-full bg-emerald-400 opacity-20"
              />
              
              {/* Main icon container */}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 flex items-center justify-center shadow-lg ring-1 ring-emerald-200/50 dark:ring-emerald-800/50">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 0.4 
                  }}
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </motion.div>
              </div>
            </motion.div>

            {/* Content with staggered animations */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-center space-y-3 pb-4"
            >
              <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                Check Your Email
              </AlertDialogTitle>
              
              <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                We&apos;ve sent a verification link to your inbox. Click the link in your email to activate your Courtside account.
              </AlertDialogDescription>
            </motion.div>

            {/* Email Card - Clean Design */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-md border bg-muted/30 backdrop-blur-sm">
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
                
                <div className="p-3 flex items-center gap-3 min-h-[60px]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Verification email sent to
                    </p>
                    <p className="text-sm font-medium text-foreground truncate mt-0.5">
                      {userEmail || 'your@email.com'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pro Tip - Clean Design */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 min-h-[60px] flex items-center justify-center">
                <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                  <span className="font-medium">Quick tip:</span> Can&apos;t find the email? Check your spam or junk folder
                </p>
              </div>
            </motion.div>
          </div>

        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
