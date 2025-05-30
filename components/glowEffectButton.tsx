
import { ArrowRight, Loader } from 'lucide-react';
import { GlowEffect } from './motion-primitives/glow-effect';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGlobalLoadingBar } from './providers/LoadingBarProvider';

export function GlowEffectButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { start } = useGlobalLoadingBar()

  const handleClick = () => {
    setIsLoading(true)
    start()
    router.push('/assistant')
  }

  return (
    <div className='relative'>
      <GlowEffect
        colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
        mode='colorShift'
        blur='soft'
        duration={3}
        scale={0.9}
      />
      <button className='relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline outline-[#fff2f21f]' onClick={handleClick}>
        {isLoading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          Courtside AI <ArrowRight className='h4 w-4' />
        </>
      )}
      </button>
    </div>
  );
}
