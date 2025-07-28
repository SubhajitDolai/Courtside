'use client'

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader, Eye, EyeOff } from "lucide-react"
import { login } from '../actions'
import { toast } from 'sonner'
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
import { useRouter } from 'next/navigation'
import { useGlobalLoadingBar } from "@/components/providers/LoadingBarProvider"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { start, finish } = useGlobalLoadingBar()

  useEffect(() => {
    router.prefetch('/')
    router.prefetch('/admin')
  }, [router])

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertDescription, setAlertDescription] = useState('')
  const [alertAction, setAlertAction] = useState<(() => void) | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    start()

    const formData = new FormData(e.currentTarget)
    const res = await login(formData) // 👈 server action login

    if (res.error) {
      const msg = res.error.toLowerCase()

      if (msg.includes('invalid login credentials')) {
        setAlertTitle('Login Failed')
        setAlertDescription('Invalid email or password.')
        setAlertAction(null)
        setAlertOpen(true)
      } else if (msg.includes('fetch failed')) {
        setAlertTitle('Network Error')
        setAlertDescription('No internet connection. Please check your network.')
        setAlertAction(null)
        setAlertOpen(true)
      } else if (msg.includes('banned')) {
        setAlertTitle('Account Suspended')
        setAlertDescription('Your account has been suspended, please contact support.')
        setAlertAction(() => router.push('/banned'))
        setAlertOpen(true)
      } else {
        setAlertTitle('Error')
        setAlertDescription('Something went wrong. Please try again.')
        setAlertAction(null)
        setAlertOpen(true)
      }

      setIsLoading(false)
      finish()
      return
    }

    toast.success('Logged in successfully')

    router.push('/')

    setIsLoading(false)
  }, [router, start, finish])

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  return (
    <>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your college email to login
          </p>
        </div>

        <div className="grid gap-6">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@mitwpu.edu.in"
              required
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-2 top-2/4 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              'Login'
            )}
          </Button>
        </div>

        {/* Signup */}
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </form>

      {/* AlertDialog for error messages */}
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
    </>
  )
}