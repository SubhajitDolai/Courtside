'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen max-w-full items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Admin Dashboard 🫠</h1>
        <div className='flex items-center justify-center gap-5'>
          <Button onClick={() => router.push("/admin/sports")} className="mt-4" variant='default'>
            Manage Sports
          </Button>
          <Button onClick={() => router.push("/admin/slots")} className="mt-4" variant='default'>
            Manage Slots
          </Button>
          <Button onClick={() => router.push("/admin/bookings")} className="mt-4" variant='default'>
            Manage Bookings
          </Button>
        </div>
      </div>
    </div>
  )
}
