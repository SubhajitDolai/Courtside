'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PencilIcon, Loader2 } from 'lucide-react'

export default function EditButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEdit = () => {
    setLoading(true)
    router.push('/profile/edit')
  }

  return (
    <Button size="lg" className="gap-2" onClick={handleEdit} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
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