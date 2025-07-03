'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Plus, Activity, Users } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import SportsToggleButtons from './components/SportsToggleButtons'

type Sport = {
  id: string
  name: string
  image_url: string | null
  seat_limit: number
  is_active: boolean
  created_at: string
}

export default function AdminSportsPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setSports(data || [])
    } catch (error) {
      console.error('Error fetching sports:', error)
      toast.error('Failed to load sports')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSports()
  }, [fetchSports])

  // Calculate active/inactive sports for toggle buttons
  const hasActiveSports = sports?.some(sport => sport.is_active) || false
  const hasInactiveSports = sports?.some(sport => !sport.is_active) || false

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-green-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-green-950/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
          {/* Header Section Skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl" />
            </div>
            
            <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-80 sm:w-96 md:w-[500px] mx-auto mb-4 sm:mb-6" />

            {/* Stats and Actions Skeleton */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>

          {/* Main Content Card Skeleton */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-500" />
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid gap-4 sm:gap-6">
                {[...Array(4)].map((_, index) => (
                  <Card
                    key={index}
                    className="border border-neutral-200 dark:border-neutral-700"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-32" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-8 w-12 rounded" />
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-green-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-green-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            Manage
            <span className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent"> Sports</span>
          </h1>

          {/* Stats and Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/20">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                <span className="hidden sm:inline">{sports?.length || 0} Sports</span>
                <span className="sm:hidden">{sports?.length || 0} Available</span>
              </span>
            </div>
            
            {/* Quick toggle buttons */}
            {sports && sports.length > 0 && (
              <SportsToggleButtons 
                hasActiveSports={hasActiveSports}
                hasInactiveSports={hasInactiveSports}
                onRefresh={fetchSports}
              />
            )}
            
            <Button asChild className="sm:w-auto">
              <Link href="/admin/sports/add" className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Sport</span>
                <span className="sm:hidden">Add New Sport</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-500" />
              Available Sports
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {!sports?.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  No sports configured
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Get started by adding your first sport to enable bookings for your facility.
                </p>
                <Button asChild className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                  <Link href="/admin/sports/add" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Sport
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {sports.map((sport, index) => (
                  <Card
                    key={sport.id}
                    className={`
                      border border-neutral-200 dark:border-neutral-700 
                      hover:border-green-300 dark:hover:border-green-600 
                      hover:shadow-lg transition-all duration-200
                      ${index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}
                    `}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50">
                          <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-white">
                            {sport.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                sport.is_active
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200 dark:border-green-700'
                                  : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-200 dark:border-red-700'
                              }
                            >
                              {sport.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{sport.seat_limit} spots</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-green-300 dark:hover:border-green-600"
                      >
                        <Link href={`/admin/sports/edit/${sport.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${sport.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>{sport.is_active ? 'Available for booking' : 'Not available'}</span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Max capacity: <span className="text-neutral-900 dark:text-white">{sport.seat_limit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}