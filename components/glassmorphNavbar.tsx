"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import { useState, useTransition, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { logout } from "@/app/(auth)/login/actions";
import { ModeToggle } from "@/components/modeToggle";
import { useTheme } from "next-themes";

export const navigationItems = [
  { title: "Profile", href: "/profile", items: [] },
  { title: "Sports", href: "/sports", items: [] },
  { title: "My Bookings", href: "/my-bookings", items: [] },
];

export default function GlassmorphNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Loading bar states
  const [loadingBarVisible, setLoadingBarVisible] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressInterval = useRef<number | null>(null);

  // Start loading bar
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

  // Finish loading bar
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
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const navigateWithLoading = (href: string) => {
    if (href === pathname) return; // prevent loading if already on the same page
    startLoadingBar();
    router.push(href);
  };

  const handleLogout = () => {
    startLoadingBar();
    startTransition(async () => {
      toast.info("Logging out...");
      await logout();
      completeLoadingBar();
    });
  };

  if (!mounted) return null;

  return (
    <>
      {/* Loading Bar */}
      {loadingBarVisible && (
        <div className="fixed top-0 left-0 z-[9999] h-[3px] w-full bg-transparent">
          <div
            className={`h-full transition-width duration-300 ease-out ${
              resolvedTheme === "dark"
                ? "bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.6)]"
                : "bg-black shadow-[0_0_12px_2px_rgba(0,0,0,0.5)]"
            }`}
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      <nav className="fixed left-1/2 top-0 z-50 mt-7 flex w-11/12 max-w-7xl -translate-x-1/2 flex-col items-center rounded-md bg-background/20 p-3 backdrop-blur-lg md:rounded-md outline">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigateWithLoading("/")}
              className="p-0 m-0"
              aria-label="Go to homepage"
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
                  style={{ display: "block" }}
                />
              )}
            </button>

            <div className="hidden gap-4 md:flex">
              {navigationItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => navigateWithLoading(item.href)}
                    className={`font-bold transition ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 flex-row items-end">
            <div className="flex gap-3 items-center flex-row">
              <ModeToggle />
              <Button
                onClick={handleLogout}
                variant="default"
                disabled={isPending}
              >
                {isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>

            <div className="md:hidden">
              <Button onClick={() => setIsOpen(!isOpen)}>
                <Menu className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-3 md:hidden">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    setIsOpen(false);
                    navigateWithLoading(item.href);
                  }}
                  className={`font-bold transition ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}