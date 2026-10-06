"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Bell, Plus, Check } from "lucide-react";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  profile?: Profile | null;
  onOpenNewHabit?: () => void;
}

export function Navbar({ profile, onOpenNewHabit }: NavbarProps) {
  const [notificationSent, setNotificationSent] = useState(false);

  const handleTestNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("DO STREAKLY 🔥", {
            body: "Keep the momentum going! Great work staying consistent.",
            icon: "/logo.jpg",
          });
          setNotificationSent(true);
          setTimeout(() => setNotificationSent(false), 3000);
        }
      });
    } else {
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#202E24] bg-[#0B0F0D]/90 px-4 md:px-8 backdrop-blur-md">
      {/* Brand logo for mobile (on desktop it's in the sidebar) */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[#B6F34A]/40 shadow-glow-sm transition-transform group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="DO STREAKLY"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="font-display text-lg font-black tracking-tight text-white flex items-center">
            DO <span className="text-[#B6F34A] ml-1">STREAKLY</span>
          </span>
        </Link>
      </div>

      {/* Right controls: Streak, Test Notification, Quick Add Habit, User Avatar */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {profile && (
          <div
            title="Current Habit Streak"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 px-3 py-1 text-xs md:text-sm font-bold text-orange-400"
          >
            <Flame className="h-4 w-4 fill-orange-400 text-orange-400 animate-pulse" />
            <span>{profile.current_streak}d streak</span>
          </div>
        )}

        {/* Notifications / Reminder button */}
        <button
          onClick={handleTestNotification}
          title="Enable Notifications / Streak Reminder"
          className="relative rounded-xl border border-[#202E24] bg-[#121814] p-2 text-gray-400 hover:text-white hover:border-[#2C3F32] transition-colors"
        >
          {notificationSent ? (
            <Check className="h-4 w-4 text-[#B6F34A]" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#B6F34A]" />
        </button>

        {/* Quick Add Habit Button (Visible on both mobile & desktop) */}
        {onOpenNewHabit && (
          <button
            id="add-habit-btn"
            onClick={onOpenNewHabit}
            title="Add more habits any time"
            className="flex items-center gap-1.5 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] px-3 py-1.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-glow-sm active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>
        )}

        {/* User Avatar -> ME Profile */}
        {profile && (
          <Link href="/profile" className="relative group">
            <div className="h-9 w-9 overflow-hidden rounded-full border border-[#2C3F32] bg-[#17211B] transition-transform group-hover:scale-105 group-hover:border-[#B6F34A]">
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
          </Link>
        )}
      </div>
    </header>
  );
}
