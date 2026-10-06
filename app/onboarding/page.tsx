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
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { TimeOfDay } from "@/types";

const SUGGESTED_HABITS = [
  {
    name: "Morning 5km Run",
    description: "Daily cardio engine before breakfast",
    icon: "Footprints",
    type: "measurable" as const,
    goal: 5,
    unit: "km",
    time_of_day: "morning" as TimeOfDay,
    use_timer: false,
    benefit: "Cardio & Stamina",
  },
  {
    name: "Cold Shower / Wakeup",
    description: "Jumpstart your focus and morning discipline",
    icon: "AlarmClock",
    type: "yes_no" as const,
    goal: 1,
    unit: "time",
    time_of_day: "morning" as TimeOfDay,
    use_timer: false,
    benefit: "Mental Sharpness",
  },
  {
    name: "Read Non-Fiction Book",
    description: "Daily reading & continuous learning",
    icon: "BookOpen",
    type: "measurable" as const,
    goal: 20,
    unit: "pages",
    time_of_day: "afternoon" as TimeOfDay,
    use_timer: false,
    benefit: "Knowledge & Focus",
  },
  {
    name: "50 Push-Ups",
    description: "Upper body strength and muscle tone",
    icon: "Dumbbell",
    type: "measurable" as const,
    goal: 50,
    unit: "reps",
    time_of_day: "morning" as TimeOfDay,
    use_timer: false,
    benefit: "Physical Strength",
  },
  {
    name: "Deep Work Sprint (Timer)",
    description: "25-minute flow state block with timer",
    icon: "Brain",
    type: "measurable" as const,
    goal: 25,
    unit: "mins",
    time_of_day: "afternoon" as TimeOfDay,
    use_timer: true,
    timer_duration_seconds: 1500,
    benefit: "Peak Productivity",
  },
  {
    name: "Evening Reflection & Notes",
    description: "Review today's wins and set tomorrow's priority",
    icon: "Moon",
    type: "yes_no" as const,
    goal: 1,
    unit: "time",
    time_of_day: "evening" as TimeOfDay,
    use_timer: false,
    benefit: "Mindful Recovery",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [wakeTime, setWakeTime] = useState("06:30 AM");
  const [selectedHabits, setSelectedHabits] = useState<number[]>([0, 1, 4]); // First habit selected by default
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
      // 1. Update Profile & mark tutorial ready to trigger on Today
      await StreaklyService.updateProfile({
        full_name: name.trim() || "Streaker",
        username: username.trim() || "streaker_1",
        tutorial_done: false, // ensures App Tutorial triggers
      });

      // 2. Save onboarding targets
      const chosenHabits = (selectedHabits.length > 0 ? selectedHabits : [0]).map(
        (i) => SUGGESTED_HABITS[i]
      );

      await StreaklyService.saveOnboarding({
        wake_time: wakeTime,
        targets: chosenHabits.map((h) => h.name),
      });

      // 3. Clear existing habits and add chosen ones
      for (const item of chosenHabits) {
        await StreaklyService.createHabit({
          name: item.name,
          title: item.name,
          description: item.description,
          icon: item.icon,
          type: item.type,
          goal: item.goal,
          unit: item.unit,
          time_of_day: item.time_of_day,
          use_timer: item.use_timer,
          timer_duration_seconds: item.timer_duration_seconds,
          frequency: "daily",
        });
      }

      // 4. Land on Today with tutorial
      router.push("/dashboard");
    } catch (e) {
      console.error("Onboarding error:", e);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-[#B6F34A]/50 shadow-glow-sm">
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

        <Card className="border-[#202E24] bg-[#121814] p-6 md:p-8 rounded-2xl shadow-xl">
          <CardContent className="p-0">
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">
                    Set up your daily profile
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Takes under 60 seconds to personalize your morning routine.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Your Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="bg-[#0B0F0D] border-[#202E24] focus:border-[#B6F34A] text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Username / Handle
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. alex_streaker"
                      className="bg-[#0B0F0D] border-[#202E24] focus:border-[#B6F34A] text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Typical Wake-up Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        placeholder="06:30 AM"
                        className="bg-[#0B0F0D] border-[#202E24] focus:border-[#B6F34A] text-white pl-9"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Helps categorize morning habits for maximum consistency.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Skip to Today
                  </button>
                  <Button
                    onClick={() => setStep(2)}
                    className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold shadow-glow-sm"
                  >
                    <span>Choose Habits</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">
                    Pick your starter habits
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Your first habit will land on your Today screen ready to track.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {SUGGESTED_HABITS.map((item, idx) => {
                    const isSelected = selectedHabits.includes(idx);
                    return (
                      <div
                        key={item.name}
                        onClick={() => toggleSelectHabit(idx)}
                        className={`cursor-pointer rounded-xl border p-3 flex items-start justify-between gap-2 transition-all ${
                          isSelected
                            ? "border-[#B6F34A] bg-[#1F2E25] shadow-glow-sm"
                            : "border-[#202E24] bg-[#0B0F0D] hover:border-[#2C3F32]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] uppercase font-bold text-[#B6F34A] px-1.5 py-0.5 rounded bg-[#B6F34A]/10">
                              {item.time_of_day}
                            </span>
                            {item.use_timer && (
                              <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10">
                                ⏱️ Timer
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-sm font-bold text-white">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {item.description}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-gray-400">
                            {item.benefit}
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
                    className="gap-2 bg-[#B6F34A] text-[#0B0F0D] hover:bg-[#a3e635] font-bold shadow-glow-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{saving ? "Setting up..." : "Launch Today"}</span>
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
