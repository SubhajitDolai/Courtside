import { checkProfile } from '@/lib/check-profile'

export default async function SportsPage() {
  await checkProfile()

  return <div>Sports page content...</div>
}