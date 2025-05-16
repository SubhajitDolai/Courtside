'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Loader } from 'lucide-react'

interface Sport {
  id: string
  name: string
  image_url: string | null
}

export default function SportsList({
  sports,
  loadingId,
  handleViewSlots,
}: {
  sports: Sport[]
  loadingId: string | null
  handleViewSlots: (sportId: string) => void
}) {
  if (!sports.length) {
    return (
      <p className="col-span-full text-center text-muted-foreground">
        No sports available at the moment.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {sports.map((sport) => (
        <Card key={sport.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{sport.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="w-full h-48 relative rounded-md overflow-hidden">
              <Image
                src={sport.image_url || '/mit.webp'}
                alt={sport.name}
                fill
                className="object-cover"
              />
            </div>
            <Button
              className="w-full flex items-center justify-center gap-2"
              disabled={loadingId === sport.id}
              onClick={() => handleViewSlots(sport.id)}
            >
              {loadingId === sport.id ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'View Slots'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
