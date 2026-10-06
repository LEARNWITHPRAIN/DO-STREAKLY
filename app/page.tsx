"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Flame,
  Swords,
  Trophy,
  Users,
  CheckCircle2,
  ArrowRight,
  Target,
  Timer,
  Clock,
  Sparkles,
  CalendarCheck,
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
              <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Points Stakes
              </span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-gray-300">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="font-bold bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] shadow-glow-sm">
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
                Solo Habits + Friend Challenges
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#B6F34A]" />
              <span className="text-xs font-semibold text-[#B6F34A]">
                Streaks • Timers • Points
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08]">
              Better habits. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6F34A] via-[#84CC16] to-white">
                Together.
              </span>
            </h1>

            {/* Subheadline: No personal XP claims */}
            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track daily habits with streaks, completion rates, and focus timers.
              Challenge friends in high-stakes Journey competitions with daily points and live leaderboards.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 text-base font-black bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] shadow-glow gap-2"
                >
                  <span>Start Your Streak</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </Button>
              </Link>

              <a href="#preview" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-13 px-6 text-base font-semibold border-[#2C3F32] hover:border-[#B6F34A]/50"
                >
                  See The App
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
                Joined by <strong className="text-white">1,400+ streakers</strong> building consistency
              </span>
            </div>
          </motion.div>

          {/* 3. PRODUCT PREVIEW INTERFACE (Updated Simple UI matching requirements) */}
          <div id="preview" className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-[#2C3F32] bg-[#121814] p-3 sm:p-5 md:p-6 shadow-2xl shadow-black/90 relative">
              {/* Fake Window Controls */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#202E24]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-gray-500 font-mono ml-2">dostreakly.app/today</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                  <Flame className="h-3.5 w-3.5 fill-orange-400" />
                  <span>12 DAY STREAK ALIVE</span>
                </div>
              </div>

              {/* Interactive Dashboard UI Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left">
                {/* Left 2 cols: Today's habits categorized by time */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Today's Habits
                      </h4>
                      <p className="text-xs text-gray-400">4 / 5 habits completed (80%)</p>
                    </div>
                    <span className="text-xs font-bold text-[#B6F34A] rounded-full bg-[#17211B] border border-[#2C3F32] px-2.5 py-1">
                      Morning & Afternoon
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
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">Read Non-Fiction Book</p>
                            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-[#17211B]">
                              afternoon
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
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
                        {isDoneDemo ? "✓ Done" : "+5 Pages"}
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

                  {/* Habit 2: Yes/No Done with streak */}
                  <div className="rounded-xl border border-[#B6F34A]/30 bg-[#121A15] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#B6F34A] text-[#0B0F0D] flex items-center justify-center font-bold">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">Morning 5km Run</p>
                          <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5">
                            <Flame className="h-3 w-3 fill-orange-400" /> 6d streak
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Completed at 7:15 AM</p>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-[#B6F34A] text-[#0B0F0D] flex items-center justify-center font-black text-sm">
                      ✓
                    </div>
                  </div>

                  {/* Habit 3: Focus Timer Block */}
                  <div className="rounded-xl border border-[#202E24] bg-[#0B0F0D] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-[#17211B] text-[#B6F34A] flex items-center justify-center font-bold">
                        🧠
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">Deep Work Sprint</p>
                          <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-400/10">
                            ⏱️ 25m Timer
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Survives tab switches in background</p>
                      </div>
                    </div>
                    <div className="h-8 px-2.5 rounded-lg border border-[#2C3F32] bg-[#17211B] text-xs font-bold text-[#B6F34A] flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      <span>Ready</span>
                    </div>
                  </div>
                </div>

                {/* Right 1 col: Friend Challenge & Live Points Leaderboard */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-500/30 bg-[#0B0F0D] p-3.5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Swords className="h-3.5 w-3.5" /> Friend Challenge
                      </span>
                      <span className="text-gray-400">18 days left</span>
                    </div>
                    <h5 className="font-display font-bold text-sm text-white">
                      30-Day Push-Up Challenge
                    </h5>
                    <p className="text-xs text-gray-400 mt-0.5">+20 points per daily log</p>

                    {/* Live Leaderboard Points */}
                    <div className="mt-3 pt-3 border-t border-[#1C2922] space-y-2 text-xs">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Live Points Leaderboard
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">🥇 Rahul Sharma</span>
                        <span className="text-amber-400 font-bold">220 pts</span>
                      </div>
                      <div className="flex items-center justify-between text-[#B6F34A] font-bold bg-[#17211B] p-1.5 rounded-lg border border-[#B6F34A]/20">
                        <span>🥈 You (Alex Vance)</span>
                        <span>200 pts</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>🥉 Prakhar Gupta</span>
                        <span>160 pts</span>
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
              The Daily Consistency Loop
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
                Categorized Habits
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Log YES/NO habits or measurable goals sorted by time of day (Morning, Afternoon, Evening) with one tap.
              </p>
            </div>

            <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-6 space-y-4 hover:border-[#2C3F32] transition-colors">
              <div className="h-12 w-12 rounded-xl bg-[#17211B] border border-[#202E24] text-[#B6F34A] flex items-center justify-center font-display font-black text-lg">
                02
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Streaks, Timers & Notes
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Build unbreakable streaks, track 7-day calendar consistency, run focus timers that survive tab switches, and log daily notes.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-[#17211B] p-6 space-y-4 shadow-glow-sm">
              <div className="h-12 w-12 rounded-xl bg-amber-400 text-[#0B0F0D] flex items-center justify-center font-display font-black text-lg">
                03
              </div>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <span>Friend Challenges</span>
                <span className="text-[10px] uppercase font-bold text-amber-300 rounded-full bg-[#121814] px-2 py-0.5 border border-amber-400/30">
                  Points
                </span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Launch friend challenges with custom point stakes. Share instant invite links, QR codes, and compete on live leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FRIEND CHALLENGES SHOWCASE */}
      <section id="challenges" className="py-20 border-t border-[#202E24] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#17211B] px-3.5 py-1 text-xs font-bold text-amber-300">
                <Swords className="h-3.5 w-3.5" />
                <span>Friend Challenges (Journey)</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Habit tracking alone is hard. <br />
                <span className="text-amber-300">Social stakes make it inevitable.</span>
              </h2>

              <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                Willpower fades; accountability doesn't. Create a challenge in 3 simple questions, set daily point values, enforce midnight logging rules, and invite friends with a single link or QR code.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-6 w-6 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                    ✓
                  </div>
                  <span>Points awarded daily when habits are logged and targets are met</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-6 w-6 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                    ✓
                  </div>
                  <span>Unique share links (WhatsApp, Instagram) and instant QR code join page</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-6 w-6 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                    ✓
                  </div>
                  <span>Live leaderboard rankings with final winner celebration</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/signup">
                  <Button size="lg" className="font-bold bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] shadow-glow gap-2">
                    <span>Create a Challenge</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Card showing Challenge */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#121814] to-[#1A261F] p-6 md:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-400">
                  🔥 Active Challenge
                </span>
                <span className="text-xs text-amber-400 font-bold">18 Days Remaining</span>
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
                  <span className="font-display text-xs font-bold text-[#B6F34A]">220 pts</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#17211B] border border-amber-400/40 p-3 shadow-glow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-slate-300">🥈</span>
                    <div>
                      <p className="text-xs font-bold text-white">
                        Alex Vance <span className="text-[#B6F34A] font-normal">(You)</span>
                      </p>
                      <p className="text-[10px] text-gray-400">11/12 days logged</p>
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-[#B6F34A]">200 pts</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#0B0F0D] border border-[#202E24] p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-amber-600">🥉</span>
                    <div>
                      <p className="text-xs font-bold text-white">Prakhar Gupta</p>
                      <p className="text-[10px] text-gray-400">10/12 days logged</p>
                    </div>
                  </div>
                  <span className="font-display text-xs font-bold text-[#B6F34A]">160 pts</span>
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
              Join DO STREAKLY today. Track your habits, challenge your friends, and build discipline together.
            </p>
            <div className="pt-2">
              <Link href="/signup">
                <Button size="lg" className="h-13 px-8 text-base font-black bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] shadow-glow gap-2">
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
