'use client'

import { useState, useTransition, useActionState } from 'react'
import { completeOnboarding } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader } from 'lucide-react'

export function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, null)
  const [pending, startTransition] = useTransition()

  // 🧠 Track selected user type
  const [userType, setUserType] = useState<'' | 'student' | 'faculty'>('')
  const [gender, setGender] = useState('')
  // Track form error for required dropdowns
  const [formError, setFormError] = useState<string | null>(null)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-6 sm:px-8 py-6 sm:py-8 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white text-center">
            Set Up Your Profile
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 text-center mt-2">
            This information helps us provide you with the best experience
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6 sm:py-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!userType || !gender) {
                setFormError('Please select your account type and gender to continue.');
                return;
              }
              setFormError(null);
              startTransition(() => formAction(new FormData(event.currentTarget)));
            }}
            className="space-y-6"
          >
            {/* Names Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                Personal Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="Enter your first name"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Enter your last name"
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* User Type Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                Account Type
              </div>
              <div className="space-y-2">
                <Label>I am a</Label>
                <Select
                  value={userType}
                  onValueChange={(value) => setUserType(value as 'student' | 'faculty')}
                  required
                >
                  <SelectTrigger className="h-11 w-full border-2 py-5" aria-required="true">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty Member</SelectItem>
                  </SelectContent>
                </Select>
                {/* Hidden input for form submission */}
                <input type="hidden" name="user_type" value={userType} />
              </div>
            </div>

            {/* Conditional Academic Info */}
            {userType && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  Academic Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prn">
                      {userType === 'faculty' ? 'Faculty ID' : 'Student PRN'}
                    </Label>
                    <Input
                      id="prn"
                      name="prn"
                      placeholder={userType === 'faculty' ? 'Enter your faculty ID' : 'Enter your PRN'}
                      required
                      className="h-11 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">
                      {userType === 'faculty' ? 'Department' : 'Course'}
                    </Label>
                    <Input
                      id="course"
                      name="course"
                      placeholder={userType === 'faculty' ? 'e.g., Registrar office' : 'e.g., B.Tech CSE'}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Personal Section */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                Contact & Personal
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    placeholder="Enter your phone number"
                    required
                    className="h-11"
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={gender}
                    onValueChange={setGender}
                    required
                  >
                    <SelectTrigger className="h-11 w-full border-2 py-5" aria-required="true">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Hidden input for form submission */}
                  <input type="hidden" name="gender" value={gender} />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {state?.error && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                <p className="text-rose-600 dark:text-rose-400 text-sm font-medium text-center">
                  {state.error}
                </p>
              </div>
            )}
            {/* Form error for required dropdowns */}
            {formError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                <p className="text-rose-600 dark:text-rose-400 text-sm font-medium text-center">
                  {formError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={pending}
                size="lg"
              >
                {pending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}