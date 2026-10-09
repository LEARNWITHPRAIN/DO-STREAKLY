'use client';

import { useState } from 'react';
import type { Habit } from '@/types';

interface HabitCardProps {
  habit: Habit;
  onToggle:   (id: string, value: number) => Promise<void>;
  onIncrement: (id: string, step: number) => Promise<void>;
  onEdit:     (habit: Habit) => void;
  onDelete:   (id: string) => Promise<void>;
}

export default function HabitCard({ habit, onToggle, onIncrement, onEdit, onDelete }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isFixed    = habit.type === 'fixed';
  const completed  = habit.completed_today ?? false;
  const progress   = habit.today_value ?? 0;
  const pct        = isFixed ? (completed ? 100 : 0) : Math.min(100, Math.round((progress / habit.goal) * 100));
  const streak     = habit.current_streak ?? 0;

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      await onToggle(habit.id, completed ? 0 : 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleStep(delta: number) {
    if (loading) return;
    setLoading(true);
    try {
      await onIncrement(habit.id, delta);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (loading) return;
    setLoading(true);
    try {
      await onDelete(habit.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative flex flex-col bg-surface-container rounded-xl shadow-sm overflow-hidden transition-all ${
        completed ? 'ring-1 ring-primary-fixed/40' : ''
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between px-space-md pt-space-md pb-2">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="text-xl flex-shrink-0">{habit.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-body-bold text-body-bold text-on-surface truncate">{habit.name}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {isFixed
                ? 'Daily pass'
                : `${progress} / ${habit.goal} ${habit.unit}`}
              {streak > 0 && (
                <span className="ml-2 text-primary-fixed">🔥 {streak}d</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-9 z-20 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg min-w-[140px] overflow-hidden"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(habit); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span className="font-body-md text-body-md">Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-error hover:bg-error-container/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span className="font-body-md text-body-md">Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Fixed: toggle check */}
          {isFixed && (
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                completed
                  ? 'bg-primary-fixed text-on-primary'
                  : 'bg-surface-container-high border border-outline-variant text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={completed ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                check
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Variable: stepper + progress bar */}
      {!isFixed && (
        <div className="flex items-center gap-space-sm px-space-md pb-space-md">
          <button
            onClick={() => handleStep(-1)}
            disabled={loading || progress <= 0}
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-40 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background: completed ? '#b4f700' : 'rgba(180,247,0,0.6)',
                }}
              />
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant text-center uppercase tracking-wide">
              {pct}%
            </span>
          </div>

          <button
            onClick={() => handleStep(1)}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>

          {/* Mark done shortcut */}
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              completed
                ? 'bg-primary-fixed text-on-primary'
                : 'bg-surface-container-high border border-outline-variant text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={completed ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              check
            </span>
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-surface-container/50 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-fixed animate-spin text-[24px]">progress_activity</span>
        </div>
      )}
    </div>
  );
}
