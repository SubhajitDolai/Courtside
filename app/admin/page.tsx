'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Clock, ClipboardList, History, QrCode, MessageSquare, Bell, Shield, ActivitySquare } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export default function AdminPage() {
  const router = useRouter()
  const { start } = useGlobalLoadingBar()

  const cards = useMemo(() => [
    {
      title: 'Manage Sports',
      description: 'Add or edit sports options',
      icon: <Trophy className="w-full h-full text-green-600 dark:text-green-400" />,
      href: '/admin/sports',
    },
    {
      title: 'Manage Slots',
      description: 'Set available time slots',
      icon: <Clock className="w-full h-full text-blue-600 dark:text-blue-400" />,
      href: '/admin/slots',
    },
    {
      title: 'Manage Feedback',
      description: 'View and manage user feedback',
      icon: <MessageSquare className="w-full h-full text-emerald-600 dark:text-emerald-400" />,
      href: '/admin/feedback',
    },
    {
      title: 'Manage Notifications',
      description: 'Create and manage system notifications',
      icon: <Bell className="w-full h-full text-cyan-600 dark:text-cyan-400" />,
      href: '/admin/notifications',
    },
    {
      title: 'Bookings History',
      description: 'View all time booking records',
      icon: <History className="w-full h-full text-teal-600 dark:text-teal-400" />,
      href: '/admin/bookings-history',
    },
    {
      title: 'User Activity',
      description: 'Track user engagement and analytics',
      icon: <ActivitySquare className="w-full h-full text-cyan-600 dark:text-cyan-400" />,
      href: '/admin/user-activity',
    },
    {
      title: 'Manage Bookings',
      description: 'View and manage user bookings',
      icon: <ClipboardList className="w-full h-full text-emerald-600 dark:text-emerald-400" />,
      href: '/admin/bookings',
    },
    {
      title: 'Admin Profiles',
      description: 'Manage administrator access',
      icon: <Shield className="w-full h-full text-purple-600 dark:text-purple-400" />,
      href: '/admin/profiles',
    },
    {
      title: 'QR Scanner',
      description: 'Scan QR codes for check-in/out',
      icon: <QrCode className="w-full h-full text-purple-600 dark:text-purple-400" />,
      href: '/admin/qr-scanner',
    },
  ], [])

  const handleCardClick = (href: string) => {
    start()
    router.push(href)
  }

  // ✅ Prefetch admin routes for faster UX
  useEffect(() => {
    cards.forEach(card => router.prefetch(card.href))
  }, [router, cards])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-800 px-4 py-8">
      <div className="lg:pt-20 grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl">
        {cards.map((card, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(card.href)}
            className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 border-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-lg group h-28 sm:h-32 md:h-36 lg:h-40 relative overflow-hidden"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-neutral-100/30 dark:from-neutral-800/30 dark:via-transparent dark:to-neutral-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10 flex flex-col items-center justify-center text-center h-full px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
              {/* Icon container with enhanced styling */}
              <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md group-hover:shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10">
                  {card.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-1">
                <CardTitle className="text-base font-medium sm:text-sm sm:font-bold md:text-base lg:text-lg text-neutral-900 dark:text-white line-clamp-2 leading-tight">
                  {card.title}
                </CardTitle>
                <p className="hidden sm:block text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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