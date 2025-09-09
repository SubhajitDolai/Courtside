'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, User, Mail, Hash, X, UserX, Loader } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  prn: string | null
  email: string | null
  course: string | null
  gender: string | null
  user_type: string | null
  role: string
  created_at: string
}

interface BookingActivity {
  id: string
  booking_date: string
  seat_number: number | null
  status: string
  checked_in_at: string | null
  checked_out_at: string | null
  created_at: string
  sport_name: string
  sport_image: string | null
  start_time: string
  end_time: string
}

interface UserSearchProps {
  onUserSelect: (user: Profile, activities: BookingActivity[]) => void
  onClear: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export default function UserSearch({ onUserSelect, onClear, setLoading }: UserSearchProps) {
  const [searchType, setSearchType] = useState<'name' | 'prn' | 'email'>('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  
  const supabase = createClient()

  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    try {
      setSearching(true)
      setSearchPerformed(true)
      
      let query = supabase
        .from('profiles')
        .select('*')
        .limit(10) // Limit to prevent too many results

      // Build query based on search type
      switch (searchType) {
        case 'name':
          // Search in both first_name and last_name
          query = query.or(`first_name.ilike.%${searchQuery.trim()}%,last_name.ilike.%${searchQuery.trim()}%`)
          break
        case 'prn':
          query = query.ilike('prn', `%${searchQuery.trim()}%`)
          break
        case 'email':
          query = query.ilike('email', `%${searchQuery.trim()}%`)
          break
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setSearchResults(data || [])
      
      if (!data || data.length === 0) {
        toast.info('No users found matching your search')
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Error searching for users')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [searchQuery, searchType, supabase])

  const fetchUserActivity = async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings_history')
        .select(`
          id,
          booking_date,
          seat_number,
          status,
          checked_in_at,
          checked_out_at,
          created_at,
          sports!inner(name, image_url),
          slots!inner(start_time, end_time)
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activities: BookingActivity[] = (data || []).map((item: any) => ({
        id: item.id,
        booking_date: item.booking_date,
        seat_number: item.seat_number,
        status: item.status,
        checked_in_at: item.checked_in_at,
        checked_out_at: item.checked_out_at,
        created_at: item.created_at,
        sport_name: item.sports?.name || 'Unknown',
        sport_image: item.sports?.image_url || null,
        start_time: item.slots?.start_time || '',
        end_time: item.slots?.end_time || ''
      }))

      return activities
    } catch (error) {
      console.error('Error fetching user activity:', error)
      toast.error('Error loading user activity')
      return []
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = async (user: Profile) => {
    const activities = await fetchUserActivity(user.id)
    onUserSelect(user, activities)
    
    // Clear search results after selection
    setSearchResults([])
    setSearchPerformed(false)
  }

  const handleSearch = () => {
    searchUsers()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchPerformed(false)
    onClear()
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
    <div className="space-y-4">
      {/* Search Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="search-type" className="text-sm font-medium">
          Search by
        </Label>
        <Select value={searchType} onValueChange={(value: 'name' | 'prn' | 'email') => setSearchType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="prn">PRN</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search-query" className="text-sm font-medium">
          {searchType === 'name' ? 'Enter name' : searchType === 'prn' ? 'Enter PRN' : 'Enter email'}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="search-query"
              placeholder={
                searchType === 'name' 
                  ? 'e.g. John Doe' 
                  : searchType === 'prn' 
                    ? 'e.g. 12345' 
                    : 'e.g. john@example.com'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 border-neutral-200 dark:border-neutral-700 focus:border-cyan-500 dark:focus:border-cyan-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4"
          >
            {searching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          {(searchQuery || searchResults.length > 0) && (
            <Button
              onClick={clearSearch}
              variant="outline"
              size="icon"
              className="border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searching && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <Loader className="animate-spin text-cyan-600 dark:text-cyan-400 h-5 w-5" />
            <p className="text-muted-foreground font-medium">Searching users...</p>
          </div>
        </div>
      )}

      {!searching && searchPerformed && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-xl flex items-center justify-center">
            <UserX className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
            No users found
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            No users found matching your search criteria. Try a different search term.
          </p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
              Search Results ({searchResults.length})
            </h3>
            <Button
              onClick={clearSearch}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((user) => (
              <Card
                key={user.id}
                className="p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-200 border border-neutral-200 dark:border-neutral-700"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-semibold">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                        {getDisplayName(user)}
                      </h4>
                      {user.role === 'admin' && (
                        <Badge variant="outline" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      {user.prn && (
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>PRN: {user.prn}</span>
                        </div>
                      )}
                      {user.course && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{user.course}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
