"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Profile } from "@/types";
import { Users, UserPlus, Flame, Sparkles, Check, Search, ShieldCheck } from "lucide-react";

export default function FriendsPage() {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendInput, setNewFriendInput] = useState("");
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    StreaklyService.getFriends().then(setFriends);
  }, []);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendInput.trim()) return;

    const added = await StreaklyService.addFriend(newFriendInput.trim());
    setFriends((prev) => [added, ...prev]);
    setNewFriendInput("");
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="h-7 w-7 text-[#B6F34A]" />
              <span>Friends & Accountability</span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Connect with friends, challenge each other, and keep your streaks unbroken.
            </p>
          </div>
        </div>

        {/* Add Friend Form */}
        <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-5 shadow-sm">
          <h3 className="font-display text-base font-bold text-white mb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[#B6F34A]" />
            <span>Invite or Add a Friend</span>
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Enter a friend's username or email to send an accountability invite.
          </p>

          <form onSubmit={handleAddFriend} className="flex gap-2 max-w-md">
            <Input
              value={newFriendInput}
              onChange={(e) => setNewFriendInput(e.target.value)}
              placeholder="Username or email (e.g. rahul_fit)"
              required
            />
            <Button type="submit" className="shrink-0 gap-1.5 shadow-glow-sm">
              <UserPlus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </form>

          {addedSuccess && (
            <p className="text-xs text-[#B6F34A] mt-2 flex items-center gap-1 font-semibold">
              <Check className="h-3.5 w-3.5" /> Friend added to your circle!
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your friends..."
            className="pl-10"
          />
        </div>

        {/* Friends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-2xl border border-[#202E24] bg-[#121814] p-4 hover:border-[#2C3F32] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full overflow-hidden border border-[#2C3F32] bg-[#0B0F0D] shrink-0">
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-sm text-[#B6F34A]">
                      {friend.full_name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-display text-sm font-bold text-white">
                    {friend.full_name}
                  </h4>
                  <p className="text-xs text-gray-400">@{friend.username}</p>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-orange-400 font-semibold flex items-center gap-0.5">
                      <Flame className="h-3 w-3 fill-orange-400" />
                      {friend.current_streak}d streak
                    </span>
                    <span>•</span>
                    <span className="text-[#B6F34A] font-semibold">{friend.total_xp} XP</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-[#17211B] border border-[#202E24] px-2.5 py-0.5 text-[11px] font-semibold text-gray-300">
                  Level {friend.level || 1}
                </span>
                <span className="text-[10px] text-gray-400">
                  {friend.habits_completed_count || 12} habits done
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
