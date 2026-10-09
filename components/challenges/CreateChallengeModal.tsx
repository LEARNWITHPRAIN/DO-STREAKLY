'use client';

import { useState } from 'react';
import type { CreateChallengeInput, HabitType } from '@/types';

interface HabitDraft {
  name:   string;
  icon:   string;
  type:   HabitType;
  unit:   string;
  goal:   number;
  points: number;
}

interface CreateChallengeModalProps {
  onClose:  () => void;
  onCreate: (input: CreateChallengeInput) => Promise<void>;
}

const ICONS = ['🔥','💪','📖','🏃','🧘','💧','🥗','⚡','🎯','🌅'];

export default function CreateChallengeModal({ onClose, onCreate }: CreateChallengeModalProps) {
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [duration,    setDuration]    = useState(30);
  const [startDate,   setStartDate]   = useState(new Date().toISOString().split('T')[0]);
  const [habits,      setHabits]      = useState<HabitDraft[]>([
    { name: '', icon: '🔥', type: 'fixed', unit: 'reps', goal: 1, points: 10 }
  ]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  function addHabit() {
    setHabits((prev) => [...prev, { name: '', icon: '⚡', type: 'fixed', unit: 'reps', goal: 1, points: 10 }]);
  }

  function removeHabit(idx: number) {
    setHabits((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateHabit(idx: number, field: keyof HabitDraft, value: string | number) {
    setHabits((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Challenge name required'); return; }
    if (habits.some((h) => !h.name.trim())) { setError('All habit names required'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        duration_days: duration,
        start_date: startDate,
        habits: habits.map((h) => ({
          name: h.name.trim(),
          icon: h.icon,
          type: h.type,
          unit: h.unit,
          goal: h.goal,
          points: h.points,
        })),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-md bg-surface-container rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-space-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <span className="font-headline-md text-headline-md text-on-surface">New Challenge</span>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Challenge Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="30-Day Morning Crucible"
            className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed"
          />
        </div>

        {/* Description */}
        <div>
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this challenge about?"
            className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed resize-none"
          />
        </div>

        {/* Duration + Start */}
        <div className="flex gap-space-sm">
          <div className="flex-1">
            <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Duration (days)</label>
            <input
              type="number"
              min={7}
              max={365}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-fixed"
            />
          </div>
          <div className="flex-1">
            <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-fixed"
            />
          </div>
        </div>

        {/* Habits */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Bundled Habits</span>
            <button type="button" onClick={addHabit}
              className="flex items-center gap-1 text-primary-fixed font-body-bold text-body-bold">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add
            </button>
          </div>

          {habits.map((h, idx) => (
            <div key={idx} className="flex flex-col gap-2 bg-surface-container-high p-3 rounded-xl border border-outline-variant/40">
              <div className="flex items-center gap-2">
                {/* Icon */}
                <select
                  value={h.icon}
                  onChange={(e) => updateHabit(idx, 'icon', e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg px-2 py-2 text-base focus:outline-none"
                >
                  {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                {/* Name */}
                <input
                  type="text"
                  value={h.name}
                  onChange={(e) => updateHabit(idx, 'name', e.target.value)}
                  placeholder="Habit name"
                  className="flex-1 bg-surface-container border border-outline-variant rounded-lg px-2 py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed"
                />
                {habits.length > 1 && (
                  <button type="button" onClick={() => removeHabit(idx)}
                    className="text-error hover:text-error/80">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {/* Type */}
                <select
                  value={h.type}
                  onChange={(e) => updateHabit(idx, 'type', e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 font-body-md text-body-md text-on-surface focus:outline-none text-sm"
                >
                  <option value="fixed">Fixed</option>
                  <option value="variable">Variable</option>
                </select>
                {h.type === 'variable' && (
                  <>
                    <input
                      type="number"
                      min={1}
                      value={h.goal}
                      onChange={(e) => updateHabit(idx, 'goal', Number(e.target.value))}
                      placeholder="Goal"
                      className="w-16 bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 font-body-md text-body-md text-on-surface focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={h.unit}
                      onChange={(e) => updateHabit(idx, 'unit', e.target.value)}
                      placeholder="unit"
                      className="w-16 bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 font-body-md text-body-md text-on-surface focus:outline-none text-sm"
                    />
                  </>
                )}
                <input
                  type="number"
                  min={1}
                  value={h.points}
                  onChange={(e) => updateHabit(idx, 'points', Number(e.target.value))}
                  title="Points per completion"
                  className="w-14 bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 font-body-md text-body-md text-on-surface focus:outline-none text-sm"
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant self-center">pts</span>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary-fixed text-on-primary font-body-bold text-body-bold hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
}
