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
import { Habit, HabitType, FrequencyType } from "@/types";
import {
  Flame,
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
  const [habitType, setHabitType] = useState<HabitType>("boolean");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Flame");
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState("reps");
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [xpValue, setXpValue] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await StreaklyService.createHabit({
        title: title.trim(),
        description: description.trim(),
        icon,
        habit_type: habitType,
        target_value: habitType === "measurable" ? Number(targetValue) || 1 : 1,
        unit: habitType === "measurable" ? unit.trim() || "reps" : "times",
        frequency,
        xp_value: Number(xpValue) || 20,
      });

      onHabitCreated(created);
      onOpenChange(false);
      // Reset form
      setTitle("");
      setDescription("");
      setHabitType("boolean");
      setTargetValue(1);
      setUnit("reps");
      setXpValue(25);
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
          <span>Create New Habit</span>
        </DialogTitle>
        <DialogDescription>
          Design a habit to build consistency, rack up XP, and challenge friends.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Type Selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Habit Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setHabitType("boolean");
                setXpValue(20);
              }}
              className={`rounded-xl border p-3 text-left transition-all ${
                habitType === "boolean"
                  ? "border-[#B6F34A] bg-[#1F2E25] text-white shadow-glow-sm"
                  : "border-[#202E24] bg-[#0B0F0D] text-gray-400 hover:border-[#2C3F32]"
              }`}
            >
              <div className="font-display font-bold text-sm text-white">
                YES / NO
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Completed or not (e.g. Wake up 6 AM, Meditate, Cold shower)
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setHabitType("measurable");
                setXpValue(35);
              }}
              className={`rounded-xl border p-3 text-left transition-all ${
                habitType === "measurable"
                  ? "border-[#B6F34A] bg-[#1F2E25] text-white shadow-glow-sm"
                  : "border-[#202E24] bg-[#0B0F0D] text-gray-400 hover:border-[#2C3F32]"
              }`}
            >
              <div className="font-display font-bold text-sm text-white">
                MEASURABLE
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Numerical target (e.g. 5 km run, 20 pages, 50 push-ups)
              </p>
            </button>
          </div>
        </div>

        {/* Habit Name */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Habit Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning 5km Run, 50 Push-Ups, Read 20 Pages"
            required
          />
        </div>

        {/* Measurable Fields */}
        {habitType === "measurable" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Daily Target
              </label>
              <Input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                placeholder="20"
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
                placeholder="pages, km, reps, mins"
                required
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Short Description / Note (Optional)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why this habit matters to you"
          />
        </div>

        {/* Frequency & XP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as FrequencyType)}
              className="flex h-11 w-full rounded-xl border border-[#202E24] bg-[#0B0F0D] px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:border-[#B6F34A]"
            >
              <option value="daily">Every Day</option>
              <option value="weekdays">Weekdays Only</option>
              <option value="weekends">Weekends Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              XP Reward
            </label>
            <select
              value={xpValue}
              onChange={(e) => setXpValue(Number(e.target.value))}
              className="flex h-11 w-full rounded-xl border border-[#202E24] bg-[#0B0F0D] px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:border-[#B6F34A]"
            >
              <option value="15">+15 XP (Light)</option>
              <option value="25">+25 XP (Standard)</option>
              <option value="40">+40 XP (Challenging)</option>
              <option value="50">+50 XP (Beast Mode)</option>
            </select>
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1.5">
            Select Icon
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {AVAILABLE_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A] shadow-glow-sm"
                      : "border-[#202E24] bg-[#0B0F0D] text-gray-400 hover:text-white hover:border-[#2C3F32]"
                  }`}
                >
                  <IconComp className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold shadow-glow"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? "Creating..." : "Create Habit"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
