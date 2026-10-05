"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { CreateHabitModal } from "@/components/habits/CreateHabitModal";
import { Profile, Habit } from "@/types";
import { StreaklyService } from "@/lib/services/streaklyService";

interface AppShellProps {
  children: React.ReactNode;
  initialProfile?: Profile | null;
}

export function AppShell({ children }: AppShellProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);

  useEffect(() => {
    StreaklyService.getProfile().then(setProfile);
  }, []);

  const handleHabitCreated = (newHabit: Habit) => {
    // Refresh habits or trigger custom event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("habitCreated", { detail: newHabit }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-gray-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar
        profile={profile}
        onOpenNewHabit={() => setIsNewHabitModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Navbar
          profile={profile}
          onOpenNewHabit={() => setIsNewHabitModalOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Quick Create Habit Modal */}
      <CreateHabitModal
        open={isNewHabitModalOpen}
        onOpenChange={setIsNewHabitModalOpen}
        onHabitCreated={handleHabitCreated}
      />
    </div>
  );
}
