
import { checkAuth } from '@/lib/auth'
import { OnboardingForm } from './components/onboardingForm'

export default async function OnboardingPage() {
  // Make sure user is logged in
  await checkAuth()

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <OnboardingForm />
    </div>
  )
}