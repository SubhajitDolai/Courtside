'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileForm({ profile }: { profile: any }) {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    prn: profile.prn || '',
    course: profile.course || '',
    gender: profile.gender || '',
    phone_number: profile.phone_number || '',
    user_type: profile.user_type || 'student', // Include user_type
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(form).eq('id', profile.id)

    setLoading(false)

    if (error) {
      console.error(error);
      toast.error('Update failed');
    } else {
      toast.success('Profile updated successfully.');
      router.push('/profile');
    }
  }

  return (
    <Card className="p-6 space-y-6">
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
          <select
            name="user_type"
            value={form.user_type}
            onChange={handleChange}
            required
            className="border rounded p-2 w-full"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>

        {/* PRN or ID + Course or Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{form.user_type === 'faculty' ? 'ID' : 'PRN'}</Label>
            <Input
              name="prn"
              value={form.prn}
              onChange={handleChange}
              placeholder={form.user_type === 'faculty' ? 'ID' : 'PRN'}
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
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="border rounded p-2 w-full"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Card>
  )
}
