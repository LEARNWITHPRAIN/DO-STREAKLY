"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Profile, Achievement } from "@/types";
import { calculateLevel } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Flame,
  Sparkles,
  Trophy,
  Swords,
  CheckCircle2,
  Award,
  Zap,
  Crown,
  ShieldCheck,
  Target,
  LogOut,
  Edit2,
  Check,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Flame,
  Zap,
  Award,
  Crown,
  Users: User,
  Trophy,
  ShieldCheck,
  Target,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const [prof, ach] = await Promise.all([
        StreaklyService.getProfile(),
        StreaklyService.getAchievements(),
      ]);
      setProfile(prof);
      setFullName(prof.full_name);
      setUsername(prof.username);
      setAchievements(ach);
    }
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const updated = await StreaklyService.updateProfile({
      full_name: fullName.trim(),
      username: username.trim(),
    });
    setProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = async () => {
    document.cookie = "streakly_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!profile) return null;

  const levelInfo = calculateLevel(profile.total_xp);

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="rounded-3xl border border-[#202E24] bg-gradient-to-br from-[#121814] to-[#18241D] p-6 md:p-8 relative overflow-hidden shadow-glow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden border-2 border-[#B6F34A]/50 bg-[#0B0F0D] shrink-0 shadow-glow-sm">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-display font-black text-2xl text-[#B6F34A]">
                    {profile.full_name?.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-display text-2xl md:text-3xl font-black text-white leading-tight">
                  {profile.full_name}
                </h1>
                <p className="text-sm text-gray-400">@{profile.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="rounded-full bg-[#B6F34A]/15 border border-[#B6F34A]/30 px-2.5 py-0.5 text-xs font-bold text-[#B6F34A]">
                    Level {levelInfo.level} Streaker
                  </span>
                  <span className="text-xs text-gray-400">
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-1.5"
              >
                <Edit2 className="h-4 w-4" />
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </Button>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#202E24] space-y-3 max-w-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Edit Details</h4>
              <div>
                <label className="text-xs text-gray-300 block mb-1">Display Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs text-gray-300 block mb-1">Username</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <Button type="submit" size="sm" className="mt-2">
                Save Changes
              </Button>
            </form>
          )}

          {savedSuccess && (
            <p className="text-xs text-[#B6F34A] mt-3 flex items-center gap-1 font-semibold">
              <Check className="h-3.5 w-3.5" /> Profile successfully updated!
            </p>
          )}

          {/* Level Progress Bar */}
          <div className="mt-6 pt-6 border-t border-[#202E24]">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-white flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#B6F34A]" />
                Level {levelInfo.level} Progression
              </span>
              <span className="text-[#B6F34A]">
                {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP to Level {levelInfo.level + 1}
              </span>
            </div>
            <Progress value={levelInfo.currentLevelXp} max={levelInfo.nextLevelXp} className="h-2.5" />
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">Total XP</span>
            <span className="font-display text-2xl font-black text-[#B6F34A]">
              {profile.total_xp}
            </span>
          </div>

          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">Current Streak</span>
            <span className="font-display text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 fill-orange-400" />
              {profile.current_streak}d
            </span>
          </div>

          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">Best Streak</span>
            <span className="font-display text-2xl font-black text-white">
              {profile.best_streak}d
            </span>
          </div>

          <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">Challenges Won</span>
            <span className="font-display text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="h-5 w-5" />
              {profile.challenges_won_count || 2}
            </span>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="rounded-3xl border border-[#202E24] bg-[#121814] p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#B6F34A]" />
                <span>Achievements & Badges</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Unlock badges and bonus XP by hitting streak milestones and winning friend challenges.
              </p>
            </div>
            <span className="text-xs font-bold text-[#B6F34A] rounded-full bg-[#1F2E25] px-3 py-1 border border-[#2C3F32]">
              {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {achievements.map((ach) => {
              const IconComp = ICON_MAP[ach.icon] || Award;
              const isUnlocked = ach.unlocked;

              return (
                <div
                  key={ach.id}
                  className={`rounded-2xl border p-4 flex items-start gap-3.5 transition-all ${
                    isUnlocked
                      ? "border-[#B6F34A]/30 bg-[#17211B]"
                      : "border-[#202E24] bg-[#0B0F0D]/60 opacity-50"
                  }`}
                >
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? "bg-[#B6F34A] text-[#0B0F0D] shadow-glow-sm"
                        : "bg-[#17211B] text-gray-500 border border-[#202E24]"
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-display text-sm font-bold text-white truncate">
                        {ach.title}
                      </h4>
                      <span className="text-[10px] font-bold text-[#B6F34A]">
                        +{ach.xp_reward} XP
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                      {ach.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
