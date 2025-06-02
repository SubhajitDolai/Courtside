'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Clock, ClipboardList, History } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export default function AdminPage() {
  const router = useRouter()
  const { start } = useGlobalLoadingBar()

  const cards = [
    {
      title: 'Manage Sports',
      description: 'Add or edit sports options',
      icon: <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />,
      href: '/admin/sports',
    },
    {
      title: 'Manage Slots',
      description: 'Set available time slots',
      icon: <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      href: '/admin/slots',
    },
    {
      title: 'Manage Bookings',
      description: 'View and manage user bookings',
      icon: <ClipboardList className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />,
      href: '/admin/bookings',
    },
    {
      title: 'Bookings History',
      description: 'View all time booking records',
      icon: <History className="h-8 w-8 text-teal-600 dark:text-teal-400" />,
      href: '/admin/bookings-history',
    },
  ]

  const handleCardClick = (href: string) => {
    start()
    router.push(href)
  }

  // ✅ Prefetch admin routes for faster UX
  useEffect(() => {
    cards.forEach(card => router.prefetch(card.href))
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-800 px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-4xl">
        {cards.map((card, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(card.href)}
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 group h-32" // Adjusted height for rectangular shape
          >
            <CardHeader className="flex flex-row items-center space-x-4 px-6 py-4">
              <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {card.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}