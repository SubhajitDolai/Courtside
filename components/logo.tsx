'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

export default function Logo() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Set the mounted state to true once the component has mounted on the client-side
    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent rendering the image and text until the component has mounted
    if (!mounted) return null

    return (
        <div className='flex items-center space-x-2'>
            <Image
                src={resolvedTheme === 'light' ? '/logo-dark.png' : '/logo-light.png'}
                alt="Logo"
                width={100}
                height={50}
            />
            <span className="text-xl font-bold">Courtside</span>
        </div>
    )
}
