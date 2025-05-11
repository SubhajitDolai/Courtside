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
    // ✅ Ensure the component is mounted on the client-side
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
    return null // ✅ Ensure nothing is rendered on the server before the client is ready
  }

  return (
    <div className="p-6 min-h-screen flex flex-col items-center justify-center space-y-6">

      {/* ✅ Subtle success icon */}
      <div className="rounded-full bg-green-100 p-3">
        <Check className="w-6 h-6 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-green-700">Booking Confirmed!</h2>

      {/* ✅ Better success text */}
      <p className="text-muted-foreground text-center max-w-md">
        Your seat has been successfully booked. Show your booking number at the check-in counter to confirm your entry.
      </p>

      {/* ✅ Booking ID Card */}
      <Card className="w-full max-w-md border border-green-200 shadow-sm">
        <CardContent className="flex justify-between items-center p-4">
          <span className="text-lg font-mono text-green-700">{bookingId}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="ml-2"
            title="Copy booking ID"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </CardContent>
      </Card>

      <Button asChild size="lg" className="mt-2">
        <Link href="/sports">Go to Home</Link>
      </Button>

    </div>
  )
}