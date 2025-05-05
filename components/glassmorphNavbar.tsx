
"use client";

import { LayoutGrid, Menu, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "./ui/button";

import { logout } from "@/app/(auth)/login/actions";
import { ModeToggle } from "@/components/modeToggle";
import { useTheme } from "next-themes";

export const navigationItems = [
  {
    title: "Home",
    href: "/",
    items: [],
  },
  {
    title: "Sports",
    href: "/sports",
    items: [],
  },
  // {
  //   title: "Onboarding",
  //   href: "/onboarding",
  //   items: [],
  // },
];

export default function GlassmorphNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <nav
      className="fixed left-1/2 top-0 z-50 mt-7 flex w-11/12 max-w-7xl -translate-x-1/2 flex-col items-center rounded-md bg-background/20 p-3 backdrop-blur-lg md:rounded-md outline"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/">
            <Image
              src={resolvedTheme === 'light' ? "/logo-dark.png" : "/logo-light.png" }
              alt="Logo"
              width={100}
              height={50}
            />
          </Link>

          <div className="hidden gap-4 md:flex">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} className="font-medium">
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-row items-end">
          <div className="flex gap-3 items-center flex-row">
            <ModeToggle />
            <Button type="submit" onClick={logout} variant='default'>
              Logout
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
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
