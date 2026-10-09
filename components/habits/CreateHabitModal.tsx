'use client';

import { useState } from 'react';
import type { CreateHabitInput, HabitType, HabitSchedule } from '@/types';

const ICONS = ['🔥','💪','📖','🏃','🧘','💧','🥗','⚡','🎯','🌅','💤','🚴','✍️','🧠','🎵'];

interface CreateHabitModalProps {
  onClose: () => void;
  onCreate: (input: CreateHabitInput) => Promise<void>;
  initial?: Partial<CreateHabitInput> & { id?: string };
}

export default function CreateHabitModal({ onClose, onCreate, initial }: CreateHabitModalProps) {
  const [name,     setName]     = useState(initial?.name     ?? '');
  const [icon,     setIcon]     = useState(initial?.icon     ?? '🔥');
  const [type,     setType]     = useState<HabitType>(initial?.type ?? 'fixed');
  const [unit,     setUnit]     = useState(initial?.unit     ?? 'reps');
  const [goal,     setGoal]     = useState<number>(initial?.goal ?? 10);
  const [schedule, setSchedule] = useState<HabitSchedule>(initial?.schedule ?? 'daily');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Habit name is required'); return; }
    setLoading(true);
    setError('');
    try {
      await onCreate({ name: name.trim(), icon, type, unit, goal, schedule });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-md bg-surface-container rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-space-md shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="font-headline-md text-headline-md text-on-surface">
            {initial?.id ? 'Edit Habit' : 'New Habit'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Icon picker */}
        <div>
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Icon</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                  icon === ic
                    ? 'bg-primary-fixed text-on-primary scale-110'
                    : 'bg-surface-container-high text-on-surface hover:scale-110'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. No Junk Food"
            className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed transition-colors"
          />
        </div>

        {/* Type toggle */}
        <div>
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Type</label>
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/60 mt-1">
            {(['fixed', 'variable'] as HabitType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-center rounded-lg font-body-bold text-body-bold transition-all ${
                  type === t
                    ? 'bg-primary-fixed text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === 'fixed' ? '✅ Fixed (pass/fail)' : '📊 Variable (count)'}
              </button>
            ))}
          </div>
        </div>

        {/* Variable options */}
        {type === 'variable' && (
          <div className="flex gap-space-sm">
            <div className="flex-1">
              <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Goal</label>
              <input
                type="number"
                min={1}
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
                className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-fixed transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="reps / min / km"
                className="mt-1 w-full bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary-fixed transition-colors"
              />
            </div>
          </div>
        )}

        {/* Schedule */}
        <div>
          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">Schedule</label>
          <div className="relative mt-1">
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value as HabitSchedule)}
              className="w-full appearance-none bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-fixed cursor-pointer pr-10"
            >
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays (Mon–Fri)</option>
              <option value="weekends">Weekends (Sat–Sun)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2.5 text-on-surface-variant text-[20px]">expand_more</span>
          </div>
        </div>

        {error && (
          <p className="font-label-sm text-label-sm text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary-fixed text-on-primary font-body-bold text-body-bold hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {loading ? 'Saving…' : initial?.id ? 'Save Changes' : 'Create Habit'}
        </button>
      </form>
    </div>
  );
}
