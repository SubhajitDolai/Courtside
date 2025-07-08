'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Camera, QrCode, ArrowRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'

export default function QRScannerPage() {
  const router = useRouter()
  const { start } = useGlobalLoadingBar()

  const handleGoBack = () => {
    start()
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">
        
        {/* Header Section - Matching My Bookings Page */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div 
              className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-800 dark:from-neutral-600 dark:to-neutral-700 text-white shadow-lg sm:shadow-xl md:shadow-2xl"
              onClick={handleGoBack}
            >
              <QrCode className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            QR
            <span className="bg-gradient-to-r from-neutral-700 to-neutral-600 dark:from-neutral-400 dark:to-neutral-300 bg-clip-text text-transparent"> Scanner</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground">
            Choose your preferred scanning method
          </p>
        </div>

        {/* Scanner Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Camera Scanner */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-neutral-900 dark:to-blue-950/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="text-center pb-4 relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Camera className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl font-semibold">Camera Scanner</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-6 relative">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use your device camera to scan QR codes directly from user screens
              </p>
              
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Real-time scanning
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Instant verification
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  No typing required
                </div>
              </div>
              
              <Button asChild 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:grayscale-25 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={start}
              >
                <Link href="/admin/qr-scanner/camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Open Camera Scanner
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* IoT Laser Scanner */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-emerald-50/50 dark:from-neutral-900 dark:to-emerald-950/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="text-center pb-4 relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-xl font-semibold">IoT Laser Scanner</CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-6 relative">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automated laser scanner for hands-free QR code detection and instant check-in/out
              </p>
              
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Automatic laser scanning
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Hands-free operation
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  IoT device integration
                </div>
              </div>
              
              <Button asChild 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:grayscale-25 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={start}
              >
                <Link href="/admin/qr-scanner/iot" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Open IoT Scanner
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="border-0 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4 text-center flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">Fast Check-in</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">QR Compatible</span>
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">IoT Laser Scanner</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}