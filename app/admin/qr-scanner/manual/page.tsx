'use client'

import React from "react";
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useGlobalLoadingBar } from '@/components/providers/LoadingBarProvider'
import { QrCode, Wifi, Construction, ArrowLeft, Zap } from 'lucide-react'

export default function ManualQRScannerPage() {
  const router = useRouter()
  const { start } = useGlobalLoadingBar()

  const handleGoBack = () => {
    start()
    router.push('/admin/qr-scanner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-28 sm:pt-32">

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div
              className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg sm:shadow-xl md:shadow-2xl"
              onClick={handleGoBack}
            >
              <QrCode className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4 sm:mb-6">
            IoT
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent"> Scanner</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground">
            Connect IoT devices for automated scanning
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">Laser Scanner</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                Laser Scanner Integration
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                Connect handheld laser scanner guns and barcode readers to automatically scan QR codes and process check-ins/check-outs. Perfect for staff-operated entry points and fast scanning.
              </p>

              <div className="space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <QrCode className="h-4 w-4 flex-shrink-0" />
                    <span>Handheld laser scanner guns</span>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <Wifi className="h-4 w-4 flex-shrink-0" />
                    <span>USB/Wireless barcode readers</span>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <Zap className="h-4 w-4 flex-shrink-0" />
                    <span>Fast professional scanning</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleGoBack}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Scanner Options
                </Button>

                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <Construction className="h-4 w-4" />
                    <span>Coming Soon - Laser Scanner API</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}