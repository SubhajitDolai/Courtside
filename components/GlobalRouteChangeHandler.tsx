// This file listens for the route change, when the route changes it 'finish' the loading bar
// Listens for route changes via pathname, and calls finish() to complete the global loading bar after navigation (ignoring the first render).

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useGlobalLoadingBar } from './providers/LoadingBarProvider'


export function GlobalRouteChangeHandler() {
  const pathname = usePathname()
  const firstRender = useRef(true)
  const { finish } = useGlobalLoadingBar()

  useEffect(() => {
    // Skip finish() on first render
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    // Called when route has changed
    finish()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}