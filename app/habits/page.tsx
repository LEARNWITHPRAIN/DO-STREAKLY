"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { HabitCard } from "@/components/habits/HabitCard";
import { CreateHabitModal } from "@/components/habits/CreateHabitModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StreaklyService } from "@/lib/services/streaklyService";
import { Habit } from "@/types";
import { Plus, Sparkles, Filter, Calendar } from "lucide-react";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHabits = async () => {
    try {
      const data = await StreaklyService.getHabits();
      setHabits(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleComplete = async (habitId: string, increment?: number) => {
    const res = await StreaklyService.completeHabit(habitId, increment);
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? res.habit : h))
    );
    return res;
  };

  const filteredHabits = habits.filter((h) => {
    if (filter === "completed") return h.is_completed_today;
    if (filter === "pending") return !h.is_completed_today;
    if (filter === "measurable") return h.habit_type === "measurable";
    if (filter === "boolean") return h.habit_type === "boolean";
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight">
              Habits & Streaks
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Build daily discipline, track measurable goals, and keep your streaks blazing.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 shadow-glow"
          >
            <Plus className="h-4 w-4" />
            <span>Create Habit</span>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202E24] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Habits" },
              { id: "pending", label: "Pending Today" },
              { id: "completed", label: "Completed" },
              { id: "measurable", label: "Measurable" },
              { id: "boolean", label: "Yes / No" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? "bg-[#17211B] text-[#B6F34A] border border-[#2C3F32] shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#121814]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-white">{filteredHabits.length}</strong> habits
          </div>
        </div>

        {/* Habits Grid / List */}
        {filteredHabits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#202E24] p-12 text-center bg-[#121814]/40">
            <Sparkles className="h-10 w-10 text-[#B6F34A] mx-auto mb-3 opacity-60" />
            <h3 className="font-display text-base font-bold text-white">No habits match this filter</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Ready to start something new? Create a habit to start building your streak!
            </p>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              Create Habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleComplete}
                onUndo={async (id) => {
                  const updated = await StreaklyService.undoHabit(id);
                  setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
                }}
              />
            ))}
          </div>
        )}

        {/* 7-Day Consistency Heatmap / Calendar preview */}
        <div className="rounded-2xl border border-[#202E24] bg-[#121814] p-5 md:p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#B6F34A]" />
              <h3 className="font-display text-base font-bold text-white">
                Recent 7-Day Habit Activity
              </h3>
            </div>
            <span className="text-xs text-gray-400">Current Week</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const isToday = i === 4; // demo Friday
              const isCompleted = i <= 4;
              return (
                <div
                  key={day}
                  className={`rounded-xl p-3 border transition-colors ${
                    isToday
                      ? "border-[#B6F34A] bg-[#1F2E25]"
                      : isCompleted
                      ? "border-[#2C3F32] bg-[#17211B]"
                      : "border-[#202E24] bg-[#0B0F0D]"
                  }`}
                >
                  <p className="text-[11px] font-bold text-gray-400 mb-1">{day}</p>
                  <div
                    className={`h-4 w-4 rounded-full mx-auto flex items-center justify-center ${
                      isCompleted ? "bg-[#B6F34A] text-[#0B0F0D]" : "bg-[#202E24]"
                    }`}
                  >
                    {isCompleted && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateHabitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onHabitCreated={(newHabit) => setHabits((prev) => [...prev, newHabit])}
      />
    </AppShell>
  );
}
