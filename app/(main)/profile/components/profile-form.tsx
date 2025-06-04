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
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-6">
        <div className="text-center pb-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Edit Your Profile</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input name="first_name" value={form.first_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          {/* User Type */}
          <div className="space-y-2">
            <Label>User Type</Label>
            <Select value={form.user_type} onValueChange={(value) => handleSelectChange('user_type', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PRN or ID + Course or Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{form.user_type === 'faculty' ? 'ID' : 'PRN'}</Label>
              <Input
                name="prn"
                value={form.prn}
                onChange={handleChange}
                placeholder={form.user_type === 'faculty' ? 'Faculty ID' : 'Student PRN'}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{form.user_type === 'faculty' ? 'Department' : 'Course'}</Label>
              <Input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder={form.user_type === 'faculty' ? 'Department' : 'Course'}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input name="phone_number" value={form.phone_number} onChange={handleChange} required />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}