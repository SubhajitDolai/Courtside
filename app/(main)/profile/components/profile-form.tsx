'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileForm({ profile }: { profile: any }) {
  const router = useRouter()

  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    prn: profile.prn || '',
    course: profile.course || '',
    gender: profile.gender || '',
    phone_number: profile.phone_number || '',
    user_type: profile.user_type || 'student',
  })

  const [loading, setLoading] = useState(false)
  const { start } = useGlobalLoadingBar()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    start()

    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)

    setLoading(false)

    if (error) {
      console.error(error)
      toast.error('Update failed')
    } else {
      toast.success('Profile updated successfully')
      router.push('/profile')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 rounded-t-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md flex items-center justify-center">
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Profile Settings</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your personal information and preferences</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 border-t-0 rounded-b-md">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">First Name</Label>
                  <Input 
                    name="first_name" 
                    value={form.first_name} 
                    onChange={handleChange} 
                    required 
                    className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Name</Label>
                  <Input 
                    name="last_name" 
                    value={form.last_name} 
                    onChange={handleChange} 
                    required 
                    className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200"
                  />
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">User Type</Label>
                  <Select value={form.user_type} onValueChange={(value) => handleSelectChange('user_type', value)}>
                    <SelectTrigger className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      <SelectItem value="student" className="rounded-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Student</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="faculty" className="rounded-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Faculty</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Gender</Label>
                  <Select value={form.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                    <SelectTrigger className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md">
                      <SelectItem value="male" className="rounded-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Male</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="female" className="rounded-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span>Female</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                  {form.user_type === 'faculty' ? 'Professional Information' : 'Academic Information'}
                </h3>
              </div>

              {/* ID + Course/Department */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {form.user_type === 'faculty' ? 'Employee ID' : 'Student PRN'}
                  </Label>
                  <Input
                    name="prn"
                    value={form.prn}
                    onChange={handleChange}
                    placeholder={form.user_type === 'faculty' ? 'Enter Employee ID' : 'Enter Student PRN'}
                    required
                    className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {form.user_type === 'faculty' ? 'Department' : 'Course/Program'}
                  </Label>
                  <Input
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder={form.user_type === 'faculty' ? 'Enter Department (e.g., Computer Science)' : 'Enter Course Name (e.g., B.Tech CSE)'}
                    required
                    className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200"
                  />
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone Number</Label>
                <Input 
                  name="phone_number" 
                  value={form.phone_number} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter your phone number"
                  className="h-10 border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                className="gap-2" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}