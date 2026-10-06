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
    name: "Journey",
    href: "/challenges",
    icon: Swords,
    id: "nav-journey-tab", // Needed for Step 5 in tutorial
    highlight: true,
  },
  {
    name: "Me",
    href: "/profile",
    icon: User,
    id: "nav-me-tab",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#202E24] bg-[#0B0F0D]/95 backdrop-blur-xl px-4 py-1.5 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
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
                "flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-150 min-w-[72px]",
                isActive
                  ? "text-[#B6F34A]"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive ? "scale-110 text-[#B6F34A]" : "text-gray-400"
                  )}
                />
                {item.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-[#B6F34A] animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] tracking-tight mt-1 font-medium",
                  isActive ? "font-bold text-[#B6F34A]" : "text-gray-400"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
