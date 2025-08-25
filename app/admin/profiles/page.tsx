'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Shield, Users, Search, UserCheck, UserX, Mail, Calendar, Loader, X, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { AdminSearchResult } from './components/AdminSearchResult'
import AdminToggleButton from './components/AdminToggleButton'
import { useSuperAdmin } from '@/hooks/useSuperAdmin'
import { UnauthorizedAccess } from '@/components/UnauthorizedAccess'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  prn: string | null
  course: string | null
  gender: string | null
  user_type: string | null
  role: string
  created_at: string
}

export default function AdminProfilesPage() {
  // All hooks must be at the top before any conditional logic
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null>(null)
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [removeAdminId, setRemoveAdminId] = useState<string | null>(null)
  const [removingAdmin, setRemovingAdmin] = useState(false)
  
  const supabase = createClient()

  const fetchAdminProfiles = useCallback(async () => {
    try {
      setAdminLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })

      if (error) throw error
      setAdminProfiles(data || [])
    } catch (error) {
      console.error('Error fetching admin profiles:', error)
      toast.error('Failed to load admin profiles')
    } finally {
      setAdminLoading(false)
    }
  }, [supabase])

  const searchProfile = useCallback(async (email: string) => {
    if (!email.trim()) {
      setSearchResult(null)
      setSearchPerformed(false)
      return
    }

    try {
      setSearching(true)
      setSearchPerformed(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setSearchResult(null)
          toast.error('No user found with this email address')
        } else {
          throw error
        }
        return
      }

      setSearchResult(data)
    } catch (error) {
      console.error('Error searching profile:', error)
      toast.error('Error searching for user')
      setSearchResult(null)
    } finally {
      setSearching(false)
    }
  }, [supabase])

  const handleRoleChange = useCallback(() => {
    // Refresh both search result and admin list
    if (searchResult) {
      searchProfile(searchResult.email || '')
    }
    fetchAdminProfiles()
  }, [searchResult, searchProfile, fetchAdminProfiles])

  // Memoize admin stats for performance
  const adminStats = useMemo(() => ({
    totalAdmins: adminProfiles.length,
    recentAdmins: adminProfiles.filter(admin => {
      const createdDate = new Date(admin.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate > weekAgo
    }).length
  }), [adminProfiles])

  // Fetch admin profiles on mount
  useEffect(() => {
    if (isSuperAdmin && !superAdminLoading) {
      fetchAdminProfiles()
    }
  }, [fetchAdminProfiles, isSuperAdmin, superAdminLoading])

  // Show loading while checking super admin status
  if (superAdminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-purple-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="animate-spin text-purple-600 dark:text-purple-400 h-6 w-6" />
          <p className="text-muted-foreground font-medium">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized if not super admin
  if (!isSuperAdmin) {
    return <UnauthorizedAccess />
  }

  const handleSearch = () => {
    searchProfile(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleRemoveAdmin = async () => {
    if (!removeAdminId) return
    
    setRemovingAdmin(true)
    
    try {
      const adminToRemove = adminProfiles.find(admin => admin.id === removeAdminId)
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', removeAdminId)
      
      if (error) throw error
      
      toast.success(`Removed admin access for ${adminToRemove?.email}`)
      fetchAdminProfiles()
      
      // If this was the searched user, update search result too
      if (searchResult?.id === removeAdminId) {
        setSearchResult({...searchResult, role: 'user'})
      }
      
    } catch (error) {
      console.error('Error removing admin:', error)
      toast.error('Failed to remove admin access')
    } finally {
      setRemovingAdmin(false)
      setRemoveAdminId(null)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResult(null)
    setSearchPerformed(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (profile: Profile) => {
    if (profile.first_name?.[0] && profile.last_name?.[0]) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return profile.email?.[0]?.toUpperCase() || 'U'
  }

  const getDisplayName = (profile: Profile) => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    return fullName || profile.email?.split('@')[0] || 'Unknown User'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-purple-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950/20">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 pt-28 sm:pt-32">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl bg-gradient-to-br from-purple-600 to-blue-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3 sm:mb-4 lg:mb-6 px-2">
            Admin
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-300 bg-clip-text text-transparent"> Management</span>
          </h1>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/20 w-full sm:w-auto justify-center sm:justify-start">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-500 shrink-0" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                <span className="hidden sm:inline">{adminStats.totalAdmins} Active Admins</span>
                <span className="sm:hidden">{adminStats.totalAdmins} Admins</span>
              </span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-700/20 w-full sm:w-auto justify-center sm:justify-start">
              <UserCheck className="h-4 w-4 text-green-600 dark:text-green-500 shrink-0" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                <span className="hidden sm:inline">{adminStats.recentAdmins} Added This Week</span>
                <span className="sm:hidden">{adminStats.recentAdmins} Recent</span>
              </span>
            </div>

            <Button
              onClick={fetchAdminProfiles}
              variant="outline"
              size="sm"
              disabled={adminLoading}
              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 w-full sm:w-auto"
            >
              {adminLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Search Section */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm order-1 lg:order-1">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-500 shrink-0" />
                <span className="truncate">Search User by Email</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Enter email address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-purple-500 dark:focus:border-purple-400 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-2">
                    <Button
                      onClick={handleSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
                    >
                      {searching ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-4 w-4 sm:mr-0" />
                          <span className="ml-2 sm:hidden">Search</span>
                        </>
                      )}
                    </Button>
                    {(searchQuery || searchResult) && (
                      <Button
                        onClick={clearSearch}
                        variant="outline"
                        size="icon"
                        className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {searching && (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="flex items-center gap-3">
                      <Loader className="animate-spin text-purple-600 dark:text-purple-400 h-5 w-5" />
                      <p className="text-muted-foreground font-medium text-sm sm:text-base">Searching...</p>
                    </div>
                  </div>
                )}

                {!searching && !searchPerformed && !searchResult && (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <Search className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      Search for Users
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm sm:text-base leading-relaxed">
                      Enter an email address above and click search to find users and manage their admin privileges.
                    </p>
                  </div>
                )}

                {!searching && searchPerformed && !searchResult && (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      No user found
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm sm:text-base leading-relaxed">
                      No user found with that email address. Please check the email and try again.
                    </p>
                  </div>
                )}

                {searchResult && (
                  <AdminSearchResult
                    profile={searchResult}
                    onRoleChange={handleRoleChange}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Admins Section */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm order-2 lg:order-2">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-500 shrink-0" />
                <span className="truncate">Current Admins</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {adminLoading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                        <Skeleton className="h-2 sm:h-3 w-32 sm:w-48" />
                      </div>
                      <Skeleton className="h-6 w-16 sm:h-8 sm:w-20 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : !adminProfiles.length ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    No admins found
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Search for users above to grant admin access.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {adminProfiles.map((admin, index) => (
                    <div
                      key={admin.id}
                      className={`
                        flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg
                        hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200
                        ${index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-800/30'}
                      `}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs sm:text-sm font-semibold">
                            {getInitials(admin)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base truncate">
                              {getDisplayName(admin)}
                            </h3>
                            <Badge
                              variant="outline"
                              className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200 dark:border-green-700 self-start sm:self-auto shrink-0"
                            >
                              <Shield className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                              <span className="text-xs">Admin</span>
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{admin.email}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3" />
                              <span className="whitespace-nowrap">Since {formatDate(admin.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end sm:justify-center shrink-0">
                        <AdminToggleButton
                          userId={admin.id}
                          currentRole={admin.role}
                          userEmail={admin.email || 'Unknown'}
                          onRoleChange={handleRoleChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={removeAdminId !== null} onOpenChange={(o) => !removingAdmin && setRemoveAdminId(o ? removeAdminId : null)}>
        <AlertDialogContent className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 dark:text-white">Remove Admin Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove administrator privileges for this user. They will still have access to the system as a regular user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={removingAdmin}
              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              disabled={removingAdmin}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {removingAdmin ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Yes, remove admin'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
