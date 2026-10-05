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
import { Challenge, HabitType } from "@/types";
import { Swords, Users, Calendar, Trophy } from "lucide-react";

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChallengeCreated: (challenge: Challenge) => void;
}

export function CreateChallengeModal({
  open,
  onOpenChange,
  onChallengeCreated,
}: CreateChallengeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [habitTitle, setHabitTitle] = useState("");
  const [habitType, setHabitType] = useState<HabitType>("measurable");
  const [targetValue, setTargetValue] = useState(50);
  const [unit, setUnit] = useState("reps");
  const [durationDays, setDurationDays] = useState(30);
  const [xpReward, setXpReward] = useState(350);
  const [rules, setRules] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !habitTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await StreaklyService.createChallenge({
        title: title.trim(),
        description: description.trim(),
        habit_title: habitTitle.trim(),
        habit_type: habitType,
        target_value: habitType === "measurable" ? Number(targetValue) || 1 : 1,
        unit: habitType === "measurable" ? unit.trim() || "reps" : "times",
        duration_days: Number(durationDays) || 30,
        xp_reward: Number(xpReward) || 300,
        rules: rules.trim() || "Log habit completion daily before midnight.",
      });

      onChallengeCreated(created);
      onOpenChange(false);
      // Reset
      setTitle("");
      setDescription("");
      setHabitTitle("");
      setRules("");
    } catch (err) {
      console.error("Failed to create challenge:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-[#B6F34A]" />
          <span>Launch Friend Challenge</span>
        </DialogTitle>
        <DialogDescription>
          Challenge your friends to stay accountable, compete on the leaderboard, and claim bonus XP.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Challenge Name */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Challenge Name *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 30 Day Push-Up Challenge, 14-Day 5K Run Sprint"
            required
          />
        </div>

        {/* Selected Habit */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Core Habit to Track *
          </label>
          <Input
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
            placeholder="e.g. 50 Push-Ups, 5km Morning Run, Read 20 Pages"
            required
          />
        </div>

        {/* Measurable or Yes/No */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Habit Type
            </label>
            <select
              value={habitType}
              onChange={(e) => setHabitType(e.target.value as HabitType)}
              className="flex h-11 w-full rounded-xl border border-[#202E24] bg-[#0B0F0D] px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:border-[#B6F34A]"
            >
              <option value="measurable">Measurable (e.g. 50 reps)</option>
              <option value="boolean">YES / NO Daily</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Duration
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="flex h-11 w-full rounded-xl border border-[#202E24] bg-[#0B0F0D] px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:border-[#B6F34A]"
            >
              <option value={7}>7 Days (Sprint)</option>
              <option value={14}>14 Days (Momentum)</option>
              <option value={21}>21 Days (Habit Builder)</option>
              <option value={30}>30 Days (Grand Challenge)</option>
            </select>
          </div>
        </div>

        {habitType === "measurable" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Daily Goal
              </label>
              <Input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                placeholder="50"
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
                placeholder="reps, km, pages"
                required
              />
            </div>
          </div>
        )}

        {/* Description & Rules */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Description
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why you're doing this challenge together"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Rules / Accountability Terms
          </label>
          <Input
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="e.g. Complete before midnight, photo check in group"
          />
        </div>

        {/* XP Reward */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Winner XP Bonus
          </label>
          <select
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="flex h-11 w-full rounded-xl border border-[#202E24] bg-[#0B0F0D] px-3 py-2 text-sm text-gray-100 focus-visible:outline-none focus-visible:border-[#B6F34A]"
          >
            <option value={200}>+200 XP Prize</option>
            <option value={350}>+350 XP Prize</option>
            <option value={500}>+500 XP Grand Prize</option>
          </select>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold shadow-glow"
            disabled={isSubmitting || !title.trim() || !habitTitle.trim()}
          >
            {isSubmitting ? "Creating Challenge..." : "Launch Challenge & Invite Friends"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
