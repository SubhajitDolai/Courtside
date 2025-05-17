// Provides global context (LoadingBarProvider) and hook (useGlobalLoadingBar) to control a shared top loading bar across the app using React Context.

'use client'

import React, { createContext, useContext } from 'react'
import { LoadingBar, useLoadingBar } from '../LoadingBar'

const LoadingBarContext = createContext<{
  start: () => void
  finish: () => void
} | null>(null)

export const useGlobalLoadingBar = () => {
  const context = useContext(LoadingBarContext)
  if (!context) {
    throw new Error('useGlobalLoadingBar must be used within LoadingBarProvider')
  }
  return context
}

export function LoadingBarProvider({ children }: { children: React.ReactNode }) {
  const {
    loadingBarVisible,
    loadingProgress,
    startLoadingBar,
    completeLoadingBar,
  } = useLoadingBar()

  return (
    <LoadingBarContext.Provider
      value={{ start: startLoadingBar, finish: completeLoadingBar }}
    >
      <LoadingBar visible={loadingBarVisible} progress={loadingProgress} />
      {children}
    </LoadingBarContext.Provider>
  )
}