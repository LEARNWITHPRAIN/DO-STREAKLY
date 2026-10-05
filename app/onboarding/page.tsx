"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Flame,
  Footprints,
  BookOpen,
  Dumbbell,
  Brain,
  AlarmClock,
  ArrowRight,
  Check,
} from "lucide-react";

const SUGGESTED_HABITS = [
  {
    title: "Morning 5km Run",
    description: "Daily cardio engine",
    icon: "Footprints",
    type: "measurable" as const,
    target: 5,
    unit: "km",
    xp: 40,
  },
  {
    title: "Read 20 Pages",
    description: "Wisdom & daily learning",
    icon: "BookOpen",
    type: "measurable" as const,
    target: 20,
    unit: "pages",
    xp: 20,
  },
  {
    title: "50 Push-Ups",
    description: "Upper body strength",
    icon: "Dumbbell",
    type: "measurable" as const,
    target: 50,
    unit: "reps",
    xp: 25,
  },
  {
    title: "Wake up by 6:00 AM",
    description: "Win the morning",
    icon: "AlarmClock",
    type: "boolean" as const,
    target: 1,
    unit: "times",
    xp: 15,
  },
  {
    title: "90 Min Deep Work",
    description: "Zero notifications sprint",
    icon: "Brain",
    type: "measurable" as const,
    target: 90,
    unit: "mins",
    xp: 35,
  },
  {
    title: "No Junk Food",
    description: "Clean nutrition discipline",
    icon: "Flame",
    type: "boolean" as const,
    target: 1,
    unit: "times",
    xp: 20,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedHabits, setSelectedHabits] = useState<number[]>([0, 1, 2]); // default 3 selected
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    StreaklyService.getProfile().then((p) => {
      if (p) {
        setName(p.full_name || "");
        setUsername(p.username || "");
      }
    });
  }, []);

  const toggleSelectHabit = (idx: number) => {
    setSelectedHabits((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // 1. Update Profile
      await StreaklyService.updateProfile({
        full_name: name || "Streaker",
        username: username || "streaker_1",
      });

      // 2. Add selected habits
      for (const idx of selectedHabits) {
        const item = SUGGESTED_HABITS[idx];
        await StreaklyService.createHabit({
          title: item.title,
          description: item.description,
          icon: item.icon,
          habit_type: item.type,
          target_value: item.target,
          unit: item.unit,
          frequency: "daily",
          xp_value: item.xp,
        });
      }

      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-[#B6F34A]/50">
              <Image src="/logo.jpg" alt="DO STREAKLY" fill className="object-cover" priority />
            </div>
            <span className="font-display text-xl font-black text-white">
              DO <span className="text-[#B6F34A]">STREAKLY</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`h-1.5 w-12 rounded-full transition-all ${
                step === 1 ? "bg-[#B6F34A]" : "bg-[#202E24]"
              }`}
            />
            <span
              className={`h-1.5 w-12 rounded-full transition-all ${
                step === 2 ? "bg-[#B6F34A]" : "bg-[#202E24]"
              }`}
            />
          </div>
        </div>

        <Card className="border-[#202E24] bg-[#121814] p-6 md:p-8">
          <CardContent className="p-0">
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">
                    What should we call you?
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Your name and handle shown on challenge leaderboards and to friends.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Display Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Username
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alex_streaker"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Skip onboarding
                  </button>
                  <Button
                    onClick={() => setStep(2)}
                    className="gap-2 shadow-glow"
                  >
                    <span>Next: Choose Habits</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">
                    What habits do you want to build?
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Select a few starter habits. You can always customize or add more later.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {SUGGESTED_HABITS.map((item, idx) => {
                    const isSelected = selectedHabits.includes(idx);
                    return (
                      <div
                        key={item.title}
                        onClick={() => toggleSelectHabit(idx)}
                        className={`cursor-pointer rounded-xl border p-3 flex items-start justify-between gap-2 transition-all ${
                          isSelected
                            ? "border-[#B6F34A] bg-[#1F2E25] shadow-glow-sm"
                            : "border-[#202E24] bg-[#0B0F0D] hover:border-[#2C3F32]"
                        }`}
                      >
                        <div>
                          <h4 className="font-display text-sm font-bold text-white">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {item.description}
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold text-[#B6F34A]">
                            +{item.xp} XP
                          </span>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-[#B6F34A] text-[#0B0F0D]" : "border border-[#202E24]"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#202E24]">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                  <Button
                    onClick={handleFinish}
                    disabled={saving}
                    className="gap-2 shadow-glow"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{saving ? "Setting up..." : "Launch DO STREAKLY"}</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
