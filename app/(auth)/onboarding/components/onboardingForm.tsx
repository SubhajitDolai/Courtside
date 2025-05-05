'use client'

import { completeOnboarding } from '../actions'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, null)

  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-8 lg:px-0">
        <h1 className="text-center text-4xl font-semibold lg:text-5xl">Complete Your Profile</h1>
        <p className="mt-4 text-center">Add your details below to personalize your account and get started!</p>

        <Card className="mx-auto mt-12 max-w-lg p-8 shadow-md sm:p-16">
          <form action={formAction} className="**:[&>label]:block mt-12 space-y-6 *:space-y-3">
            <Input name="first_name" placeholder="First Name" required />
            <Input name="last_name" placeholder="Last Name" required />
            <Input name="prn" placeholder="PRN" required />
            <Input name="course" placeholder="Course" required />

            <select name="gender" required className="border rounded p-2 w-full">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <Button type="submit">Save</Button>

            {state?.error && <p className="text-red-500">{state.error}</p>}
          </form>
        </Card>
      </div>
    </section>
  )
}
