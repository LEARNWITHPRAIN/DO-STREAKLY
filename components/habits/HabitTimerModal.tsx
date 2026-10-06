"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
  Flame,
} from "lucide-react";
import { Habit } from "@/types";
import { Button } from "@/components/ui/button";
import { triggerConfetti } from "@/lib/confetti";

interface HabitTimerModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteHabit: (habitId: string, durationMinutes: number) => void;
}

interface SavedTimerState {
  habitId: string;
  totalSeconds: number;
  status: "idle" | "running" | "paused";
  startedAtTimestamp?: number;
  accumulatedElapsedSeconds: number;
}

export function HabitTimerModal({
  habit,
  isOpen,
  onClose,
  onCompleteHabit,
}: HabitTimerModalProps) {
  const [totalSeconds, setTotalSeconds] = useState(1500); // 25 mins default
  const [remainingSeconds, setRemainingSeconds] = useState(1500);
  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "paused">("idle");
  const [isFinished, setIsFinished] = useState(false);

  const STORAGE_KEY = `dostreakly_timer_${habit?.id || "active"}`;

  // Audio chime helper using Web Audio API
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Gentle celebratory arpeggio (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.2, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.7);
      });
    } catch (e) {
      console.warn("Audio chime prevented by browser policy:", e);
    }
  };

  // Initialize or restore timer state from localStorage
  useEffect(() => {
    if (!habit || !isOpen) return;

    const defaultSecs = habit.timer_duration_seconds || (habit.goal ? habit.goal * 60 : 1500);
    setTotalSeconds(defaultSecs);

    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const saved: SavedTimerState = JSON.parse(savedRaw);
        if (saved.habitId === habit.id) {
          let elapsed = saved.accumulatedElapsedSeconds || 0;
          if (saved.status === "running" && saved.startedAtTimestamp) {
            const extra = Math.floor((Date.now() - saved.startedAtTimestamp) / 1000);
            elapsed += Math.max(0, extra);
          }

          const rem = Math.max(0, saved.totalSeconds - elapsed);
          setTotalSeconds(saved.totalSeconds);
          setRemainingSeconds(rem);
          setTimerStatus(rem === 0 ? "idle" : saved.status);
          if (rem === 0) {
            setIsFinished(true);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Timer load failed:", e);
    }

    setRemainingSeconds(defaultSecs);
    setTimerStatus("idle");
    setIsFinished(false);
  }, [habit, isOpen, STORAGE_KEY]);

  // Master timer tick loop with Visibility Change / Tab switch listener
  useEffect(() => {
    if (timerStatus !== "running" || !habit) return;

    const interval = setInterval(() => {
      // Re-read timestamp from localStorage for perfect accuracy even through tab throttling
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (!savedRaw) return;

      const saved: SavedTimerState = JSON.parse(savedRaw);
      let elapsed = saved.accumulatedElapsedSeconds || 0;
      if (saved.startedAtTimestamp) {
        elapsed += Math.floor((Date.now() - saved.startedAtTimestamp) / 1000);
      }

      const rem = Math.max(0, saved.totalSeconds - elapsed);
      setRemainingSeconds(rem);

      if (rem === 0) {
        clearInterval(interval);
        setTimerStatus("idle");
        setIsFinished(true);
        playChime();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([300, 150, 300]);
        }
        triggerConfetti();
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 500);

    // Tab visibility change listener: recalculate immediately upon regaining focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const savedRaw = localStorage.getItem(STORAGE_KEY);
        if (savedRaw) {
          const saved: SavedTimerState = JSON.parse(savedRaw);
          let elapsed = saved.accumulatedElapsedSeconds || 0;
          if (saved.startedAtTimestamp) {
            elapsed += Math.floor((Date.now() - saved.startedAtTimestamp) / 1000);
          }
          const rem = Math.max(0, saved.totalSeconds - elapsed);
          setRemainingSeconds(rem);
          if (rem === 0) {
            setTimerStatus("idle");
            setIsFinished(true);
            playChime();
            triggerConfetti();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [timerStatus, habit, STORAGE_KEY]);

  if (!isOpen || !habit) return null;

  const handleStart = () => {
    const now = Date.now();
    const elapsedSoFar = totalSeconds - remainingSeconds;
    const state: SavedTimerState = {
      habitId: habit.id,
      totalSeconds,
      status: "running",
      startedAtTimestamp: now,
      accumulatedElapsedSeconds: elapsedSoFar,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setTimerStatus("running");
    setIsFinished(false);
  };

  const handlePause = () => {
    const elapsedSoFar = totalSeconds - remainingSeconds;
    const state: SavedTimerState = {
      habitId: habit.id,
      totalSeconds,
      status: "paused",
      accumulatedElapsedSeconds: elapsedSoFar,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setTimerStatus("paused");
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRemainingSeconds(totalSeconds);
    setTimerStatus("idle");
    setIsFinished(false);
  };

  const handleCompleteAndClose = () => {
    const minutesCompleted = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60) || Math.round(totalSeconds / 60));
    onCompleteHabit(habit.id, minutesCompleted);
    localStorage.removeItem(STORAGE_KEY);
    triggerConfetti();
    onClose();
  };

  // Format MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Progress percentage
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm rounded-3xl border border-[#202E24] bg-[#121814] p-6 shadow-2xl text-center text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:text-white hover:bg-[#1C2922] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Habit header */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B6F34A] px-2.5 py-1 rounded-full bg-[#B6F34A]/10 border border-[#B6F34A]/20">
              Focus Timer
            </span>
            <h3 className="text-xl font-bold font-display mt-2 text-white">
              {habit.name || habit.title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Survives tab switches and runs in the background.
            </p>
          </div>

          {/* Circular / Large timer display */}
          <div className="my-6 relative flex flex-col items-center justify-center">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-4 border-[#1C2922] bg-[#0B0F0D] shadow-inner">
              {/* Animated Progress Ring SVG */}
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="104"
                  cy="104"
                  r="96"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-[#17211B]"
                />
                <circle
                  cx="104"
                  cy="104"
                  r="96"
                  stroke="#B6F34A"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="603"
                  strokeDashoffset={603 - (603 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>

              <div className="relative z-10">
                <div className="font-display text-4xl font-black tracking-tight text-white">
                  {timeFormatted}
                </div>
                <div className="text-[11px] font-medium text-gray-400 mt-1 capitalize">
                  {isFinished ? "Completed! 🎉" : timerStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {timerStatus === "idle" && !isFinished && (
              <Button
                onClick={handleStart}
                className="w-full gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold text-sm py-3 rounded-2xl shadow-glow-sm"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Session</span>
              </Button>
            )}

            {timerStatus === "running" && (
              <>
                <Button
                  onClick={handlePause}
                  variant="outline"
                  className="flex-1 gap-2 border-[#202E24] bg-[#17211B] text-white hover:bg-[#202E24] rounded-2xl"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause</span>
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-3 border-[#202E24] bg-[#17211B] text-gray-400 hover:text-white rounded-2xl"
                  title="Reset timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}

            {timerStatus === "paused" && (
              <>
                <Button
                  onClick={handleStart}
                  className="flex-1 gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold rounded-2xl shadow-glow-sm"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Resume</span>
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="px-3 border-[#202E24] bg-[#17211B] text-gray-400 hover:text-white rounded-2xl"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Quick Complete / Finish button */}
          <div className="mt-4 pt-3 border-t border-[#1C2922]">
            <Button
              onClick={handleCompleteAndClose}
              variant="ghost"
              className="w-full gap-2 text-xs font-bold text-[#B6F34A] hover:bg-[#B6F34A]/10 hover:text-[#B6F34A]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isFinished ? "Log & Finish Habit" : "Mark as Finished Now"}</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
