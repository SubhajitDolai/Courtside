'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { Loader, Calendar, Users, Trophy } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
          <Trophy className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Sports Available</h3>
        <p className="text-muted-foreground text-center max-w-md">
          No sports are currently available for booking. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sports.map((sport) => (
        <Card 
          key={sport.id} 
          className="group border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              {sport.name}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Sport Image */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={sport.image_url || '/mit.webp'}
                alt={sport.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Sport Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Book Now</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full h-11 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-900 hover:to-black dark:from-white dark:to-neutral-100 dark:hover:from-neutral-100 dark:hover:to-neutral-200 text-white dark:text-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                disabled={loadingId === sport.id}
                onClick={() => handleViewSlots(sport.id)}
              >
                {loadingId === sport.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>View Slots</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}