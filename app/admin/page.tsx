'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Clock, Calendar } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()

  const cards = [
    {
      title: 'Manage Sports',
      description: 'Add or edit sports options',
      icon: <Trophy className="h-8 w-8 text-primary" />,
      href: '/admin/sports',
    },
    {
      title: 'Manage Slots',
      description: 'Set available time slots',
      icon: <Clock className="h-8 w-8 text-primary" />,
      href: '/admin/slots',
    },
    {
      title: 'Manage Bookings',
      description: 'View and manage user bookings',
      icon: <Calendar className="h-8 w-8 text-primary" />,
      href: '/admin/bookings',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {cards.map((card, index) => (
          <Card
            key={index}
            onClick={() => router.push(card.href)}
            className="cursor-pointer transition hover:shadow-lg hover:bg-accent"
          >
            <CardHeader className="flex flex-col items-center space-y-2">
              {card.icon}
              <CardTitle className="text-xl font-semibold text-center">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
