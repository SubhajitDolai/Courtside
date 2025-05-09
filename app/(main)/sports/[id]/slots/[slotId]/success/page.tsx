'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function BookingSuccessPage() {
  const params = useSearchParams()
  const bookingId = params.get('booking_id')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Ensure the component is mounted on the client-side
    setMounted(true)
  }, [])

  const handleCopy = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!mounted) {
    return null; // Ensure nothing is rendered on the server before the client is ready
  }

  return (
    <div className="pt-30 p-4 text-center space-y-6">
      <h2 className="text-2xl font-bold text-green-600">✅ Booking Successful!</h2>

      <p className="text-lg">Your booking number is shown below:</p>

      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-between items-center p-4">
            <span className="text-xl font-mono">{bookingId}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="ml-4"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Please copy this number and save it somewhere like your notes app. You’ll need it at the check-in counter.
      </p>

      <Button asChild>
        <Link href="/sports">Go Home</Link>
      </Button>
    </div>
  )
}
