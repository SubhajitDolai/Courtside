'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, GraduationCap, Users, Calendar, Shield, Search } from 'lucide-react'
import AdminToggleButton from './AdminToggleButton'

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

interface AdminSearchResultProps {
  profile: Profile
  onRoleChange: () => void
}

export function AdminSearchResult({ profile, onRoleChange }: AdminSearchResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (profile: Profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return profile.email ? profile.email[0].toUpperCase() : 'U';
  };

  const getDisplayName = (profile: Profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.email || 'Unknown User';
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-500 shrink-0" />
          <span className="truncate">User Profile</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Profile Avatar and Basic Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left shrink-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-3 sm:mb-4">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-xl font-bold">
                {getInitials(profile)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {getDisplayName(profile)}
            </h3>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
              <Badge 
                variant={profile.role === 'admin' ? 'default' : 'secondary'} 
                className={`text-xs ${
                  profile.role === 'admin' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {profile.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                Joined {formatDate(profile.created_at)}
              </Badge>
            </div>

            <div className="w-full">
              <AdminToggleButton
                userId={profile.id}
                currentRole={profile.role}
                userEmail={profile.email || 'Unknown'}
                onRoleChange={onRoleChange}
              />
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
            <div className="grid gap-4 sm:gap-6">
              {/* Contact Information */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  Contact Information
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-3 p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {profile.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <User className="h-4 w-4 text-green-600 dark:text-green-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">User Type</p>
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {profile.user_type || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-3 p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">First Name</p>
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {profile.first_name || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Last Name</p>
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {profile.last_name || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-orange-600 dark:text-orange-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">PRN</p>
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {profile.prn || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 sm:p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <Users className="h-4 w-4 text-red-600 dark:text-red-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Course</p>
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {profile.course || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
