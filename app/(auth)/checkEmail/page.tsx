'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CheckMailPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Check Your Email 📩</h1>
        <p className="text-muted-foreground">
          We've sent a confirmation link to your MIT-WPU email address.
        </p>
        <p className="text-muted-foreground">
          Please verify your email to activate your account.
        </p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          Go to Login
        </Button>
      </div>
    </div>
  )
}