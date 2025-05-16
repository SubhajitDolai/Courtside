'use client'

import dynamic from 'next/dynamic'

// Lazy-load shell with fallback
const SportsShell = dynamic(() => import('./sports-shell'), {
  ssr: false,
  loading: () => <p className="text-center py-20 text-muted-foreground">Loading sports...</p>,
})

export default function SportsClientPage({ sports }: { sports: any[] }) {
  return <SportsShell initialSports={sports} />
}