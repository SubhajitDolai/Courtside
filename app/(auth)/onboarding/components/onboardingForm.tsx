'use client'

import { useState, useTransition, useActionState } from 'react'
import { completeOnboarding } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader } from 'lucide-react'

export function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, null)
  const [pending, startTransition] = useTransition()

  // 🧠 Track selected user type
  const [userType, setUserType] = useState<'' | 'student' | 'faculty'>('')

  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-8 lg:px-0">
        <h1 className="text-center text-4xl font-semibold lg:text-5xl">Complete Your Profile</h1>
        <p className="mt-4 text-center text-muted-foreground">
          Add your details below to personalize your account and get started!
        </p>

        <Card className="mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16">
          <form action={(formData) => startTransition(() => formAction(formData))} className="space-y-6">
            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="first_name" placeholder="First Name" required />
              <Input name="last_name" placeholder="Last Name" required />
            </div>

            {/* User Type */}
            <select
              name="user_type"
              required
              className="border rounded p-2 w-full"
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'student' | 'faculty')}
            >
              <option value="" disabled>Select User Type</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>

            {/* Show PRN/ID and Course/Department only after selecting user type */}
            {userType && (
              <>
                <Input
                  name="prn"
                  placeholder={userType === 'faculty' ? 'ID' : 'PRN'}
                  required
                />
                <Input
                  name="course"
                  placeholder={userType === 'faculty' ? 'Department' : 'Course'}
                  required
                />
              </>
            )}

            {/* Phone */}
            <Input name="phone_number" placeholder="Phone Number" required />

            {/* Gender */}
            <select name="gender" required className="border rounded p-2 w-full">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>

            {/* Error message */}
            {state?.error && <p className="text-red-500 text-center">{state.error}</p>}
          </form>
        </Card>
      </div>
    </section>
  )
}
