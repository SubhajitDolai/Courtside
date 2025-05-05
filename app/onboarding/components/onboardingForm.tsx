'use client'

import { completeOnboarding } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'

export function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, null)

  return (
    <form action={formAction} className="space-y-4">
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
  )
}