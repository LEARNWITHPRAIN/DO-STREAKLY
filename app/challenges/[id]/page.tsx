"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Challenge, Profile } from "@/types";
import { fireCelebrationConfetti } from "@/lib/confetti";
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
  UserPlus,
  Check,
} from "lucide-react";

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      rank: number;
      profile: Profile;
      xp: number;
      progress: number;
      isCurrentUser: boolean;
    }>
  >([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const c = await StreaklyService.getChallengeById(challengeId);
      if (c) {
        setChallenge(c);
        const lb = await StreaklyService.getChallengeLeaderboard(challengeId);
        setLeaderboard(lb);
      }
      setLoading(false);
    }
    load();
  }, [challengeId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCelebrate = () => {
    fireCelebrationConfetti();
  };

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
            ← Back to challenges
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/challenges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>All Challenges</span>
        </Link>

        {/* Challenge Header Card */}
        <div className="rounded-3xl border border-[#202E24] bg-gradient-to-br from-[#121814] to-[#17211B] p-6 md:p-8 relative overflow-hidden shadow-glow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-0.5 text-xs font-bold text-orange-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  18 Days Remaining
                </span>
                <span className="rounded-full bg-[#B6F34A]/10 border border-[#B6F34A]/30 px-3 py-0.5 text-xs font-bold text-[#B6F34A]">
                  +{challenge.xp_reward} XP Prize
                </span>
              </div>

              <h1 className="font-display text-2xl md:text-4xl font-black text-white tracking-tight">
                {challenge.title}
              </h1>

              <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                {challenge.description ||
                  `Track ${challenge.habit_title} consistently and beat your friends on the leaderboard.`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-[#B6F34A]" /> : <Share2 className="h-4 w-4" />}
                <span>{copied ? "Link Copied!" : "Invite Friends"}</span>
              </Button>
              <Button
                size="sm"
                onClick={handleCelebrate}
                className="gap-1.5 shadow-glow"
              >
                <Sparkles className="h-4 w-4" />
                <span>Celebrate</span>
              </Button>
            </div>
          </div>

          {/* 3 Metric Pills: Your Rank, Your XP, Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#202E24]">
            <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5">
              <span className="text-xs text-gray-400 block mb-1">Your Rank</span>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span className="font-display text-2xl font-black text-white">#2</span>
                <span className="text-xs text-[#B6F34A] font-semibold">Podium!</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5">
              <span className="text-xs text-gray-400 block mb-1">Your Challenge XP</span>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#B6F34A]" />
                <span className="font-display text-2xl font-black text-[#B6F34A]">590</span>
                <span className="text-xs text-gray-400 font-semibold">XP</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Goal Completion</span>
                <span className="text-white font-bold">82%</span>
              </div>
              <Progress value={82} max={100} className="h-2 mt-2" />
            </div>
          </div>
        </div>

        {/* Live Challenge Leaderboard */}
        <Card className="border-[#202E24] bg-[#121814]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>Challenge Leaderboard</span>
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                Ranked live by habit consistency and XP earned during this challenge.
              </p>
            </div>
            <span className="rounded-full bg-[#17211B] border border-[#202E24] px-3 py-1 text-xs text-gray-300 font-semibold">
              {leaderboard.length} Competitors
            </span>
          </CardHeader>

          <CardContent className="space-y-3">
            {leaderboard.map((entry) => {
              const medal =
                entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`;

              return (
                <div
                  key={entry.profile.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                    entry.isCurrentUser
                      ? "border-[#B6F34A]/50 bg-[#17211B] shadow-glow-sm"
                      : "border-[#202E24] bg-[#0B0F0D] hover:border-[#2C3F32]"
                  }`}
                >
                  {/* Left: Rank, Avatar, Name */}
                  <div className="flex items-center gap-3.5">
                    <span className="font-display font-black text-lg w-8 text-center shrink-0">
                      {medal}
                    </span>

                    <div className="relative h-11 w-11 rounded-full overflow-hidden border border-[#2C3F32] bg-[#121814] shrink-0">
                      {entry.profile.avatar_url ? (
                        <img
                          src={entry.profile.avatar_url}
                          alt={entry.profile.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-sm text-[#B6F34A]">
                          {entry.profile.full_name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-base font-bold text-white">
                          {entry.profile.full_name}
                        </h4>
                        {entry.isCurrentUser && (
                          <span className="rounded-full bg-[#B6F34A]/15 border border-[#B6F34A]/30 px-2 py-0.5 text-[10px] font-bold text-[#B6F34A]">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        @{entry.profile.username} • {entry.progress}% days logged
                      </p>
                    </div>
                  </div>

                  {/* Right: Progress Bar & XP */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="w-28 hidden md:block">
                      <Progress value={entry.progress} max={100} className="h-1.5" />
                    </div>

                    <div className="text-right">
                      <span className="font-display text-base font-black text-[#B6F34A] block">
                        {entry.xp} XP
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">Earned</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
