"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Habit, TimeOfDay } from "@/types";
import {
  Flame,
  Footprints,
  BookOpen,
  Dumbbell,
  Brain,
  AlarmClock,
  Droplets,
  Heart,
  Target,
  Sparkles,
  Timer,
  Clock,
} from "lucide-react";

interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitCreated: (habit: Habit) => void;
}

const AVAILABLE_ICONS = [
  { name: "Flame", icon: Flame },
  { name: "Footprints", icon: Footprints },
  { name: "BookOpen", icon: BookOpen },
  { name: "Dumbbell", icon: Dumbbell },
  { name: "Brain", icon: Brain },
  { name: "AlarmClock", icon: AlarmClock },
  { name: "Droplets", icon: Droplets },
  { name: "Heart", icon: Heart },
  { name: "Target", icon: Target },
];

export function CreateHabitModal({
  open,
  onOpenChange,
  onHabitCreated,
}: CreateHabitModalProps) {
  const [type, setType] = useState<"yes_no" | "measurable">("yes_no");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Flame");
  const [goal, setGoal] = useState(1);
  const [unit, setUnit] = useState("times");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [useTimer, setUseTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await StreaklyService.createHabit({
        name: name.trim(),
        title: name.trim(),
        description: description.trim(),
        icon,
        type,
        goal: type === "measurable" ? Number(goal) || 1 : 1,
        unit: type === "measurable" ? unit.trim() || "reps" : "times",
        time_of_day: timeOfDay,
        use_timer: useTimer,
        timer_duration_seconds: useTimer ? timerMinutes * 60 : undefined,
      });

      onHabitCreated(created);
      onOpenChange(false);

      // Reset form
      setName("");
      setDescription("");
      setType("yes_no");
      setGoal(1);
      setUnit("times");
      setTimeOfDay("morning");
      setUseTimer(false);
      setTimerMinutes(25);
    } catch (err) {
      console.error("Failed to create habit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#B6F34A]" />
          <span>Create Daily Habit</span>
        </DialogTitle>
        <DialogDescription>
          Build consistency with streaks, calendar records, and optional focus timers.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Type Tabs */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1.5">
            Habit Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType("yes_no");
                setUnit("times");
                setGoal(1);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                type === "yes_no"
                  ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A] shadow-glow-sm"
                  : "border-[#202E24] bg-[#0B0F0D] text-gray-400 hover:border-[#2C3F32]"
              }`}
            >
              YES / NO (Done / Not Done)
            </button>
            <button
              type="button"
              onClick={() => {
                setType("measurable");
                setUnit("reps");
                setGoal(20);
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                type === "measurable"
                  ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A] shadow-glow-sm"
                  : "border-[#202E24] bg-[#0B0F0D] text-gray-400 hover:border-[#2C3F32]"
              }`}
            >
              MEASURABLE (Target Value)
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Habit Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning 5km Run, Meditate, Read 20 Pages"
            className="bg-[#0B0F0D] border-[#202E24] text-white"
            required
            autoFocus
          />
        </div>

        {/* Time of Day */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Time of Day (Category)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "morning", label: "Morning" },
              { id: "afternoon", label: "Afternoon" },
              { id: "evening", label: "Evening" },
              { id: "anytime", label: "Anytime" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeOfDay(t.id as TimeOfDay)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  timeOfDay === t.id
                    ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A]"
                    : "border-[#202E24] bg-[#0B0F0D] text-gray-400 hover:border-[#2C3F32]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Measurable fields if applicable */}
        {type === "measurable" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Daily Goal
              </label>
              <Input
                type="number"
                min={1}
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="bg-[#0B0F0D] border-[#202E24] text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Unit
              </label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="reps, km, pages, mins"
                className="bg-[#0B0F0D] border-[#202E24] text-white"
                required
              />
            </div>
          </div>
        )}

        {/* Focus Timer Option */}
        <div className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-3 space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Enable Focus Timer</span>
            </div>
            <input
              type="checkbox"
              checked={useTimer}
              onChange={(e) => setUseTimer(e.target.checked)}
              className="accent-[#B6F34A] h-4 w-4 rounded"
            />
          </label>

          {useTimer && (
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1C2922]">
              <span className="text-xs text-gray-400">Duration (Minutes):</span>
              <Input
                type="number"
                min={1}
                max={180}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                className="w-24 bg-[#121814] border-[#202E24] text-xs text-white"
              />
            </div>
          )}
        </div>

        {/* Icon Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">
            Select Icon
          </label>
          <div className="grid grid-cols-9 gap-1.5">
            {AVAILABLE_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[#B6F34A] text-[#0B0F0D] scale-105 shadow-glow-sm"
                      : "bg-[#0B0F0D] text-gray-400 border border-[#202E24] hover:border-[#2C3F32] hover:text-white"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Why this habit? (Optional reminder)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. To start the day energized and focused"
            className="bg-[#0B0F0D] border-[#202E24] text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#202E24]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold"
          >
            {isSubmitting ? "Creating..." : "Save Habit"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
