"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { CreateChallengeModal } from "@/components/challenges/CreateChallengeModal";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Challenge } from "@/types";
import {
  Swords,
  Plus,
  Users,
  Calendar,
  Trophy,
  ArrowRight,
  Flame,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    StreaklyService.getChallenges().then(setChallenges);
  }, []);

  const handleJoin = async (challenge: Challenge, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJoiningId(challenge.id);
    await StreaklyService.joinChallenge(challenge.invite_code || challenge.id);
    const updated = await StreaklyService.getChallenges();
    setChallenges(updated);
    setJoiningId(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                JOURNEY TAB
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight">
                Friend Challenges
              </h1>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              XP & point stakes live strictly here. Challenge friends, set daily point values, and compete on live leaderboards.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-black shadow-glow-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Challenge</span>
          </Button>
        </div>

        {/* Highlight Banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#17211B] via-[#1a241b] to-[#121814] p-5 md:p-6 shadow-glow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-amber-400 text-[#0B0F0D] flex items-center justify-center font-display font-black text-xl shrink-0">
                ⚔️
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Social Accountability & Daily Points
                </h3>
                <p className="text-xs md:text-sm text-gray-300 mt-1 max-w-xl">
                  Points are awarded per habit when logged. Measurable habits earn points only when daily targets are met. Top the leaderboard before the challenge ends.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 shrink-0 self-start md:self-auto font-bold"
            >
              Start New Challenge
            </Button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((challenge) => {
            const habitsCount = challenge.habits?.length || 1;
            const primaryHabit = challenge.habits?.[0];

            return (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-[#202E24] bg-[#121814] p-5 hover:border-amber-500/40 hover:bg-[#151D18] transition-all duration-200"
              >
                <div>
                  {/* Status, Duration & Points */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="flex items-center gap-1 font-semibold text-orange-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{challenge.duration_days} Days</span>
                    </span>
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 font-bold text-[10px] text-amber-300">
                      {challenge.invite_code ? `Code: ${challenge.invite_code}` : "Active"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {challenge.name || challenge.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {challenge.description || "Compete daily with friends and earn points."}
                  </p>

                  {/* Habit preview pill */}
                  <div className="mt-4 rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3 flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <span className="text-gray-400 block text-[10px] uppercase">
                        {habitsCount} Habit{habitsCount > 1 ? "s" : ""} Included
                      </span>
                      <span className="font-bold text-white truncate block">
                        {primaryHabit ? primaryHabit.name : "Daily Habit"}
                      </span>
                    </div>
                    {primaryHabit && (
                      <span className="text-[#B6F34A] font-bold shrink-0">
                        +{primaryHabit.points} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom stats: participants, rank, join */}
                <div className="mt-5 pt-4 border-t border-[#1C2922] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    <span>{challenge.members?.length || challenge.participants_count || 1} Friends</span>
                  </div>

                  {challenge.user_joined ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#B6F34A]">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      <span>Rank #{challenge.user_rank || 1}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => handleJoin(challenge, e)}
                      disabled={joiningId === challenge.id}
                      className="h-8 text-xs px-3 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold"
                    >
                      {joiningId === challenge.id ? "Joining..." : "Join"}
                    </Button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <CreateChallengeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onChallengeCreated={(newChallenge) =>
          setChallenges((prev) => [newChallenge, ...prev])
        }
      />
    </AppShell>
  );
}
