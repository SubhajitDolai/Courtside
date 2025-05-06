
'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

export default function Logo() {
    const { resolvedTheme } = useTheme()

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
