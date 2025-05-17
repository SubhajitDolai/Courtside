'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider' // import loadingbar

export default function BookNowButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { start } = useGlobalLoadingBar() // create state start and finish

  const handleClick = () => {
    setIsLoading(true)
    start() // call start when clicked
    router.push('/sports')
  }

  return (
    <Button
      size="lg"
      className="rounded-xl px-5 text-base"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Book now'
      )}
    </Button>
  )
}
