'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from '@/components/ui/button'
import { PencilIcon, Loader, User } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import BannedRedirect from '@/components/banned-redirect'

// Simple Skeleton component
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-muted rounded-md ${className}`} />
}

export default function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  const { start } = useGlobalLoadingBar()

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        redirect('/login')
        return
      }
      setUser(userData.user)

      // Get profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      if (!data) {
        router.push('/onboarding')
        return
      }

      setProfile(data)
      router.prefetch('/profile/edit')
    }

    fetchData()
  }, [router, supabase])

  const handleEdit = () => {
    setLoading(true)
    start()
    router.push('/profile/edit')
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
                <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Your
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Profile</span>
            </h1>
          </div>

          {/* Loading Skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <Skeleton className="h-8 w-1/2 mx-auto" />
                  <Skeleton className="h-5 w-2/3 mx-auto" />
                </div>

                {/* Avatar & name block */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>

                <Skeleton className="h-px w-full" />

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div className="space-y-2" key={i}>
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>

                {/* Footer button */}
                <div className="flex justify-center pt-2">
                  <Skeleton className="h-10 w-32 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <BannedRedirect />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
          {/* Header Section - Matching Sports Page */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
                <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
              Your
              <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Profile</span>
            </h1>
          </div>

          {/* Profile Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-6">
                <div className="text-center pb-6">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">My Profile</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">View and manage your profile information</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-neutral-200 dark:border-neutral-700">
                    <AvatarFallback className="bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-2xl font-bold text-white">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{profile.first_name} {profile.last_name}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">{profile.user_type}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600">
                        {profile.user_type === 'faculty' ? 'Department' : 'Course'}: {profile.course}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {profile.user_type === 'faculty' ? 'ID' : 'PRN'}
                    </p>
                    <p className="font-medium text-neutral-900 dark:text-white">{profile.prn}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {profile.user_type === 'faculty' ? 'Department' : 'Course'}
                    </p>
                    <p className="font-medium text-neutral-900 dark:text-white">{profile.course}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone Number</p>
                    <p className="font-medium text-neutral-900 dark:text-white">{profile.phone_number}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Gender</p>
                    <p className="font-medium text-neutral-900 dark:text-white capitalize">{profile.gender}</p>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <Button size="lg" className="gap-2" onClick={handleEdit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}