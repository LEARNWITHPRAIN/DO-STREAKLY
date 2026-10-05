"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Profile } from "@/types";
import { Trophy, Flame, Sparkles, Users, Globe, Shield } from "lucide-react";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [globalList, setGlobalList] = useState<Array<{ rank: number; profile: Profile; isCurrentUser: boolean }>>([]);
  const [friendsList, setFriendsList] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    async function load() {
      const [glob, friends, user] = await Promise.all([
        StreaklyService.getGlobalLeaderboard(),
        StreaklyService.getFriends(),
        StreaklyService.getProfile(),
      ]);
      setGlobalList(glob);
      setFriendsList(friends);
      setCurrentUser(user);
    }
    load();
  }, []);

  const friendsWithUser = currentUser
    ? [currentUser, ...friendsList].sort((a, b) => b.total_xp - a.total_xp)
    : friendsList;

  const top3 = activeTab === "friends"
    ? friendsWithUser.slice(0, 3)
    : globalList.slice(0, 3).map((g) => g.profile);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Trophy className="h-7 w-7 text-amber-400" />
              <span>Streakly Leaderboards</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Rankings based on consistency, completed habits, and total XP earned.
            </p>
          </div>

          {/* Toggle between Friends and Global */}
          <div className="flex rounded-xl border border-[#202E24] bg-[#0B0F0D] p-1">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "friends"
                  ? "bg-[#17211B] text-[#B6F34A] border border-[#2C3F32] shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Friends Circle</span>
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "global"
                  ? "bg-[#17211B] text-[#B6F34A] border border-[#2C3F32] shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Global Arena</span>
            </button>
          </div>
        </div>

        {/* Podium for Top 3 */}
        {top3.length >= 3 && (
          <div className="rounded-3xl border border-[#202E24] bg-gradient-to-b from-[#121814] to-[#0E1410] p-6 md:p-8">
            <h3 className="font-display text-center text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
              Top Habit Warriors
            </h3>

            <div className="flex items-end justify-center gap-2 sm:gap-6 max-w-lg mx-auto">
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1 order-1">
                <span className="text-2xl mb-1">🥈</span>
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-slate-400 p-0.5 overflow-hidden bg-[#17211B]">
                  {top3[1]?.avatar_url ? (
                    <img src={top3[1].avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-white">
                      {top3[1]?.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="font-display text-xs sm:text-sm font-bold text-white mt-2 truncate max-w-[90px] text-center">
                  {top3[1]?.full_name?.split(" ")[0]}
                </p>
                <span className="font-display text-xs font-semibold text-gray-400">
                  {top3[1]?.total_xp} XP
                </span>
                <div className="w-full h-16 bg-[#17211B] border-t-2 border-slate-400 rounded-t-xl mt-3 flex items-center justify-center font-display font-black text-slate-300">
                  2
                </div>
              </div>

              {/* 1st Place (Center & Taller) */}
              <div className="flex flex-col items-center flex-1 order-2 -mt-4">
                <span className="text-3xl mb-1 animate-bounce">👑</span>
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-amber-400 p-0.5 overflow-hidden bg-[#17211B] shadow-glow">
                  {top3[0]?.avatar_url ? (
                    <img src={top3[0].avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-white">
                      {top3[0]?.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="font-display text-sm sm:text-base font-black text-[#B6F34A] mt-2 truncate max-w-[110px] text-center">
                  {top3[0]?.full_name?.split(" ")[0]}
                </p>
                <span className="font-display text-xs sm:text-sm font-bold text-amber-400">
                  {top3[0]?.total_xp} XP
                </span>
                <div className="w-full h-24 bg-gradient-to-t from-[#1F2E25] to-[#25392D] border-t-2 border-amber-400 rounded-t-xl mt-3 flex items-center justify-center font-display font-black text-2xl text-amber-400 shadow-glow-sm">
                  1
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1 order-3">
                <span className="text-2xl mb-1">🥉</span>
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-amber-700/60 p-0.5 overflow-hidden bg-[#17211B]">
                  {top3[2]?.avatar_url ? (
                    <img src={top3[2].avatar_url} alt="" className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-white">
                      {top3[2]?.full_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="font-display text-xs sm:text-sm font-bold text-white mt-2 truncate max-w-[90px] text-center">
                  {top3[2]?.full_name?.split(" ")[0]}
                </p>
                <span className="font-display text-xs font-semibold text-gray-400">
                  {top3[2]?.total_xp} XP
                </span>
                <div className="w-full h-12 bg-[#17211B] border-t-2 border-amber-700/60 rounded-t-xl mt-3 flex items-center justify-center font-display font-black text-amber-600">
                  3
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings List */}
        <div className="space-y-2.5">
          {(activeTab === "friends" ? friendsWithUser : globalList.map((g) => g.profile)).map((user, idx) => {
            const rank = idx + 1;
            const isMe = user.id === currentUser?.id;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                  isMe
                    ? "border-[#B6F34A]/50 bg-[#17211B] shadow-glow-sm"
                    : "border-[#202E24] bg-[#121814] hover:border-[#2C3F32]"
                }`}
              >
                {/* Left info */}
                <div className="flex items-center gap-3.5">
                  <span className="font-display font-black text-base w-7 text-center text-gray-400">
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </span>

                  <div className="h-10 w-10 rounded-full overflow-hidden border border-[#2C3F32] bg-[#0B0F0D]">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-xs text-[#B6F34A]">
                        {user.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-bold text-white">
                        {user.full_name}
                      </p>
                      {isMe && (
                        <span className="rounded-full bg-[#B6F34A]/15 border border-[#B6F34A]/30 px-2 py-0.5 text-[10px] font-bold text-[#B6F34A]">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="text-orange-400 flex items-center gap-0.5">
                        <Flame className="h-3 w-3 fill-orange-400" />
                        {user.current_streak}d streak
                      </span>
                      <span>•</span>
                      <span>Level {user.level || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Right XP badge */}
                <div className="text-right">
                  <span className="font-display text-base font-black text-[#B6F34A]">
                    {user.total_xp}
                  </span>
                  <span className="text-xs text-gray-400 ml-1 font-semibold">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
