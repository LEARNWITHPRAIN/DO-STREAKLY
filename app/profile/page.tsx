"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Flame,
  Trophy,
  CheckCircle2,
  CalendarCheck,
  Settings,
  HelpCircle,
  LogOut,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [tutorialReplayed, setTutorialReplayed] = useState(false);

  useEffect(() => {
    async function load() {
      const prof = await StreaklyService.getProfile();
      setProfile(prof);
      setFullName(prof.full_name);
      setUsername(prof.username);
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

  const handleReplayTutorial = async () => {
    await StreaklyService.setTutorialDone(false);
    setTutorialReplayed(true);
    setTimeout(() => {
      // Navigate to Today screen where tutorial will trigger immediately
      router.push("/dashboard");
    }, 400);
  };

  const handleLogout = async () => {
    document.cookie = "streakly_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!profile) return null;

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
                  <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-xs font-bold text-orange-400 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 fill-orange-400" />
                    {profile.current_streak}d Active Streak
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
              <Button type="submit" size="sm" className="mt-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold">
                Save Changes
              </Button>
            </form>
          )}

          {savedSuccess && (
            <p className="text-xs text-[#B6F34A] mt-3 flex items-center gap-1 font-semibold">
              <Check className="h-3.5 w-3.5" /> Profile successfully updated!
            </p>
          )}
        </div>

        {/* 4 Stats Grid: Solo streaks, completion rate, history (No XP in solo mode) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
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
            <span className="text-xs text-gray-400 block mb-1">Total Habits Done</span>
            <span className="font-display text-2xl font-black text-[#B6F34A] flex items-center justify-center gap-1">
              <CheckCircle2 className="h-5 w-5" />
              {profile.habits_completed_count || 84}
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

        {/* ME > Settings Section (includes "Replay tutorial" requirement) */}
        <div className="rounded-3xl border border-[#202E24] bg-[#121814] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-[#B6F34A]" />
            <h2 className="font-display text-xl font-bold text-white">
              Settings & Preferences
            </h2>
          </div>

          <div className="divide-y divide-[#202E24]">
            {/* Replay Tutorial (Step 5 Requirement) */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[#B6F34A]" />
                  <span>Interactive App Tutorial</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Walk through the coach-mark tutorial of the Today habit card, checkbox, undo action, and journey tab.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplayTutorial}
                className="gap-2 border-[#2C3F32] bg-[#17211B] text-white hover:bg-[#202E24] hover:text-[#B6F34A] shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{tutorialReplayed ? "Launching..." : "Replay Tutorial"}</span>
              </Button>
            </div>

            {/* Logout */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Account Session</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sign out of DO STREAKLY on this device.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
