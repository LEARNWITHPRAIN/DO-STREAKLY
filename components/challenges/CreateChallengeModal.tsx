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
import { Challenge } from "@/types";
import { QRCodeSVG } from "./QRCodeSVG";
import {
  Swords,
  Calendar,
  Plus,
  Trash2,
  Share2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChallengeCreated: (challenge: Challenge) => void;
}

interface NewChallengeHabit {
  name: string;
  type: "yes_no" | "measurable";
  unit: string;
  target: number;
  points: number;
  log_before_midnight: boolean;
}

export function CreateChallengeModal({
  open,
  onOpenChange,
  onChallengeCreated,
}: CreateChallengeModalProps) {
  // Screen 1: Name, Duration, Start Date
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [durationDays, setDurationDays] = useState<number>(14);
  const [customDays, setCustomDays] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");

  // Screen 2: Habits array
  const [habits, setHabits] = useState<NewChallengeHabit[]>([
    {
      name: "",
      type: "measurable",
      unit: "reps",
      target: 50,
      points: 20,
      log_before_midnight: true,
    },
  ]);

  // Screen 4: Created challenge & Share state
  const [createdChallenge, setCreatedChallenge] = useState<Challenge | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDuration = customDays ? Number(customDays) || 14 : durationDays;

  // Add / remove habits in Screen 2
  const handleAddHabit = () => {
    setHabits((prev) => [
      ...prev,
      {
        name: "",
        type: "yes_no",
        unit: "times",
        target: 1,
        points: 10,
        log_before_midnight: false,
      },
    ]);
  };

  const handleRemoveHabit = (index: number) => {
    if (habits.length <= 1) return;
    setHabits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateHabit = (
    index: number,
    field: keyof NewChallengeHabit,
    value: unknown
  ) => {
    setHabits((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Submit and advance to Screen 4 (Share Screen)
  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const newChal = await StreaklyService.createChallenge({
        name: name.trim(),
        duration_days: activeDuration,
        start_date: startDate,
        description: description.trim(),
        habits: habits.map((h) => ({
          name: h.name.trim() || "Challenge Habit",
          type: h.type,
          unit: h.type === "measurable" ? h.unit.trim() || "reps" : "times",
          target: h.type === "measurable" ? Number(h.target) || 1 : 1,
          points: Number(h.points) || 10,
          log_before_midnight: h.log_before_midnight,
        })),
      });

      setCreatedChallenge(newChal);
      onChallengeCreated(newChal);
      setScreen(4); // Advance to Share screen
    } catch (e) {
      console.error("Create challenge error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Share link helpers
  const shareUrl = typeof window !== "undefined" && createdChallenge
    ? `${window.location.origin}/join/${createdChallenge.invite_code}`
    : `https://dostreakly.vercel.app/join/${createdChallenge?.invite_code || "ABC123"}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWebShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Join "${createdChallenge?.name}" on DO STREAKLY!`,
          text: `I started a habit challenge "${createdChallenge?.name}". Join me, earn points daily, and let's see who tops the leaderboard!`,
          url: shareUrl,
        });
      } catch (err) {
        console.warn("Web Share cancelled or unsupported:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleResetAndClose = () => {
    setScreen(1);
    setName("");
    setDurationDays(14);
    setCustomDays("");
    setHabits([
      {
        name: "",
        type: "measurable",
        unit: "reps",
        target: 50,
        points: 20,
        log_before_midnight: true,
      },
    ]);
    setCreatedChallenge(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleResetAndClose}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-amber-400" />
          <span>Create Friend Challenge</span>
        </DialogTitle>
        <DialogDescription>
          {screen === 1 && "Step 1 of 3: Challenge name and duration"}
          {screen === 2 && "Step 2 of 3: Add habits, daily targets & points"}
          {screen === 3 && "Step 3 of 3: Review and launch challenge"}
          {screen === 4 && "Invite friends: Share link, WhatsApp, or QR Code"}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4">
        {/* ========================================================= */}
        {/* SCREEN 1: Challenge Name, Duration, Start Date */}
        {/* ========================================================= */}
        {screen === 1 && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Challenge Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 14-Day 5K Run Sprint, 30-Day Pushup War"
                className="bg-[#0B0F0D] border-[#202E24] text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">
                Challenge Duration
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setDurationDays(days);
                      setCustomDays("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      durationDays === days && !customDays
                        ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A]"
                        : "border-[#202E24] bg-[#0B0F0D] text-gray-300 hover:border-[#2C3F32]"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Or custom days (e.g. 45)"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="bg-[#0B0F0D] border-[#202E24] text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#0B0F0D] border-[#202E24] text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Optional Note / Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Highest total points wins the bragging rights!"
                className="bg-[#0B0F0D] border-[#202E24] text-white"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-[#202E24]">
              <Button
                onClick={() => setScreen(2)}
                disabled={!name.trim()}
                className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold"
              >
                <span>Next: Add Habits</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: Add Habits, Types, Daily Points, Midnight Rule */}
        {/* ========================================================= */}
        {screen === 2 && (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <p className="text-xs text-gray-400">
              For each habit, configure the type, daily points awarded, and optional midnight logging rule.
            </p>

            {habits.map((h, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-4 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#B6F34A] uppercase tracking-wider">
                    Habit #{idx + 1}
                  </span>
                  {habits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHabit(idx)}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Habit Name *
                  </label>
                  <Input
                    value={h.name}
                    onChange={(e) => handleUpdateHabit(idx, "name", e.target.value)}
                    placeholder="e.g. 50 Push-Ups, 5km Run, No Sugar"
                    className="bg-[#121814] border-[#202E24] text-white text-xs"
                    required
                  />
                </div>

                {/* Type: YES/NO or MEASURABLE */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateHabit(idx, "type", "yes_no")}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      h.type === "yes_no"
                        ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A]"
                        : "border-[#202E24] bg-[#121814] text-gray-400 hover:border-[#2C3F32]"
                    }`}
                  >
                    YES / NO Habit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateHabit(idx, "type", "measurable")}
                    className={`py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      h.type === "measurable"
                        ? "border-[#B6F34A] bg-[#1F2E25] text-[#B6F34A]"
                        : "border-[#202E24] bg-[#121814] text-gray-400 hover:border-[#2C3F32]"
                    }`}
                  >
                    MEASURABLE Target
                  </button>
                </div>

                {/* If Measurable: Target & Unit */}
                {h.type === "measurable" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Daily Target</label>
                      <Input
                        type="number"
                        value={h.target}
                        onChange={(e) => handleUpdateHabit(idx, "target", Number(e.target.value))}
                        className="bg-[#121814] border-[#202E24] text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Unit</label>
                      <Input
                        value={h.unit}
                        onChange={(e) => handleUpdateHabit(idx, "unit", e.target.value)}
                        placeholder="reps, km, mins, pages"
                        className="bg-[#121814] border-[#202E24] text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Points: How many points this habit is worth per day */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-300 block mb-1">
                      Daily Points (Stakes) *
                    </label>
                    <Input
                      type="number"
                      value={h.points}
                      onChange={(e) => handleUpdateHabit(idx, "points", Number(e.target.value))}
                      placeholder="10"
                      className="bg-[#121814] border-[#202E24] text-[#B6F34A] font-bold text-xs"
                    />
                  </div>

                  <div className="pt-3">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-300">
                      <input
                        type="checkbox"
                        checked={h.log_before_midnight}
                        onChange={(e) => handleUpdateHabit(idx, "log_before_midnight", e.target.checked)}
                        className="rounded border-[#202E24] bg-[#121814] accent-[#B6F34A]"
                      />
                      <span>Log before midnight rule</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddHabit}
              className="flex items-center gap-1.5 text-xs font-bold text-[#B6F34A] hover:underline py-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add another habit to this challenge</span>
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-[#202E24]">
              <button
                type="button"
                onClick={() => setScreen(1)}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <Button
                onClick={() => setScreen(3)}
                disabled={habits.some((h) => !h.name.trim())}
                className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold"
              >
                <span>Review Challenge</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: Review Screen */}
        {/* ========================================================= */}
        {screen === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#202E24] bg-[#0B0F0D] p-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Challenge</span>
                <h3 className="font-display text-lg font-black text-white">{name}</h3>
                <p className="text-xs text-gray-400">
                  {activeDuration} days • Starts on {startDate}
                </p>
                {description && <p className="text-xs text-gray-300 mt-1 italic">"{description}"</p>}
              </div>

              <div className="pt-2 border-t border-[#1C2922] space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Habits Included</span>
                {habits.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-[#121814] border border-[#202E24]"
                  >
                    <div>
                      <span className="font-bold text-white">{h.name}</span>
                      <span className="text-gray-400 ml-2">
                        {h.type === "measurable" ? `(${h.target} ${h.unit})` : "(Yes/No)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#B6F34A]">+{h.points} pts/day</span>
                      {h.log_before_midnight && (
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          Midnight
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#202E24]">
              <button
                type="button"
                onClick={() => setScreen(2)}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-black shadow-glow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSubmitting ? "Creating..." : "Create Challenge"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: Share Screen with Link, Web Share & QR Code */}
        {/* ========================================================= */}
        {screen === 4 && createdChallenge && (
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B6F34A] px-2.5 py-1 rounded-full bg-[#B6F34A]/10 border border-[#B6F34A]/30">
                Challenge Created!
              </span>
              <h3 className="font-display text-xl font-black text-white mt-2">
                Invite Your Friends
              </h3>
              <p className="text-xs text-gray-400">
                Share this unique invite link with friends on WhatsApp, Instagram, or have them scan the QR code.
              </p>
            </div>

            {/* QR Code SVG */}
            <div className="flex justify-center my-3">
              <QRCodeSVG value={shareUrl} size={160} />
            </div>

            {/* Unique Invite Code Pill */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-gray-400">Invite Code:</span>
              <span className="font-mono text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                {createdChallenge.invite_code}
              </span>
            </div>

            {/* Share link box */}
            <div className="flex items-center gap-2 rounded-xl border border-[#202E24] bg-[#0B0F0D] p-2 text-left">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-gray-300 focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#17211B] hover:bg-[#202E24] text-xs font-bold text-[#B6F34A] transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Buttons: Web Share & Done */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleWebShare}
                className="gap-2 border-[#202E24] bg-[#17211B] text-white hover:bg-[#202E24]"
              >
                <Share2 className="h-4 w-4" />
                <span>Share via App</span>
              </Button>
              <Button
                type="button"
                onClick={handleResetAndClose}
                className="bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-black"
              >
                <span>View Challenge</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
