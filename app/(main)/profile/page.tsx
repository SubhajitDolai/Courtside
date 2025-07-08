'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { PencilIcon, User, Loader } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

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
            {/* Header Section Skeleton */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 rounded-t-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full animate-pulse bg-neutral-200 dark:bg-neutral-700 flex-shrink-0"></div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
                    <Skeleton className="h-3 sm:h-4 w-40 sm:w-64" />
                  </div>
                </div>
                <Skeleton className="h-8 sm:h-10 w-12 sm:w-32 rounded-md flex-shrink-0" />
              </div>
            </div>

            {/* Form Section Skeleton */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 border-t-0 rounded-b-md">
              <div className="p-8 space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 rounded-md animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                </div>

                {/* Account Type Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 rounded-md animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                </div>

                {/* Academic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 rounded-md animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 rounded-md animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
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
            {/* Header Section */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 rounded-t-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm sm:text-base font-medium">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl font-semibold text-neutral-900 dark:text-white truncate">
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                      Personal information and preferences
                    </p>
                  </div>
                </div>
                
                <Button 
                  className="gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0 cursor-pointer" 
                  onClick={handleEdit} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden sm:inline">Loading...</span>
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 border-t-0 rounded-b-md">
              <div className="p-8 space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Personal Information</h3>
                  </div>

                  {/* Names */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">First Name</p>
                      <p className="text-lg font-medium text-neutral-900 dark:text-white">
                        {profile.first_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Last Name</p>
                      <p className="text-lg font-medium text-neutral-900 dark:text-white">
                        {profile.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Type Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Account Type</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* User Type */}
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">User Type</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${profile.user_type === 'student' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <p className="text-lg font-medium text-neutral-900 dark:text-white capitalize">
                          {profile.user_type}
                        </p>
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Gender</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${profile.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                        <p className="text-lg font-medium text-neutral-900 dark:text-white capitalize">
                          {profile.gender}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {profile.user_type === 'faculty' ? 'Professional Information' : 'Academic Information'}
                    </h3>
                  </div>

                  {/* ID + Course/Department */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {profile.user_type === 'faculty' ? 'Employee ID' : 'Student PRN'}
                      </p>
                      <p className="text-lg font-medium text-neutral-900 dark:text-white font-mono">
                        {profile.prn}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {profile.user_type === 'faculty' ? 'Department' : 'Course/Program'}
                      </p>
                      <p className="text-lg font-medium text-neutral-900 dark:text-white">
                        {profile.course}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="w-8 h-8 border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Contact Information</h3>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Phone Number</p>
                    <p className="text-lg font-medium text-neutral-900 dark:text-white">
                      {profile.phone_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}