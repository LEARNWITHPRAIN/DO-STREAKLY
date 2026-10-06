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
  MoreVertical,
  RotateCcw,
  FileText,
  Trash2,
  Timer,
  Swords,
} from "lucide-react";
import { Habit } from "@/types";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface HabitCardProps {
  habit: Habit;
  isFirst?: boolean;
  onComplete: (habitId: string, increment?: number, note?: string) => Promise<{
    streakIncreased: boolean;
  }>;
  onUndo?: (habitId: string) => Promise<void>;
  onDelete?: (habitId: string) => Promise<void>;
  onSaveNote?: (habitId: string, note: string) => Promise<void>;
  onOpenTimer?: (habit: Habit) => void;
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

export function HabitCard({
  habit,
  isFirst,
  onComplete,
  onUndo,
  onDelete,
  onSaveNote,
  onOpenTimer,
}: HabitCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(habit.today_note || "");

  const IconComponent = ICON_MAP[habit.icon] || Flame;
  const isCompleted = habit.is_completed_today;
  const isMeasurable = habit.type === "measurable" || habit.habit_type === "measurable";
  const currentVal = habit.today_progress || 0;
  const targetVal = habit.goal || habit.target_value || 1;

  const handleToggle = async (increment?: number) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onComplete(habit.id, increment);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUndoAction = async () => {
    setShowMenu(false);
    if (!onUndo) return;
    setIsUpdating(true);
    try {
      await onUndo(habit.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveNote) return;
    await onSaveNote(habit.id, noteText);
    setShowNoteInput(false);
  };

  return (
    <motion.div
      id={isFirst ? "first-habit-card" : undefined}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-2xl border p-4 md:p-5 transition-all duration-300",
        isCompleted
          ? "border-[#B6F34A]/40 bg-[#121A15] shadow-glow-sm"
          : "border-[#202E24] bg-[#121814] hover:border-[#2C3F32] hover:bg-[#151D18]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Habit Information */}
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
                {habit.name || habit.title}
              </h4>

              {/* Challenge Tag (if part of challenge) */}
              {habit.is_challenge_habit && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  <Swords className="h-3 w-3 inline" />
                  Challenge
                </span>
              )}

              {/* Time of Day Tag */}
              {habit.time_of_day && habit.time_of_day !== "anytime" && (
                <span className="rounded-full bg-[#17211B] border border-[#2C3F32] px-2 py-0.5 text-[10px] font-semibold text-gray-300 capitalize">
                  {habit.time_of_day}
                </span>
              )}
            </div>

            {habit.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                {habit.description}
              </p>
            )}

            {/* Streak & Timer Link */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 flex-wrap">
              <div className="flex items-center gap-1 font-semibold text-orange-400">
                <Flame className="h-3.5 w-3.5 fill-orange-400" />
                <span>{habit.current_streak || 0} day streak</span>
              </div>

              {habit.use_timer && onOpenTimer && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => onOpenTimer(habit)}
                    className="flex items-center gap-1 text-[#B6F34A] hover:underline font-medium"
                  >
                    <Timer className="h-3.5 w-3.5" />
                    <span>Focus Timer</span>
                  </button>
                </>
              )}

              {habit.today_note && (
                <>
                  <span>•</span>
                  <span className="text-gray-300 italic truncate max-w-[150px]">
                    "{habit.today_note}"
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Checkbox & More Actions Button */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Measurable quick increment or Direct Checkbox */}
          {isMeasurable && !isCompleted && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleToggle(Math.max(1, Math.round(targetVal * 0.25)))}
              disabled={isUpdating}
              className="h-10 px-2.5 rounded-xl border border-[#2C3F32] bg-[#17211B] text-xs font-bold text-gray-200 hover:border-[#B6F34A] hover:text-[#B6F34A] transition-colors"
            >
              +{Math.max(1, Math.round(targetVal * 0.25))}
            </motion.button>
          )}

          {/* Master Checkbox */}
          <motion.button
            id={isFirst ? "habit-checkbox" : undefined}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleToggle(targetVal)}
            disabled={isCompleted || isUpdating}
            title={isCompleted ? "Completed today!" : "Check to finish habit"}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
              isCompleted
                ? "bg-[#B6F34A] text-[#0B0F0D] shadow-glow-sm cursor-default"
                : "border-2 border-[#2C3F32] bg-[#17211B] text-transparent hover:border-[#B6F34A] hover:text-[#B6F34A]/50"
            )}
          >
            <Check
              className={cn(
                "h-6 w-6 stroke-[3]",
                isCompleted ? "opacity-100" : "opacity-0 hover:opacity-100"
              )}
            />
          </motion.button>

          {/* More Actions button '...' (Step 3 of Tutorial) */}
          <div className="relative">
            <button
              id={isFirst ? "habit-more-actions" : undefined}
              onClick={() => setShowMenu((prev) => !prev)}
              title="More actions"
              className="flex h-10 w-9 items-center justify-center rounded-xl border border-[#202E24] bg-[#121814] text-gray-400 hover:text-white hover:border-[#2C3F32] transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown Menu (Step 4 of Tutorial highlights UNDO) */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-12 z-30 w-44 rounded-2xl border border-[#202E24] bg-[#17211B] p-1.5 shadow-2xl"
                >
                  {/* UNDO Item (Step 4 of Tutorial) */}
                  <button
                    id={isFirst ? "habit-undo-menu-item" : undefined}
                    onClick={handleUndoAction}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-400/10 transition-colors text-left"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Undo completion</span>
                  </button>

                  {/* Add / Edit Note */}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowNoteInput((prev) => !prev);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-300 hover:bg-[#202E24] hover:text-white transition-colors text-left"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{habit.today_note ? "Edit note" : "Add note"}</span>
                  </button>

                  {/* Focus Timer */}
                  {onOpenTimer && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenTimer(habit);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-300 hover:bg-[#202E24] hover:text-white transition-colors text-left"
                    >
                      <Timer className="h-3.5 w-3.5" />
                      <span>Open Timer</span>
                    </button>
                  )}

                  {/* Delete Habit */}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(habit.id);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors text-left"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete habit</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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

      {/* Inline Note editor */}
      {showNoteInput && (
        <form onSubmit={handleSaveNoteSubmit} className="mt-3 pt-3 border-t border-[#1C2922] flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add note for today's habit..."
            className="flex-1 rounded-xl border border-[#202E24] bg-[#0B0F0D] px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B6F34A]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[#B6F34A] text-[#0B0F0D] text-xs font-bold hover:bg-[#a3e635]"
          >
            Save
          </button>
        </form>
      )}
    </motion.div>
  );
}
