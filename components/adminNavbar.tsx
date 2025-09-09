"use client";

import { Menu, LogOut, User, X, Mail, Home, Trophy, ClipboardList, Clock, ChevronDown, History, Settings, MessageSquare, QrCode, Bell } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useTransition, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { logout } from "@/app/(auth)/login/actions";
import { ModeToggle } from "@/components/modeToggle";
import { useTheme } from "next-themes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Categorized navigation items
export const navigationItems = [
  {
    title: "Management",
    category: "management",
    icon: Settings,
    items: [
      { title: "Sports", href: "/admin/sports", icon: Trophy },
      { title: "Slots", href: "/admin/slots", icon: Clock },
      { title: "Notifications", href: "/admin/notifications", icon: Bell },
      { title: "Admin Profiles", href: "/admin/profiles", icon: User },
    ]
  },
  {
    title: "Bookings",
    category: "bookings",
    icon: ClipboardList,
    items: [
      { title: "Active Bookings", href: "/admin/bookings", icon: ClipboardList },
      { title: "QR Scanner", href: "/admin/qr-scanner", icon: QrCode },
    ]
  },
  {
    title: "Analytics",
    category: "reports",
    icon: History,
    items: [
      { title: "Bookings History", href: "/admin/bookings-history", icon: History },
      { title: "User Activity", href: "/admin/user-activity", icon: User },
      { title: "User Feedback", href: "/admin/feedback", icon: MessageSquare },
    ]
  },
];

export default function AdminNavbar() {
  const { user, loading } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [loadingBarVisible, setLoadingBarVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  const startLoadingBar = () => {
    setLoadingBarVisible(true);
    setLoadingProgress(0);
    progressInterval.current = window.setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval.current!);
          progressInterval.current = null;
          return 80;
        }
        return prev + 1;
      });
    }, 15);
  };

  const completeLoadingBar = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setLoadingProgress(100);
    setTimeout(() => {
      setLoadingBarVisible(false);
      setLoadingProgress(0);
    }, 300);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loadingBarVisible) {
      completeLoadingBar();
    }
    setIsOpen(false);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("button[aria-label='Toggle menu']")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigateWithLoading = (href: string) => {
    if (href === pathname || (pathname === "/admin" && href === "/admin/")) {
      // If already on page, finish any loading quickly
      completeLoadingBar();
      return;
    }

    startLoadingBar();
    router.push(href);
  };

  const handleLogout = () => {
    startLoadingBar();
    startTransition(async () => {
      toast.info("Logging out...");
      try {
        await logout();
      } finally {
        completeLoadingBar();
      }
    });
  };

  // Calculate user display info from the useCurrentUser hook - consistent with GlassmorphNavbar
  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
  const userDisplayName = loading ? "Loading..." : userName || (user?.email?.split('@')[0] || "");

  // Improved user initials logic to match GlassmorphNavbar
  const userInitials = !loading && user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || (user.email?.[0] || '').toUpperCase()
    : "";

  // Function to check if a nav item is active
  const isActive = (href: string) => {
    // Special case for dashboard
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/";
    }

    // For other routes, use exact match or proper path segments
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (!mounted) return null;

  return (
    <>
      {/* Loading Bar */}
      {loadingBarVisible && (
        <div className="fixed top-0 left-0 z-[9999] h-[3px] w-full bg-transparent">
          <div
            className={`h-full transition-all duration-300 ease-out ${resolvedTheme === "dark"
              ? "bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.6)]"
              : "bg-black shadow-[0_0_12px_2px_rgba(0,0,0,0.5)]"
              }`}
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      <nav className="fixed left-1/2 top-0 z-50 mt-7 flex w-11/12 max-w-7xl -translate-x-1/2 flex-col items-center rounded-md bg-background/20 p-3 backdrop-blur-lg md:rounded-md shadow-md border border-border/40">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigateWithLoading("/admin")}
              className="p-0 m-0 transition-transform hover:scale-105"
              aria-label="Go to admin dashboard"
            >
              {resolvedTheme && (
                <Image
                  src={
                    resolvedTheme === "light"
                      ? "/logo-dark.webp"
                      : "/logo-light.webp"
                  }
                  alt="Logo"
                  width={100}
                  height={50}
                  style={{
                    display: "block",
                    width: "auto",
                    height: "auto"
                  }}
                  className="object-contain"
                />
              )}
            </button>

            <div className="hidden md:block">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  {navigationItems.map((category) => (
                    <NavigationMenuItem key={category.title}>
                      <NavigationMenuTrigger
                        className={cn(
                          category.items.some(item => isActive(item.href))
                            ? "text-primary"
                            : ""
                        )}
                      >
                        {category.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[300px] gap-2">
                          {category.items.map((item) => (
                            <li key={item.href}>
                              <NavigationMenuLink asChild>
                                <button
                                  onClick={() => navigateWithLoading(item.href)}
                                  className={cn(
                                    "block w-full select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    isActive(item.href)
                                      ? "bg-accent text-accent-foreground"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {item.icon && <item.icon className="size-4" />}
                                    <span className="text-sm font-medium">{item.title}</span>
                                  </div>
                                </button>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="flex gap-3 flex-row items-center">
            <div className="hidden md:flex items-center gap-3">
              <ModeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1 h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-sm text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/80 backdrop-blur-lg border border-border/40 shadow-md">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <User className="size-4" />
                    {userDisplayName}
                  </DropdownMenuLabel>
                  {user?.email && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center">
                      <Mail className="mr-2 size-3" />
                      {user.email}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigateWithLoading("/")}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Back to Site
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4 text-destructive" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden flex items-center gap-3">
              <ModeToggle />
              <Button
                onClick={toggleMobileMenu}
                size="icon"
                variant="ghost"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden w-full overflow-hidden"
            >
              <div className="flex flex-col space-y-1 pt-4 pb-2">
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-sm text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{userDisplayName}</span>
                    {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                  </div>
                </div>

                {/* Mobile Admin Categories */}
                {navigationItems.map((category) => (
                  <div key={category.title} className="py-1">
                    <button
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2",
                        "text-left font-medium",
                        activeCategory === category.title ? "bg-accent text-accent-foreground" : ""
                      )}
                      onClick={() => setActiveCategory(
                        activeCategory === category.title ? null : category.title
                      )}
                    >
                      <div className="flex items-center">
                        {category.icon && <category.icon className="mr-2 size-4" />}
                        {category.title}
                      </div>
                      <ChevronDown className={cn(
                        "size-4 transition-transform",
                        activeCategory === category.title ? "rotate-180" : ""
                      )} />
                    </button>

                    <AnimatePresence>
                      {activeCategory === category.title && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {category.items.map((item) => (
                            <button
                              key={item.href}
                              onClick={() => {
                                setIsOpen(false);
                                navigateWithLoading(item.href);
                              }}
                              className={cn(
                                "w-full text-left px-8 py-2 text-sm flex items-center",
                                isActive(item.href)
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {item.icon && <item.icon className="mr-2 size-4" />}
                              {item.title}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigateWithLoading("/");
                  }}
                  className="flex items-center text-left px-4 py-2 text-muted-foreground"
                >
                  <Home className="mr-2 size-4" />
                  Back to Site
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center text-left gap-2 px-4 py-3 text-destructive font-medium mt-2"
                >
                  <LogOut className="size-4 text-destructive" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}