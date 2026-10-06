"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarCheck2,
  Swords,
  User,
  Plus,
  Flame,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  profile?: Profile | null;
  onOpenNewHabit?: () => void;
}

const NAV_ITEMS = [
  {
    name: "Today",
    href: "/dashboard",
    icon: CalendarCheck2,
    id: "sidebar-today-tab",
  },
  {
    name: "Challenge",
    href: "/challenges",
    icon: Swords,
    badge: "Friends",
    id: "nav-journey-tab-desktop",
  },
  {
    name: "Me",
    href: "/profile",
    icon: User,
    id: "sidebar-me-tab",
  },
];

export function Sidebar({ profile, onOpenNewHabit }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    document.cookie = "streakly_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#202E24] bg-[#0B0F0D] h-screen sticky top-0 px-4 py-6 justify-between select-none">
      <div>
        {/* Brand Logo Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#B6F34A]/50 shadow-glow-sm transition-transform group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="DO STREAKLY"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-display text-lg font-black tracking-tight text-white flex items-center leading-none">
              DO <span className="text-[#B6F34A] ml-1">STREAKLY</span>
            </span>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">
              Better habits. Together.
            </p>
          </div>
        </Link>

        {/* Quick Habit Action */}
        {onOpenNewHabit && (
          <div className="mb-6 px-1">
            <Button
              id="add-habit-btn-desktop"
              onClick={onOpenNewHabit}
              className="w-full justify-center gap-2 shadow-glow-sm font-bold bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635]"
              size="md"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Create Habit</span>
            </Button>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="space-y-1.5">
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
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-[#17211B] text-[#B6F34A] border border-[#2C3F32] font-semibold shadow-sm"
                    : "text-gray-400 hover:bg-[#121814] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive ? "text-[#B6F34A]" : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-[#B6F34A]/10 border border-[#B6F34A]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#B6F34A]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Summary Card */}
      <div className="border-t border-[#202E24] pt-4 px-1 space-y-3">
        {profile && (
          <div className="rounded-xl border border-[#202E24] bg-[#121814] p-3 flex items-center justify-between">
            <Link href="/profile" className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-[#2C3F32] bg-[#17211B] shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-display font-bold text-xs text-[#B6F34A]">
                    {profile.full_name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {profile.full_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center text-orange-400 font-medium">
                    <Flame className="h-3 w-3 inline mr-0.5 fill-orange-400" />
                    {profile.current_streak}d streak
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Log out"
              className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-[#1C2922] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
