"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Challenge, ChallengeHabit, ChallengeMember, Profile } from "@/types";
import { triggerConfetti } from "@/lib/confetti";
import { QRCodeSVG } from "@/components/challenges/QRCodeSVG";
import {
  Trophy,
  Swords,
  Calendar,
  Users,
  Share2,
  ChevronLeft,
  Flame,
  CheckCircle2,
  Sparkles,
  Check,
  Copy,
  Clock,
  Trash2,
  RefreshCw,
  Edit2,
  Crown,
  Medal,
} from "lucide-react";

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check-in tracking for today's challenge habits
  const [habitInputs, setHabitInputs] = useState<Record<string, number>>({});
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Creator edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const loadData = async () => {
    try {
      const [c, userProf] = await Promise.all([
        StreaklyService.getChallengeById(challengeId),
        StreaklyService.getProfile(),
      ]);
      if (c) {
        setChallenge(c);
        setEditName(c.name || c.title || "");
        setEditDesc(c.description || "");
      }
      setProfile(userProf);
    } catch (e) {
      console.error("Load challenge detail error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [challengeId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#B6F34A] border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!challenge) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <h2 className="text-xl font-bold">Challenge not found</h2>
          <Link href="/challenges" className="text-[#B6F34A] mt-2 inline-block">
            ← Back to Friend Challenges
          </Link>
        </div>
      </AppShell>
    );
  }

  const isOwner = challenge.owner_id === profile?.id || challenge.is_owner;
  const isStarted = new Date(challenge.start_date) <= new Date();
  const canEdit = isOwner && !isStarted;

  // Sorted Leaderboard by total_points descending
  const sortedMembers = [...(challenge.members || [])].sort(
    (a, b) => (b.total_points || 0) - (a.total_points || 0)
  );

  const winner = sortedMembers[0];

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${challenge.invite_code}`
    : `https://dostreakly.vercel.app/join/${challenge.invite_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWebShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Join "${challenge.name}" on DO STREAKLY!`,
          text: `Compete with me in "${challenge.name}". Track habits daily and earn points!`,
          url: shareUrl,
        });
      } catch (err) {
        console.warn(err);
      }
    } else {
      handleCopy();
    }
  };

  // Log Challenge Habit
  const handleLogHabit = async (habit: ChallengeHabit) => {
    setLoggingHabitId(habit.id);
    try {
      const inputVal = habit.type === "yes_no"
        ? 1
        : (habitInputs[habit.id] !== undefined ? habitInputs[habit.id] : (habit.target || 1));

      const res = await StreaklyService.logChallengeHabit(
        challenge.id,
        habit.id,
        inputVal
      );

      if (res.pointsAwarded > 0) {
        triggerConfetti();
      }
      setChallenge(res.challenge);
    } catch (e) {
      console.error("Log habit error:", e);
    } finally {
      setLoggingHabitId(null);
    }
  };

  // Creator: Remove member
  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Remove this member from the challenge?")) return;
    const updated = await StreaklyService.removeChallengeMember(challenge.id, userId);
    setChallenge(updated);
  };

  // Creator: Regenerate invite link
  const handleRegenerateCode = async () => {
    const newCode = await StreaklyService.regenerateInviteCode(challenge.id);
    setChallenge({ ...challenge, invite_code: newCode });
    alert(`Invite code updated to: ${newCode}`);
  };

  // Creator: Save edits
  const handleSaveEdit = async () => {
    const updated = await StreaklyService.updateChallenge(challenge.id, {
      name: editName,
      title: editName,
      description: editDesc,
    });
    setChallenge(updated);
    setIsEditing(false);
  };

  // Time remaining calculation
  const totalDays = challenge.duration_days || 14;
  const daysLogged = challenge.days_logged || 0;
  const daysRemaining = challenge.days_remaining !== undefined ? challenge.days_remaining : Math.max(0, totalDays - daysLogged);

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Friend Challenges (Journey)</span>
          </Link>

          <Button
            size="sm"
            onClick={() => setShowShareModal(true)}
            className="gap-2 bg-amber-400 text-[#0B0F0D] hover:bg-amber-300 font-bold"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Invite Friends</span>
          </Button>
        </div>

        {/* Challenge Header Card */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#121814] to-[#1a241c] p-6 md:p-8 relative overflow-hidden shadow-glow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-0.5 text-xs font-bold text-orange-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {daysRemaining} Days Remaining
                </span>
                <span className="rounded-full bg-[#B6F34A]/10 border border-[#B6F34A]/30 px-3 py-0.5 text-xs font-bold text-[#B6F34A]">
                  {daysLogged} / {totalDays} Days Logged
                </span>
                {isOwner && (
                  <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    Host (You)
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-[#0B0F0D] text-lg font-bold text-white border-[#202E24]"
                  />
                  <Input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description / rules"
                    className="bg-[#0B0F0D] text-xs text-white border-[#202E24]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="bg-[#B6F34A] text-[#0B0F0D] font-bold">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-2xl md:text-4xl font-black text-white tracking-tight">
                    {challenge.name || challenge.title}
                  </h1>
                  <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                    {challenge.description || "Daily friend accountability challenge. Earn points for every logged habit."}
                  </p>
                </>
              )}
            </div>

            {/* Creator Controls (Edit before start, Regenerate invite link) */}
            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                {canEdit && !isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-1.5 border-[#202E24] text-xs text-gray-300"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Challenge</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateCode}
                  title="Regenerate Invite Link"
                  className="gap-1.5 border-[#202E24] text-xs text-gray-300 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>New Code</span>
                </Button>
              </div>
            )}
          </div>

          {/* Winner Podium Banner if finished or current leader */}
          {winner && (
            <div className="mt-6 pt-6 border-t border-[#202E24] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-400 text-[#0B0F0D] flex items-center justify-center font-bold">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    {daysRemaining === 0 ? "Challenge Winner 🏆" : "Current 1st Place"}
                  </span>
                  <p className="font-bold text-white text-sm">
                    {winner.profile?.full_name || "Leader"} • {winner.total_points || 0} Points
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Invite Code: <span className="font-mono text-amber-400 font-bold">{challenge.invite_code}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid: Today's Challenge Habits & Live Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Today's Challenge Habits with Check-in */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Swords className="h-4 w-4 text-amber-400" />
                  <span>Today's Challenge Habits</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Points awarded per habit when logged. Measurable habits earn points once target is met.
                </p>
              </div>
            </div>

            {challenge.habits && challenge.habits.length > 0 ? (
              <div className="space-y-3">
                {challenge.habits.map((habit) => {
                  const isMeasurable = habit.type === "measurable";
                  const target = habit.target || 1;
                  const currentVal = habitInputs[habit.id] ?? 0;

                  return (
                    <div
                      key={habit.id}
                      className="rounded-2xl border border-[#202E24] bg-[#121814] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">
                            {habit.name}
                          </h4>
                          <span className="rounded-full bg-[#B6F34A]/10 border border-[#B6F34A]/30 px-2 py-0.5 text-xs font-bold text-[#B6F34A]">
                            +{habit.points} Points
                          </span>
                          {habit.log_before_midnight && (
                            <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                              Before Midnight
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {isMeasurable
                            ? `Daily Target: ${target} ${habit.unit}`
                            : "Daily Yes / No Check-in"}
                        </p>
                      </div>

                      {/* Check-in controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isMeasurable && (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              placeholder={String(target)}
                              value={habitInputs[habit.id] ?? ""}
                              onChange={(e) =>
                                setHabitInputs((prev) => ({
                                  ...prev,
                                  [habit.id]: Number(e.target.value),
                                }))
                              }
                              className="w-20 bg-[#0B0F0D] border-[#202E24] text-xs text-white"
                            />
                            <span className="text-xs text-gray-400">{habit.unit}</span>
                          </div>
                        )}

                        <Button
                          size="sm"
                          disabled={loggingHabitId === habit.id}
                          onClick={() => handleLogHabit(habit)}
                          className="bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold gap-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Check In</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#202E24] p-8 text-center text-xs text-gray-400">
                No habits configured for this challenge.
              </div>
            )}
          </div>

          {/* Right Col: Live Leaderboard Ranked by Total Points */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Live Leaderboard</span>
              </h2>
              <span className="text-xs text-gray-400">
                {sortedMembers.length} Members
              </span>
            </div>

            <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-3 space-y-2">
              {sortedMembers.map((member, idx) => {
                const rank = idx + 1;
                const isUser = member.user_id === profile?.id;

                return (
                  <div
                    key={member.id}
                    className={`rounded-xl p-3 flex items-center justify-between gap-3 transition-colors ${
                      isUser
                        ? "bg-[#1C2820] border border-[#B6F34A]/40"
                        : "bg-[#0B0F0D] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-display font-black text-xs ${
                          rank === 1
                            ? "bg-amber-400 text-black shadow-glow-sm"
                            : rank === 2
                            ? "bg-gray-300 text-black"
                            : rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-[#17211B] text-gray-400"
                        }`}
                      >
                        {rank}
                      </div>

                      {/* Avatar & Name */}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{member.profile?.full_name || `Member ${rank}`}</span>
                          {isUser && (
                            <span className="text-[10px] text-[#B6F34A] font-semibold">(You)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {member.days_logged || 0} days logged
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-display text-sm font-black text-[#B6F34A] block">
                          {member.total_points || 0} pts
                        </span>
                      </div>

                      {/* Host action: Remove member (if not self) */}
                      {isOwner && !isUser && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          title="Remove member"
                          className="p-1 text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Share & Invite Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="max-w-md w-full rounded-3xl border border-[#202E24] bg-[#121814] p-6 text-center text-white space-y-4">
              <h3 className="font-display text-xl font-black">Invite Friends</h3>
              <p className="text-xs text-gray-400">
                Share this unique invite link with friends to join the challenge leaderboard.
              </p>

              <div className="flex justify-center my-3">
                <QRCodeSVG value={shareUrl} size={160} />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#202E24] bg-[#0B0F0D] p-2 text-left">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-xs text-gray-300 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-[#17211B] hover:bg-[#202E24] text-xs font-bold text-[#B6F34A] transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleWebShare}
                  className="border-[#202E24] bg-[#17211B] text-white hover:bg-[#202E24]"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  <span>Web Share</span>
                </Button>
                <Button
                  onClick={() => setShowShareModal(false)}
                  className="bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-black"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
