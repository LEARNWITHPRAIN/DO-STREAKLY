"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Challenge, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Swords,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Flame,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";

export default function JoinChallengePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || "";

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const chal = await StreaklyService.getChallengeByInviteCode(code);
        if (!chal) {
          setErrorMsg(`No challenge found with code "${code}". Please check the invite link.`);
          setLoading(false);
          return;
        }
        setChallenge(chal);

        const userProf = await StreaklyService.getProfile();
        setProfile(userProf);

        // Check if user is already a member
        if (userProf && chal.members) {
          const isMember = chal.members.some(
            (m) => m.user_id === userProf.id || m.profile?.id === userProf.id
          );
          if (isMember) {
            setAlreadyJoined(true);
          }
        }
      } catch (e) {
        console.error("Load error:", e);
        setErrorMsg("Failed to load challenge details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  const handleJoin = async () => {
    // If user is not logged in / demo fallback check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If completely unauthenticated, store return path and redirect to login/signup
    if (!user && typeof window !== "undefined" && !document.cookie.includes("streakly_demo")) {
      localStorage.setItem("dostreakly_redirect_after_auth", `/join/${code}`);
      router.push(`/signup?redirect=/join/${code}`);
      return;
    }

    setJoining(true);
    try {
      const res = await StreaklyService.joinChallenge(code);
      if (res.success) {
        triggerConfetti();
        setJoinedSuccess(true);
        setTimeout(() => {
          router.push(`/challenges/${res.challenge.id}`);
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Could not join challenge.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F0D] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-2 border-[#B6F34A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading challenge invitation...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !challenge) {
    return (
      <div className="min-h-screen bg-[#0B0F0D] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#202E24] bg-[#121814] p-6 text-center text-white">
          <ShieldAlert className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Invitation Not Found</h2>
          <p className="text-xs text-gray-400 mt-2">{errorMsg}</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-6 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold"
          >
            Go to Today
          </Button>
        </Card>
      </div>
    );
  }

  // Host name
  const hostMember = challenge.members?.[0];
  const hostName = hostMember?.profile?.full_name || "A friend";

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand logo header */}
        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-2">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-[#B6F34A]/50 shadow-glow-sm">
              <Image src="/logo.jpg" alt="DO STREAKLY" fill className="object-cover" priority />
            </div>
            <span className="font-display text-xl font-black text-white">
              DO <span className="text-[#B6F34A]">STREAKLY</span>
            </span>
          </Link>
          <span className="block text-xs uppercase font-bold text-amber-400 tracking-wider">
            ⚔️ Friend Challenge Invitation
          </span>
        </div>

        {/* Challenge Invitation Card */}
        <Card className="border border-amber-500/30 bg-[#121814] p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <CardContent className="p-0 space-y-5">
            {/* Host Banner */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#202E24]">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Swords className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400">
                  <span className="font-bold text-white">{hostName}</span> invited you to:
                </p>
                <h1 className="font-display text-2xl font-black text-white mt-0.5 leading-tight">
                  {challenge.name}
                </h1>
              </div>
            </div>

            {/* Challenge Meta Pills */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-3">
                <span className="text-gray-400 block text-[10px] font-semibold uppercase">Duration</span>
                <span className="font-display text-base font-bold text-white mt-0.5 block">
                  {challenge.duration_days} Days
                </span>
              </div>
              <div className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-3">
                <span className="text-gray-400 block text-[10px] font-semibold uppercase">Participants</span>
                <span className="font-display text-base font-bold text-[#B6F34A] mt-0.5 block">
                  {challenge.members?.length || 1} Friends In
                </span>
              </div>
            </div>

            {/* Habits & Point Stakes Included */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Habits to Complete & Daily Points
              </span>

              <div className="space-y-2">
                {challenge.habits && challenge.habits.length > 0 ? (
                  challenge.habits.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-3 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{h.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {h.type === "measurable"
                            ? `Target: ${h.target} ${h.unit}`
                            : "Yes / No completion"}
                        </p>
                      </div>
                      <span className="rounded-xl bg-[#B6F34A]/10 border border-[#B6F34A]/30 px-2.5 py-1 text-xs font-bold text-[#B6F34A]">
                        +{h.points} pts / day
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-3 text-xs text-gray-400">
                    Daily challenge habits and point tracking
                  </div>
                )}
              </div>
            </div>

            {/* Join Action or Already Joined State */}
            <div className="pt-2">
              {alreadyJoined ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-[#17211B] border border-[#2C3F32] text-center text-xs text-[#B6F34A] font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>You are already a participant in this challenge!</span>
                  </div>
                  <Button
                    onClick={() => router.push(`/challenges/${challenge.id}`)}
                    className="w-full bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-black py-3 rounded-2xl shadow-glow-sm"
                  >
                    <span>Go to Challenge Leaderboard</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={joining || joinedSuccess}
                  className="w-full bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-black text-sm py-3.5 rounded-2xl shadow-glow-sm flex items-center justify-center gap-2"
                >
                  <Swords className="h-4 w-4 stroke-[2.5]" />
                  <span>
                    {joinedSuccess
                      ? "Joined! Entering Challenge..."
                      : joining
                      ? "Joining Challenge..."
                      : "JOIN CHALLENGE"}
                  </span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
