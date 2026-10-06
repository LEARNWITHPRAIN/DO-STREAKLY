"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sun,
  Sunset,
  Moon,
  Swords,
  ChevronRight,
  Plus,
  Target,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitTimerModal } from "@/components/habits/HabitTimerModal";
import { AppTutorial } from "@/components/tutorial/AppTutorial";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Habit, Profile, Challenge, ChallengeHabit } from "@/types";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challengeHabits, setChallengeHabits] = useState<
    Array<{ challenge: Challenge; habit: ChallengeHabit }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Focus Timer state
  const [activeTimerHabit, setActiveTimerHabit] = useState<Habit | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Tutorial state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Time filter filter (All, Morning, Afternoon, Evening)
  const [timeFilter, setTimeFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");

  const loadData = async () => {
    try {
      const [profData, habitsData, todayChalHabits] = await Promise.all([
        StreaklyService.getProfile(),
        StreaklyService.getHabits(),
        StreaklyService.getTodayChallengeHabits(),
      ]);
      setProfile(profData);
      setHabits(habitsData);
      setChallengeHabits(todayChalHabits);

      // Check if tutorial should run automatically (right after onboarding / first time)
      if (profData && !profData.tutorial_done) {
        setIsTutorialOpen(true);
      }
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to habit creation event
    const handleCreated = () => loadData();
    window.addEventListener("habitCreated", handleCreated);

    // Listen to replay tutorial event from ME > Settings
    const handleReplay = () => setIsTutorialOpen(true);
    window.addEventListener("replayTutorial", handleReplay);

    return () => {
      window.removeEventListener("habitCreated", handleCreated);
      window.removeEventListener("replayTutorial", handleReplay);
    };
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

  const handleCompleteTimerSession = async (habitId: string, durationMinutes: number) => {
    await handleCompleteHabit(habitId, durationMinutes);
    setIsTimerOpen(false);
  };

  // Solo Stats (No XP/Points as per Rule 6)
  const completedCount = habits.filter((h) => h.is_completed_today).length;
  const totalCount = habits.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Categorize habits by time of day
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

  // 7-day calendar history mock for consistency
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <AppShell>
      <div className="space-y-6 md:space-y-8">
        {/* Top Header: Greeting, Streak Flame & Completion Rate */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{getGreeting()}, {profile?.full_name?.split(" ")[0] || "Streaker"}</span>
              <span className="text-xl md:text-2xl">⚡</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {totalCount - completedCount === 0 && totalCount > 0
                ? "All habits completed for today! Keep the flame alive."
                : `You have ${totalCount - completedCount} habit${totalCount - completedCount === 1 ? "" : "s"} left to complete today.`}
            </p>
          </div>

          {/* Quick Streak Highlight Card */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#202E24] bg-[#121814] px-4 py-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="h-6 w-6 fill-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-black text-white">
                  {profile?.current_streak || 0} Days
                </span>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                  Streak
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Best: {profile?.best_streak || profile?.current_streak || 0} days
              </p>
            </div>
          </div>
        </div>

        {/* 3 Solo Metric Cards: Completion Rate, Calendar History, Total Check-ins */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* 1. Daily Completion Rate */}
          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 md:p-5 relative overflow-hidden group hover:border-[#2C3F32] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Today's Progress
              </span>
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

          {/* 2. 7-Day Consistency History */}
          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 md:p-5 relative overflow-hidden group hover:border-[#2C3F32] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                7-Day Consistency
              </span>
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
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? "bg-[#B6F34A] text-[#0B0F0D]"
                          : isPastOrToday
                          ? "border border-[#202E24] bg-[#17211B] text-gray-500"
                          : "border border-[#17211B] bg-transparent text-gray-700"
                      }`}
                    >
                      {isDone ? "✓" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-2.5">
              {completionRate === 100 ? "Perfect day recorded!" : "Complete all habits to keep daily record"}
            </p>
          </div>

          {/* 3. Friend Challenges Banner -> Points & Social */}
          <Link
            href="/challenges"
            className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#121814] to-[#121814] p-4 md:p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Friend Challenges
                </span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Swords className="h-4 w-4" />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                Compete & Earn Points
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Challenge friends in the Journey tab with custom point stakes.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-400">
              <span>View Journey</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Separate Section: Friend Challenge Habits Today (if any) */}
        {challengeHabits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-amber-400" />
                <h2 className="font-display text-base font-bold text-white">
                  Friend Challenge Habits
                </h2>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  Points Stake
                </span>
              </div>
              <Link
                href="/challenges"
                className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Leaderboard</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {challengeHabits.map(({ challenge, habit }) => (
                <div
                  key={habit.id}
                  className="rounded-2xl border border-amber-500/30 bg-[#141C16] p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10">
                        {challenge.name}
                      </span>
                      <span className="text-[10px] font-bold text-[#B6F34A]">
                        +{habit.points} pts
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">
                      {habit.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Target: {habit.target} {habit.unit}
                    </p>
                  </div>
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-[#0B0F0D] text-xs font-bold hover:bg-amber-300 transition-colors"
                  >
                    Check In
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solo Habits Section Categorized by Time */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Personal Habits
              </h2>
              <p className="text-xs text-gray-400">
                Categorized by time of day. Consistency builds identity.
              </p>
            </div>

            {/* Time of Day Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-[#202E24] bg-[#121814] p-1 self-start sm:self-auto">
              {[
                { id: "all", label: "All" },
                { id: "morning", label: "Morning" },
                { id: "afternoon", label: "Afternoon" },
                { id: "evening", label: "Evening" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeFilter(tab.id as typeof timeFilter)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timeFilter === tab.id
                      ? "bg-[#B6F34A] text-[#0B0F0D] shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Cards List */}
          {filteredHabits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#202E24] p-8 text-center">
              <p className="text-sm text-gray-400">No habits for this time period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHabits.map((habit, idx) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isFirst={idx === 0} // Attaches IDs required by Tutorial Step 1, 2, 3, 4
                  onComplete={handleCompleteHabit}
                  onUndo={handleUndoHabit}
                  onDelete={handleDeleteHabit}
                  onSaveNote={handleSaveNote}
                  onOpenTimer={handleOpenTimer}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Focus Timer Modal (survives tab switches) */}
      <HabitTimerModal
        habit={activeTimerHabit}
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onCompleteHabit={handleCompleteTimerSession}
      />

      {/* Coach-Mark App Tutorial (triggers once after onboarding, replayable in ME > Settings) */}
      <AppTutorial
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onFinish={() => {
          setIsTutorialOpen(false);
          loadData();
        }}
      />
    </AppShell>
  );
}
