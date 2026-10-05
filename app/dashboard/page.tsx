"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Sparkles,
  Trophy,
  Swords,
  ChevronRight,
  Plus,
  Target,
  ArrowUpRight,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { HabitCard } from "@/components/habits/HabitCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Habit, Profile, Challenge } from "@/types";
import { calculateLevel } from "@/lib/utils";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profData, habitsData, chalData, friendsData] = await Promise.all([
        StreaklyService.getProfile(),
        StreaklyService.getHabits(),
        StreaklyService.getChallenges(),
        StreaklyService.getFriends(),
      ]);
      setProfile(profData);
      setHabits(habitsData);
      setChallenges(chalData);
      setFriends(friendsData);
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
    return () => window.removeEventListener("habitCreated", handleCreated);
  }, []);

  const handleCompleteHabit = async (habitId: string, increment?: number) => {
    const res = await StreaklyService.completeHabit(habitId, increment);
    // Refresh habits & profile state
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? res.habit : h))
    );
    if (profile) {
      setProfile({
        ...profile,
        total_xp: res.newTotalXp,
        level: res.newLevel,
        current_streak: res.streakIncreased
          ? profile.current_streak + 1
          : profile.current_streak,
      });
    }
    return res;
  };

  // Stats
  const completedCount = habits.filter((h) => h.is_completed_today).length;
  const totalCount = habits.length;
  const todayXp = habits
    .filter((h) => h.is_completed_today)
    .reduce((sum, h) => sum + h.xp_value, 0);

  const levelInfo = profile
    ? calculateLevel(profile.total_xp)
    : { level: 1, currentLevelXp: 0, nextLevelXp: 100, progressPercent: 0 };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppShell>
      <div className="space-y-6 md:space-y-8">
        {/* Top Greeting & Level Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{getGreeting()}, {profile?.full_name?.split(" ")[0] || "Streaker"}</span>
              <span className="text-xl md:text-2xl">👋</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Keep the momentum blazing. You have {totalCount - completedCount} habits left today.
            </p>
          </div>

          {/* Level Progress Widget */}
          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-3.5 md:p-4 min-w-[260px] shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="font-display font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#B6F34A]" />
                Level {levelInfo.level}
              </span>
              <span className="text-[#B6F34A]">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
              </span>
            </div>
            <Progress
              value={levelInfo.currentLevelXp}
              max={levelInfo.nextLevelXp}
              className="h-2"
            />
          </div>
        </div>

        {/* 3 Core Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Today's Habits Progress */}
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
                {completedCount} <span className="text-lg text-gray-400 font-semibold">/ {totalCount}</span>
              </span>
            </div>
            <div className="mt-3">
              <Progress
                value={completedCount}
                max={Math.max(1, totalCount)}
                className="h-1.5"
              />
            </div>
          </div>

          {/* XP Earned Today */}
          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 md:p-5 relative overflow-hidden group hover:border-[#2C3F32] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                XP Today
              </span>
              <div className="h-8 w-8 rounded-xl bg-[#17211B] flex items-center justify-center text-[#B6F34A]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-[#B6F34A]">
                +{todayXp}
              </span>
              <span className="text-sm font-semibold text-gray-400">XP</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Total accumulated: <strong className="text-white">{profile?.total_xp || 0} XP</strong>
            </p>
          </div>

          {/* Active Streak */}
          <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#121814] to-[#1F1610] p-4 md:p-5 relative overflow-hidden group hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Current Streak
              </span>
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Flame className="h-4 w-4 fill-orange-400" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-white flex items-center gap-1.5">
                <Flame className="h-7 w-7 fill-orange-500 text-orange-500 animate-bounce" />
                {profile?.current_streak || 0}
              </span>
              <span className="text-sm font-semibold text-gray-400">days active</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Best record: <strong className="text-white">{profile?.best_streak || 0} days</strong>
            </p>
          </div>
        </div>

        {/* Main 2-Column Grid: Today's Habits (Left) + Challenges & Friend Leaderboard (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Habits Section (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Today's Habits
                </h2>
                <span className="rounded-full bg-[#17211B] border border-[#202E24] px-2 py-0.5 text-xs font-semibold text-[#B6F34A]">
                  {completedCount}/{totalCount} done
                </span>
              </div>

              <Link
                href="/habits"
                className="text-xs font-bold text-[#B6F34A] hover:underline flex items-center gap-1"
              >
                <span>Manage all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {habits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#202E24] p-8 text-center bg-[#121814]/50">
                <Sparkles className="h-10 w-10 text-[#B6F34A] mx-auto mb-3 opacity-60" />
                <h3 className="font-display text-base font-bold text-white">No habits created yet</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Start your daily streak by creating your first Yes/No or Measurable habit!
                </p>
                <Link href="/habits" className="mt-4 inline-block">
                  <Button size="sm">Create First Habit</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleCompleteHabit}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Challenges & Friends Leaderboard */}
          <div className="space-y-6">
            {/* Active Friend Challenges (USP Highlight) */}
            <Card className="border-[#202E24] bg-[#121814]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Swords className="h-4 w-4 text-[#B6F34A]" />
                    <span>Friend Challenges</span>
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Stay accountable together</p>
                </div>
                <Link
                  href="/challenges"
                  className="text-xs font-bold text-[#B6F34A] hover:underline flex items-center gap-0.5"
                >
                  <span>Explore</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenges.slice(0, 2).map((chal) => (
                  <Link
                    key={chal.id}
                    href={`/challenges/${chal.id}`}
                    className="block rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3 hover:border-[#2C3F32] hover:bg-[#151D18] transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-sm font-bold text-white group-hover:text-[#B6F34A] truncate transition-colors">
                          {chal.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span className="text-[#B6F34A] font-semibold">{chal.duration_days} days</span>
                          <span>•</span>
                          <span>{chal.participants_count || 3} participants</span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#1F2E25] border border-[#2C3F32] px-2 py-0.5 text-[10px] font-bold text-[#B6F34A]">
                        Rank #{chal.user_rank || 1}
                      </span>
                    </div>
                  </Link>
                ))}

                <Link href="/challenges" className="block w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 justify-center mt-2 border-[#202E24]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Friend Challenge</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Friend Leaderboard Snapshot */}
            <Card className="border-[#202E24] bg-[#121814]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>Friend Leaderboard</span>
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Top streak warriors this week</p>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-xs font-bold text-[#B6F34A] hover:underline flex items-center gap-0.5"
                >
                  <span>Full Board</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {/* Current User in leaderboard */}
                {profile && (
                  <div className="flex items-center justify-between rounded-xl bg-[#17211B] border border-[#B6F34A]/30 p-2.5 shadow-glow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="font-display font-black text-sm text-[#B6F34A] w-5 text-center">
                        #2
                      </span>
                      <div className="h-8 w-8 rounded-full overflow-hidden border border-[#B6F34A]/50 bg-[#0B0F0D]">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#B6F34A]">
                            {profile.full_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          {profile.full_name} <span className="text-[10px] text-[#B6F34A] font-normal">(You)</span>
                        </p>
                        <p className="text-[10px] text-gray-400">🔥 {profile.current_streak} days streak</p>
                      </div>
                    </div>
                    <span className="font-display text-xs font-bold text-[#B6F34A]">
                      {profile.total_xp} XP
                    </span>
                  </div>
                )}

                {/* Friends */}
                {friends.slice(0, 3).map((friend, idx) => {
                  const rank = idx === 0 ? 1 : idx + 2;
                  const medal = rank === 1 ? "🥇" : rank === 3 ? "🥉" : `#${rank}`;

                  return (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between rounded-xl border border-[#202E24] bg-[#0B0F0D] p-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-display font-black text-xs text-gray-400 w-5 text-center">
                          {medal}
                        </span>
                        <div className="h-8 w-8 rounded-full overflow-hidden border border-[#202E24] bg-[#121814]">
                          {friend.avatar_url ? (
                            <img src={friend.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-xs text-gray-300">
                              {friend.full_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-200 leading-tight">
                            {friend.full_name}
                          </p>
                          <p className="text-[10px] text-gray-400">🔥 {friend.current_streak} days</p>
                        </div>
                      </div>
                      <span className="font-display text-xs font-semibold text-gray-300">
                        {friend.total_xp} XP
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
