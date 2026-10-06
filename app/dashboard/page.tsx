"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  CalendarCheck,
  Plus,
  Target,
  Swords,
  ChevronRight,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitTimerModal } from "@/components/habits/HabitTimerModal";
import { CreateHabitModal } from "@/components/habits/CreateHabitModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Habit, Profile } from "@/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Focus Timer state
  const [activeTimerHabit, setActiveTimerHabit] = useState<Habit | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Time-of-day filter
  const [timeFilter, setTimeFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");

  const loadData = async () => {
    try {
      const [profData, habitsData] = await Promise.all([
        StreaklyService.getProfile(),
        StreaklyService.getHabits(),
      ]);
      setProfile(profData);
      setHabits(habitsData);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleCreated = () => loadData();
    window.addEventListener("habitCreated", handleCreated);
    return () => window.removeEventListener("habitCreated", handleCreated);
  }, []);

  const handleCompleteHabit = async (habitId: string, increment?: number, note?: string) => {
    const res = await StreaklyService.completeHabit(habitId, increment, note);
    setHabits((prev) => prev.map((h) => (h.id === habitId ? res.habit : h)));
    if (profile && res.streakIncreased) {
      setProfile({
        ...profile,
        current_streak: profile.current_streak + 1,
        best_streak: Math.max(profile.best_streak, profile.current_streak + 1),
        habits_completed_count: profile.habits_completed_count + 1,
      });
    }
    return res;
  };

  const handleUndoHabit = async (habitId: string) => {
    const updated = await StreaklyService.undoHabit(habitId);
    setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));
  };

  const handleDeleteHabit = async (habitId: string) => {
    await StreaklyService.deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const handleSaveNote = async (habitId: string, note: string) => {
    await StreaklyService.saveHabitNote(habitId, note);
    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, today_note: note } : h)));
  };

  const handleOpenTimer = (habit: Habit) => {
    setActiveTimerHabit(habit);
    setIsTimerOpen(true);
  };

  const handleHabitCreated = (newHabit: Habit) => {
    setHabits((prev) => [...prev, newHabit]);
    window.dispatchEvent(new CustomEvent("habitCreated", { detail: newHabit }));
  };

  // Solo stats
  const completedCount = habits.filter((h) => h.is_completed_today).length;
  const totalCount = habits.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered habits
  const filteredHabits = habits.filter((h) => {
    if (timeFilter === "all") return true;
    return (h.time_of_day || "anytime") === timeFilter;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#B6F34A] border-t-transparent animate-spin" />
            <p className="text-sm text-gray-400">Loading your habits...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 md:space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{getGreeting()}, {profile?.full_name?.split(" ")[0] || "Streaker"}</span>
              <span className="text-xl md:text-2xl">⚡</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalCount === 0
                ? "No habits yet — add your first one below."
                : totalCount - completedCount === 0
                ? "All habits done for today! Keep the flame alive. 🔥"
                : `${totalCount - completedCount} habit${totalCount - completedCount === 1 ? "" : "s"} left today.`}
            </p>
          </div>

          {/* Streak card */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#202E24] bg-[#121814] px-4 py-3 self-start md:self-auto">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="h-6 w-6 fill-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-black text-white">
                  {profile?.current_streak || 0} Days
                </span>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Streak</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Best: {profile?.best_streak || 0} days
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats row (only if user has habits) ── */}
        {totalCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Completion */}
            <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Today&apos;s Progress</span>
                <div className="h-8 w-8 rounded-xl bg-[#17211B] flex items-center justify-center text-[#B6F34A]">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-3xl font-black text-white">
                  {completedCount}
                  <span className="text-lg text-gray-400 font-semibold"> / {totalCount}</span>
                </span>
                <span className="text-xs font-bold text-[#B6F34A]">({completionRate}%)</span>
              </div>
              <div className="mt-3">
                <Progress value={completionRate} className="h-2 bg-[#17211B]" />
              </div>
            </div>

            {/* 7-day calendar */}
            <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">7-Day Consistency</span>
                <div className="h-8 w-8 rounded-xl bg-[#17211B] flex items-center justify-center text-emerald-400">
                  <CalendarCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {daysOfWeek.map((day, idx) => {
                  const isPastOrToday = idx <= currentDayIndex;
                  const isDone = isPastOrToday && (idx < currentDayIndex || completedCount > 0);
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-bold">{day}</span>
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-[#B6F34A] text-[#0B0F0D]"
                          : isPastOrToday
                          ? "border border-[#202E24] bg-[#17211B] text-gray-500"
                          : "border border-[#17211B] bg-transparent text-gray-700"
                      }`}>
                        {isDone ? "✓" : "·"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-2.5">
                {completionRate === 100 ? "Perfect day!" : "Complete all habits to log today"}
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 1: PERSONAL HABITS
        ══════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-[#B6F34A] inline-block" />
                Personal Habits
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 ml-3">
                Your private daily habits — tracked for streaks and consistency.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Time filter (only when habits exist) */}
              {totalCount > 0 && (
                <div className="flex items-center gap-1 rounded-xl border border-[#202E24] bg-[#121814] p-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "morning", label: "AM" },
                    { id: "afternoon", label: "PM" },
                    { id: "evening", label: "Eve" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTimeFilter(tab.id as typeof timeFilter)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        timeFilter === tab.id
                          ? "bg-[#B6F34A] text-[#0B0F0D] shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setIsCreateOpen(true)}
                className="gap-1.5 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold text-xs h-9 px-3"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                Add Habit
              </Button>
            </div>
          </div>

          {/* Empty state */}
          {habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-[#2C3F32] bg-[#0E1611] p-10 text-center"
            >
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-[#17211B] border border-[#2C3F32] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#B6F34A]" />
              </div>
              <h3 className="font-display text-base font-bold text-white mb-1">No habits yet</h3>
              <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
                Build your first habit. Small daily actions compound into big results.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Add Your First Habit
              </Button>
            </motion.div>
          ) : filteredHabits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#202E24] p-6 text-center">
              <p className="text-sm text-gray-400">No habits for this time slot.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-3">
                {filteredHabits.map((habit, idx) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <HabitCard
                      habit={habit}
                      isFirst={idx === 0}
                      onComplete={handleCompleteHabit}
                      onUndo={handleUndoHabit}
                      onDelete={handleDeleteHabit}
                      onSaveNote={handleSaveNote}
                      onOpenTimer={handleOpenTimer}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2: FRIEND CHALLENGES (separator)
        ══════════════════════════════════════════════ */}
        <div className="space-y-4">
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#202E24]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Friend Challenges</span>
            <div className="flex-1 h-px bg-[#202E24]" />
          </div>

          {/* Challenge banner card */}
          <Link
            href="/challenges"
            className="group flex items-center justify-between rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/8 via-[#121814] to-[#121814] p-4 md:p-5 hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Swords className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Challenge Tab
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create or join friend challenges with daily point stakes and leaderboards.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0 ml-3">
              <span className="hidden sm:inline">Open</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

      </div>

      {/* Focus Timer Modal */}
      <HabitTimerModal
        habit={activeTimerHabit}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onCompleteHabit={async (habitId, durationMinutes) => {
          await handleCompleteHabit(habitId, durationMinutes);
          setIsTimerOpen(false);
        }}
      />

      {/* Create Habit Modal (inline, from + button on this page) */}
      <CreateHabitModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onHabitCreated={handleHabitCreated}
      />
    </AppShell>
  );
}
