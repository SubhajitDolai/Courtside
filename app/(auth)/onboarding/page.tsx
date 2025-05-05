
import { checkAuth } from '@/lib/auth'
import { OnboardingForm } from './components/onboardingForm'

export default async function OnboardingPage() {
  // Make sure user is logged in
  await checkAuth()

  return (
    <div>
      <OnboardingForm />
    </div>
  )
}