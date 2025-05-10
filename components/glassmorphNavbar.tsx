"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { usePathname } from "next/navigation"; // ✅ get current path

import { Button } from "./ui/button";
import { toast } from "sonner";
import { logout } from "@/app/(auth)/login/actions";
import { ModeToggle } from "@/components/modeToggle";
import { useTheme } from "next-themes";

export const navigationItems = [
  { title: "Profile", href: "/profile", items: [] },
  { title: "Sports", href: "/sports", items: [] },
  { title: "My Bookings", href: "/my-bookings", items: [] },
  { title: "Admin", href: "/admin", items: [] },
];

export default function GlassmorphNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname(); // ✅ get current page path
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      toast.info("Logging out...");
      await logout();
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="fixed left-1/2 top-0 z-50 mt-7 flex w-11/12 max-w-7xl -translate-x-1/2 flex-col items-center rounded-md bg-background/20 p-3 backdrop-blur-lg md:rounded-md outline">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/">
            {resolvedTheme && (
              <Image
                src={resolvedTheme === "light" ? "/logo-dark.png" : "/logo-light.png"}
                alt="Logo"
                width={100}
                height={50}
              />
            )}
          </Link>

          {/* ✅ Desktop Nav */}
          <div className="hidden gap-4 md:flex">
            {navigationItems.map((item) => {
              // ✅ highlight if current path starts with item's href
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-bold transition ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 flex-row items-end">
          <div className="flex gap-3 items-center flex-row">
            <ModeToggle />
            <Button onClick={handleLogout} variant="default" disabled={isPending}>
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

      {/* ✅ Mobile Nav */}
      {isOpen && (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-3 md:hidden">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`font-bold transition ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}