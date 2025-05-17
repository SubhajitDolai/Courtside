'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PencilIcon, Loader } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export default function EditButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { start } = useGlobalLoadingBar()

  const handleEdit = () => {
    setLoading(true)
    start()
    router.push('/profile/edit')
  }

  return (
    <Button size="lg" className="gap-2" onClick={handleEdit} disabled={loading}>
      {loading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <PencilIcon className="h-4 w-4" />
          Edit Profile
        </>
      )}
    </Button>
  )
}