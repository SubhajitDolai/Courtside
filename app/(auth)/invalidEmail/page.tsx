'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Please use your college email ID to sign up.</p>
      <Button onClick={() => router.push("/signup")} className="mt-4">
        Go to Signup
      </Button>
    </div>
  );
}