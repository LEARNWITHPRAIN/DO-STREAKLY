"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, Swords, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Today",
    href: "/dashboard",
    icon: CalendarCheck2,
    id: "nav-today-tab",
  },
  {
    name: "Challenge",
    href: "/challenges",
    icon: Swords,
    id: "nav-journey-tab", // Keep ID for tutorial compatibility
    highlight: true,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    id: "nav-me-tab",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#202E24] bg-[#0B0F0D]/98 backdrop-blur-xl px-2 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
      <div className="flex items-stretch justify-around w-full max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            (item.href === "/dashboard" && (pathname === "/dashboard" || pathname === "/today")) ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              id={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center pt-2 pb-1 px-3 flex-1 rounded-xl transition-all duration-150 active:scale-95",
                isActive
                  ? "text-[#B6F34A]"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-150",
                    isActive ? "scale-110 text-[#B6F34A]" : "text-gray-400"
                  )}
                />
                {item.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-[#B6F34A] animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight mt-1 font-medium",
                  isActive ? "font-bold text-[#B6F34A]" : "text-gray-400"
                )}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="mt-1 h-0.5 w-4 rounded-full bg-[#B6F34A]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
