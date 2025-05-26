"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Smartphone, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  // After mounting, we can safely access the theme and detect device
  React.useEffect(() => {
    setMounted(true)

    // Simple device detection
    const detectDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Set initial device type
    detectDevice()

    // Update on resize
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  // Function to cycle between themes: light → dark → system → light
  const cycleTheme = () => {
    if (!mounted) return

    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Return icon based on current theme with proper setup for animations
  const ThemeIcon = () => {
    if (!mounted) return <Sun className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />

    // Define which icon to show based on current theme
    if (theme === 'light') {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />
    } else if (theme === 'dark') {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />
    } else {
      // Different system icon based on device type
      if (deviceType === 'mobile') {
        return <Smartphone className="h-[1.2rem] w-[1.2rem]" />
      } else if (deviceType === 'tablet') {
        return <Monitor className="h-[1.2rem] w-[1.2rem]" /> // Using Monitor for tablets
      } else {
        return <Laptop className="h-[1.2rem] w-[1.2rem]" />
      }
    }
  }

  // Get tooltip text based on current theme
  const getTooltipText = () => {
    if (!mounted) return "Toggle theme"

    if (theme === 'light') {
      return "Light mode (click for dark)"
    } else if (theme === 'dark') {
      return "Dark mode (click for system)"
    } else {
      return "System theme (click for light)"
    }
  }

  // Add this right before the final return statement
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 rounded-full p-0"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="relative h-9 w-9 rounded-full p-0"
            aria-label={`Current theme: ${theme || 'system'}. Click to cycle themes.`}
          >
            <motion.div
              key={theme} // Force re-render animation when theme changes
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ThemeIcon />
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
