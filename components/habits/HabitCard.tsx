"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Flame,
  Plus,
  Footprints,
  BookOpen,
  Dumbbell,
  Brain,
  AlarmClock,
  Sparkles,
  Droplets,
  Heart,
  Target,
} from "lucide-react";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, increment?: number) => Promise<{
    xpEarned: number;
    streakIncreased: boolean;
  }>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Footprints,
  BookOpen,
  Dumbbell,
  Brain,
  AlarmClock,
  Droplets,
  Heart,
  Target,
};

export function HabitCard({ habit, onComplete }: HabitCardProps) {
  const [floatingXp, setFloatingXp] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const IconComponent = ICON_MAP[habit.icon] || Flame;
  const isCompleted = habit.is_completed_today;
  const isMeasurable = habit.habit_type === "measurable";
  const currentVal = habit.today_progress || 0;
  const targetVal = habit.target_value || 1;

  const handleToggle = async (increment?: number) => {
    if (isCompleted && habit.habit_type === "boolean") return;
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const res = await onComplete(habit.id, increment);
      if (res.xpEarned > 0) {
        setFloatingXp(res.xpEarned);
        setTimeout(() => setFloatingXp(null), 1500);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 md:p-5 transition-all duration-300",
        isCompleted
          ? "border-[#B6F34A]/40 bg-[#121A15] shadow-glow-sm"
          : "border-[#202E24] bg-[#121814] hover:border-[#2C3F32] hover:bg-[#151D18]"
      )}
    >
      {/* Floating XP Animation */}
      <AnimatePresence>
        {floatingXp !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -25, scale: 1.2 }}
            exit={{ opacity: 0, y: -45, scale: 0.9 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute right-6 top-3 z-20 pointer-events-none rounded-full bg-[#B6F34A] px-3 py-1 font-display text-sm font-black text-[#0B0F0D] shadow-glow"
          >
            +{floatingXp} XP! 🔥
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon & Habit Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              isCompleted
                ? "bg-[#B6F34A] text-[#0B0F0D]"
                : "bg-[#17211B] text-[#B6F34A] border border-[#202E24]"
            )}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={cn(
                  "font-display text-base md:text-lg font-bold truncate leading-tight",
                  isCompleted ? "text-white" : "text-gray-100"
                )}
              >
                {habit.title}
              </h4>
              <span className="rounded-full bg-[#1F2E25] border border-[#2C3F32] px-2 py-0.5 text-[11px] font-bold text-[#B6F34A]">
                +{habit.xp_value} XP
              </span>
            </div>

            {habit.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                {habit.description}
              </p>
            )}

            {/* Streak & Frequency Badge */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
              <div className="flex items-center gap-1 font-semibold text-orange-400">
                <Flame className="h-3.5 w-3.5 fill-orange-400" />
                <span>{habit.current_streak || 1} day streak</span>
              </div>
              <span>•</span>
              <span className="capitalize">{habit.frequency}</span>
            </div>
          </div>
        </div>

        {/* Right Action: Completion button / Check */}
        {!isMeasurable ? (
          <div className="shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleToggle()}
              disabled={isCompleted || isUpdating}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
                isCompleted
                  ? "bg-[#B6F34A] text-[#0B0F0D] shadow-glow-sm cursor-default"
                  : "border-2 border-[#2C3F32] bg-[#17211B] text-transparent hover:border-[#B6F34A] hover:text-[#B6F34A]/50"
              )}
            >
              <Check className={cn("h-6 w-6 stroke-[3]", isCompleted ? "opacity-100" : "opacity-0 hover:opacity-100")} />
            </motion.button>
          </div>
        ) : (
          <div className="shrink-0 flex items-center gap-1.5">
            {!isCompleted ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleToggle(Math.max(1, Math.round(targetVal * 0.25)))}
                disabled={isUpdating}
                className="h-10 px-3 rounded-xl border border-[#2C3F32] bg-[#17211B] text-xs font-bold text-gray-200 hover:border-[#B6F34A] hover:text-[#B6F34A] transition-colors"
              >
                +{Math.max(1, Math.round(targetVal * 0.25))}
              </motion.button>
            ) : null}

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleToggle(targetVal)}
              disabled={isCompleted || isUpdating}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
                isCompleted
                  ? "bg-[#B6F34A] text-[#0B0F0D] shadow-glow-sm cursor-default"
                  : "border-2 border-[#2C3F32] bg-[#17211B] text-transparent hover:border-[#B6F34A] hover:text-[#B6F34A]/50"
              )}
            >
              <Check className={cn("h-6 w-6 stroke-[3]", isCompleted ? "opacity-100" : "opacity-0 hover:opacity-100")} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Measurable Progress Bar */}
      {isMeasurable && (
        <div className="mt-4 pt-3 border-t border-[#1C2922]">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-gray-400">Daily Target</span>
            <span className={cn(isCompleted ? "text-[#B6F34A]" : "text-white")}>
              {currentVal} / {targetVal} {habit.unit}
            </span>
          </div>
          <Progress
            value={currentVal}
            max={targetVal}
            className="h-2 bg-[#17211B]"
          />
        </div>
      )}
    </motion.div>
  );
}
