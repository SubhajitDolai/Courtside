'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Sorry, something went wrong</p>
      <Button onClick={() => router.push("/login")} className="mt-4">
        Go to Login
      </Button>
      <Button onClick={() => router.push("/signup")} className="mt-4">
        Go to Signup
      </Button>
    </div>
  )
}