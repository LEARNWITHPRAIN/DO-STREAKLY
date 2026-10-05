"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Flame,
  Sparkles,
  Swords,
  Trophy,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  ChevronRight,
  Activity,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function LandingPage() {
  const [activeDemoProgress, setActiveDemoProgress] = useState(15);
  const [isDoneDemo, setIsDoneDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-gray-100 selection:bg-[#B6F34A]/30 selection:text-white">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#202E24] bg-[#0B0F0D]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[#B6F34A]/50 shadow-glow-sm transition-transform group-hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="DO STREAKLY"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-display text-xl font-black tracking-tight text-white flex items-center">
              DO <span className="text-[#B6F34A] ml-1.5">STREAKLY</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#habits" className="hover:text-white transition-colors">
              Habit System
            </a>
            <a href="#challenges" className="hover:text-white transition-colors flex items-center gap-1.5">
              <span>Friend Challenges</span>
              <span className="rounded-full bg-[#B6F34A]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#B6F34A]">
                USP
              </span>
            </a>
            <a href="#leaderboard" className="hover:text-white transition-colors">
              Leaderboard
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-gray-300">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="font-bold shadow-glow-sm">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B6F34A]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B6F34A]/30 bg-[#17211B] px-4 py-1.5 shadow-glow-sm">
              <Flame className="h-4 w-4 fill-orange-400 text-orange-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
                The Social Habit Platform
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#B6F34A]" />
              <span className="text-xs font-semibold text-[#B6F34A]">
                Personal + Social Accountability
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08]">
              Better habits. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6F34A] via-[#84CC16] to-white">
                Together.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Build habits together. Challenge your friends. Stay accountable.
              Daily streaks, verifiable XP, and live friendly competition.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold shadow-glow gap-2"
                >
                  <span>Start Your Streak</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <a href="#preview" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-13 px-6 text-base font-semibold border-[#2C3F32] hover:border-[#B6F34A]/50"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Micro social proof */}
            <div className="pt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
              <div className="flex -space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                  alt=""
                  className="h-6 w-6 rounded-full border border-[#0B0F0D] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                  alt=""
                  className="h-6 w-6 rounded-full border border-[#0B0F0D] object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                  alt=""
                  className="h-6 w-6 rounded-full border border-[#0B0F0D] object-cover"
                />
              </div>
              <span>
                Joined by <strong className="text-white">1,400+ daily streakers</strong> keeping each other accountable
              </span>
            </div>
          </motion.div>

          {/* 3. PRODUCT PREVIEW INTERFACE (Real UI mockup as required by prompt) */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-[#2C3F32] bg-[#121814] p-3 sm:p-5 md:p-6 shadow-2xl shadow-black/90 relative">
              {/* Fake Window Controls */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#202E24]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-gray-500 font-mono ml-2">dostreakly.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#B6F34A]">
                  <Flame className="h-3.5 w-3.5 fill-[#B6F34A]" />
                  <span>🔥 12 DAY STREAK ALIVE</span>
                </div>
              </div>

              {/* Interactive Dashboard UI Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
                {/* Left 2 cols: Today's habits */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Today's Habits
                      </h4>
                      <p className="text-xs text-gray-400">4 / 5 habits completed</p>
                    </div>
                    <span className="text-xs font-bold text-[#B6F34A] rounded-full bg-[#17211B] border border-[#2C3F32] px-2.5 py-1">
                      +85 XP earned today
                    </span>
                  </div>

                  {/* Habit 1: Measurable */}
                  <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#17211B] text-[#B6F34A] flex items-center justify-center font-bold">
                          📖
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Read Non-Fiction Book</p>
                          <p className="text-xs text-gray-400">
                            {isDoneDemo ? "20 / 20 pages" : `${activeDemoProgress} / 20 pages`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveDemoProgress(20);
                          setIsDoneDemo(true);
                        }}
                        className={`h-9 px-3 rounded-lg text-xs font-bold transition-all ${
                          isDoneDemo
                            ? "bg-[#B6F34A] text-[#0B0F0D]"
                            : "border border-[#2C3F32] bg-[#17211B] text-gray-300 hover:border-[#B6F34A]"
                        }`}
                      >
                        {isDoneDemo ? "✓ Done (+20 XP)" : "+5 Pages"}
                      </button>
                    </div>
                    <div className="mt-2.5">
                      <Progress
                        value={isDoneDemo ? 20 : activeDemoProgress}
                        max={20}
                        className="h-1.5"
                      />
                    </div>
                  </div>

                  {/* Habit 2: Yes/No Done */}
                  <div className="rounded-xl border border-[#B6F34A]/30 bg-[#121A15] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#B6F34A] text-[#0B0F0D] flex items-center justify-center font-bold">
                        ⚡
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Morning 5km Run</p>
                        <p className="text-xs text-gray-400">Completed at 7:15 AM • +40 XP</p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-[#B6F34A] text-[#0B0F0D] flex items-center justify-center font-black text-sm">
                      ✓
                    </div>
                  </div>

                  {/* Habit 3: Push-ups */}
                  <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#17211B] text-[#B6F34A] flex items-center justify-center font-bold">
                        💪
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">50 Push-Ups</p>
                        <p className="text-xs text-gray-400">50 reps completed • +25 XP</p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-[#B6F34A] text-[#0B0F0D] flex items-center justify-center font-black text-sm">
                      ✓
                    </div>
                  </div>
                </div>

                {/* Right 1 col: Challenge & Leaderboard */}
                <div className="space-y-3">
                  {/* Challenge widget */}
                  <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-orange-400 flex items-center gap-1">
                        <Swords className="h-3.5 w-3.5" /> 30-Day Challenge
                      </span>
                      <span className="text-gray-400">18 days left</span>
                    </div>
                    <h5 className="font-display font-bold text-sm text-white">
                      30 Day Push-Up Challenge
                    </h5>
                    <p className="text-xs text-gray-400 mt-0.5">5 friends participating</p>
                    <div className="mt-3 flex items-center justify-between text-xs border-t border-[#1C2922] pt-2">
                      <span className="text-gray-400">Your Rank:</span>
                      <span className="font-bold text-[#B6F34A]">🥈 #2 (590 XP)</span>
                    </div>
                  </div>

                  {/* Friend Leaderboard snippet */}
                  <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> Leaderboard
                      </span>
                      <span className="text-gray-400">Week 4</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">🥇 Rahul Sharma</span>
                        <span className="text-amber-400 font-bold">1,420 XP</span>
                      </div>
                      <div className="flex items-center justify-between text-[#B6F34A] font-bold bg-[#17211B] p-1.5 rounded-lg border border-[#B6F34A]/20">
                        <span>🥈 You (Alex Vance)</span>
                        <span>1,240 XP</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>🥉 Prakhar Gupta</span>
                        <span>1,180 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 border-t border-[#202E24] bg-[#0E1310]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B6F34A]">
              Simple & Motivating
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
              The Daily Streak Loop
            </h2>
            <p className="text-sm text-gray-400">
              Designed around a frictionless daily loop. Zero bloat. Pure consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-6 space-y-4 hover:border-[#2C3F32] transition-colors">
              <div className="h-12 w-12 rounded-xl bg-[#17211B] border border-[#202E24] text-[#B6F34A] flex items-center justify-center font-display font-black text-lg">
                01
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Track Daily Habits
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Log YES/NO completion habits or numerical targets (e.g. 5km, 20 pages, 50 push-ups) in seconds.
              </p>
            </div>

            <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-6 space-y-4 hover:border-[#2C3F32] transition-colors">
              <div className="h-12 w-12 rounded-xl bg-[#17211B] border border-[#202E24] text-[#B6F34A] flex items-center justify-center font-display font-black text-lg">
                02
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Rack Up XP & Streaks
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every logged habit awards verifiable XP. Level up your profile, earn achievement badges, and protect your flame.
              </p>
            </div>

            <div className="rounded-2xl border border-[#B6F34A]/30 bg-[#17211B] p-6 space-y-4 shadow-glow-sm">
              <div className="h-12 w-12 rounded-xl bg-[#B6F34A] text-[#0B0F0D] flex items-center justify-center font-display font-black text-lg">
                03
              </div>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <span>Challenge Friends</span>
                <span className="text-[10px] uppercase font-bold text-[#B6F34A] rounded-full bg-[#121814] px-2 py-0.5">
                  USP
                </span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Launch 30-day challenges against your circle. Real accountability, live leaderboards, and zero excuses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FRIEND CHALLENGES SHOWCASE (MAIN USP) */}
      <section id="challenges" className="py-20 border-t border-[#202E24] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B6F34A]/30 bg-[#17211B] px-3.5 py-1 text-xs font-bold text-[#B6F34A]">
                <Swords className="h-3.5 w-3.5" />
                <span>The Core Advantage</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Habit tracking alone is hard. <br />
                <span className="text-[#B6F34A]">Challenges make it inevitable.</span>
              </h2>

              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                Most habit apps fail because willpower is temporary. DO STREAKLY introduces high-stakes, friendly social challenges.
                Invite your friends, set a 30-day duration, and watch your consistency skyrocket.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-6 w-6 rounded-full bg-[#B6F34A]/20 flex items-center justify-center text-[#B6F34A]">
                    ✓
                  </div>
                  <span>Real-time challenge leaderboards updated on every habit check</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-6 w-6 rounded-full bg-[#B6F34A]/20 flex items-center justify-center text-[#B6F34A]">
                    ✓
                  </div>
                  <span>Custom durations (7, 14, 21, or 30 days) and winner XP rewards</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-6 w-6 rounded-full bg-[#B6F34A]/20 flex items-center justify-center text-[#B6F34A]">
                    ✓
                  </div>
                  <span>Measurable units or daily YES/NO accountability rules</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/signup">
                  <Button size="lg" className="font-bold shadow-glow gap-2">
                    <span>Create a Friend Challenge</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Card showing Challenge */}
            <div className="rounded-3xl border border-[#2C3F32] bg-gradient-to-br from-[#121814] to-[#1A261F] p-6 md:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-400">
                  🔥 Active Challenge
                </span>
                <span className="text-xs text-[#B6F34A] font-bold">18 Days Remaining</span>
              </div>

              <h3 className="font-display text-2xl font-black text-white">
                30 Day Push-Up Challenge
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Goal: 50 push-ups every single day before midnight.
              </p>

              {/* Leaderboard Inside Challenge */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#0B0F0D] border border-[#202E24] p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-amber-400">🥇</span>
                    <div>
                      <p className="text-xs font-bold text-white">Rahul Sharma</p>
                      <p className="text-[10px] text-gray-400">12/12 days logged</p>
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-[#B6F34A]">1,240 XP</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#17211B] border border-[#B6F34A]/40 p-3 shadow-glow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-slate-300">🥈</span>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Alex Vance <span className="text-[#B6F34A] font-normal">(You)</span>
                      </p>
                      <p className="text-[10px] text-gray-400">11/12 days logged</p>
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-[#B6F34A]">1,180 XP</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#0B0F0D] border border-[#202E24] p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-amber-600">🥉</span>
                    <div>
                      <p className="text-xs font-bold text-white">Aman Verma</p>
                      <p className="text-[10px] text-gray-400">10/12 days logged</p>
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-[#B6F34A]">1,020 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 border-t border-[#202E24] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-[#B6F34A]/30 bg-gradient-to-b from-[#17211B] to-[#121814] p-8 sm:p-14 space-y-6 shadow-glow">
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to build streaks that actually last?
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
              Join DO STREAKLY today. Track your habits, challenge your friends, and level up together.
            </p>
            <div className="pt-2">
              <Link href="/signup">
                <Button size="lg" className="h-13 px-8 text-base font-bold shadow-glow gap-2">
                  <span>Start Your Streak Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[#202E24] py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 rounded-md overflow-hidden border border-[#B6F34A]/40">
              <Image src="/logo.jpg" alt="DO STREAKLY" fill className="object-cover" />
            </div>
            <span className="font-display font-black text-white">
              DO <span className="text-[#B6F34A]">STREAKLY</span>
            </span>
          </div>
          <p>© {new Date().getFullYear()} DO STREAKLY. Better habits. Together.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-300">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-gray-300">
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
